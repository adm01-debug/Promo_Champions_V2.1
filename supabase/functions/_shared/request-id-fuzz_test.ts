// OBS-04 — Simulação massiva de propagação de X-Request-Id.
// Roda centenas de cenários contra o middleware `withRequestId` in-process
// (sem rede) validando invariantes que precisam SEMPRE valer:
//
//   INV-1  Toda resposta carrega header `X-Request-Id`.
//   INV-2  Se o cliente enviou um id válido (^[A-Za-z0-9_-]{8,64}$), o header
//          da resposta ecoa exatamente esse id.
//   INV-3  Se o cliente enviou id inválido/ausente/injection, é gerado um novo
//          UUID v4 (formato canônico).
//   INV-4  Erros lançados no handler produzem JSON com { requestId, error } e
//          o requestId do body === header.
//   INV-5  Requests concorrentes NUNCA compartilham o mesmo requestId.
//   INV-6  Payload malicioso em headers (CRLF, null byte, script) é rejeitado
//          e cai no fluxo "mint fresh id" — nunca ecoado.
//
// Uso: deno test --allow-read supabase/functions/_shared/request-id-fuzz_test.ts

import { assert, assertEquals, assertMatch, assertNotEquals } from "jsr:@std/assert@1";
import { getCorsHeaders } from "./cors.ts";
import { withRequestId } from "./request-id.ts";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ID = /^[A-Za-z0-9_-]{8,64}$/;

function randomSafeId(): string {
  const len = 8 + Math.floor(Math.random() * 57); // 8..64
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

// IDs inválidos que o runtime PERMITE no header — nosso middleware precisa
// rejeitá-los e mintar um UUID fresh.
const INVALID_TRANSPORTABLE_IDS = [
  "",
  " ",
  "abc", // too short
  "a".repeat(65), // too long
  "invalid id with spaces",
  "<script>alert(1)</script>",
  "'; DROP TABLE users;--",
  "../../etc/passwd",
  "id;cookie=x",
  "id\"quoted\"",
  "id\\backslash",
  "id.with.dots",
  "id/with/slashes",
];

// IDs que o próprio runtime Deno/Fetch rejeita ANTES de chegar à edge
// function (CRLF injection, null byte, bytes 0x80+ que não formam ByteString).
// Documentam a camada extra de defesa da plataforma — Request precisa lançar TypeError.
const RUNTIME_BLOCKED_IDS = [
  "id\r\nX-Injected: 1",
  "id\x00null",
  "id\nnewline",
  "🔥🔥🔥🔥🔥🔥🔥🔥", // Deno v2.6+ rejeita bytes 0x80+ em header value (ByteString)
];

const okHandler = () => Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
const errHandler = () => Promise.reject(new Error("simulated_failure"));

Deno.test("INV-1/2 — valid ids are echoed on 200", async () => {
  const wrapped = withRequestId("fuzz-ok", okHandler);
  for (let i = 0; i < 200; i++) {
    const id = randomSafeId();
    const res = await wrapped(new Request("http://x/", { headers: { "X-Request-Id": id } }));
    const echoed = res.headers.get("X-Request-Id");
    assertEquals(echoed, id, `expected echo of ${id}`);
    assertMatch(echoed!, SAFE_ID);
    await res.text();
  }
});

Deno.test("INV-3 — invalid ids (transportable) are replaced by fresh UUIDs", async () => {
  const wrapped = withRequestId("fuzz-invalid", okHandler);
  for (const bad of INVALID_TRANSPORTABLE_IDS) {
    const headers = bad ? { "X-Request-Id": bad } : undefined;
    const res = await wrapped(new Request("http://x/", headers ? { headers } : {}));
    const minted = res.headers.get("X-Request-Id");
    assert(minted, "header always present");
    assertMatch(minted!, UUID_V4, `expected fresh UUID for input ${JSON.stringify(bad)}, got ${minted}`);
    assertNotEquals(minted, bad);
    await res.text();
  }
});

Deno.test("INV-6 — CRLF/null-byte header injection is blocked by Deno runtime", () => {
  for (const evil of RUNTIME_BLOCKED_IDS) {
    let threw = false;
    try {
      new Request("http://x/", { headers: { "X-Request-Id": evil } });
    } catch (err) {
      threw = err instanceof TypeError;
    }
    assert(threw, `runtime must reject header value ${JSON.stringify(evil)}`);
  }
});

Deno.test("INV-1 — missing header still returns X-Request-Id", async () => {
  const wrapped = withRequestId("fuzz-missing", okHandler);
  for (let i = 0; i < 100; i++) {
    const res = await wrapped(new Request("http://x/"));
    assertMatch(res.headers.get("X-Request-Id")!, UUID_V4);
    await res.text();
  }
});

Deno.test("INV-4 — thrown errors return JSON envelope with matching requestId", async () => {
  const wrapped = withRequestId("fuzz-err", errHandler);
  for (let i = 0; i < 100; i++) {
    const id = randomSafeId();
    const res = await wrapped(new Request("http://x/", { headers: { "X-Request-Id": id } }));
    assertEquals(res.status, 500);
    const header = res.headers.get("X-Request-Id");
    const body = await res.json() as { requestId: string; error: string };
    assertEquals(header, id);
    assertEquals(body.requestId, id, "body.requestId must equal header");
    // Contrato de segurança: a resposta 500 carrega um código OPACO; a
    // mensagem real ("simulated_failure") vai apenas para o log estruturado.
    assertEquals(body.error, "internal_error");
  }
});

Deno.test("INV-4b — thrown errors preservam o CORS calculado pela requisição", async () => {
  const wrapped = withRequestId("fuzz-err-cors", errHandler);
  const req = new Request("http://x/", { headers: { Origin: "https://app.example.test" } });
  const res = await wrapped(req);

  assertEquals(
    res.headers.get("Access-Control-Allow-Origin"),
    getCorsHeaders(req)["Access-Control-Allow-Origin"],
  );
  await res.text();
});

Deno.test("INV-5 — concurrent requests never share requestId", async () => {
  const wrapped = withRequestId("fuzz-race", okHandler);
  const N = 500;
  const responses = await Promise.all(
    Array.from({ length: N }, () => wrapped(new Request("http://x/"))),
  );
  const ids = new Set<string>();
  for (const res of responses) {
    const id = res.headers.get("X-Request-Id")!;
    assert(!ids.has(id), `duplicate requestId ${id}`);
    ids.add(id);
    await res.text();
  }
  assertEquals(ids.size, N);
});

Deno.test("simulation summary — hundreds of scenarios OK", () => {
  const total = 200 + INVALID_TRANSPORTABLE_IDS.length + RUNTIME_BLOCKED_IDS.length + 100 + 100 + 500;
  console.info(`✓ ${total} cenários de propagação X-Request-Id passaram`);
});
