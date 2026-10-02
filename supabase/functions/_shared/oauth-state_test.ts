import {
  createSignedOAuthState,
  verifySignedOAuthState,
} from "./oauth-state.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const SECRET = "segredo-de-teste";

Deno.test("state assinado faz roundtrip e carrega o userId", async () => {
  const state = await createSignedOAuthState("user-123", SECRET, 60_000);
  const parsed = await verifySignedOAuthState(state, SECRET);
  assert(parsed !== null, "state válido deve verificar");
  assert(parsed.userId === "user-123", "userId deve ser preservado");
  assert(parsed.expiresAt > Date.now(), "state não pode estar expirado");
});

Deno.test("state adulterado no payload é rejeitado", async () => {
  const state = await createSignedOAuthState("user-123", SECRET, 60_000);
  const [payload, signature] = state.split(".");

  // Troca o userId no payload sem recomputar a assinatura.
  const raw = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  const tamperedPayload = btoa(raw.replace("user-123", "user-999"))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const tampered = `${tamperedPayload}.${signature}`;
  assert(
    (await verifySignedOAuthState(tampered, SECRET)) === null,
    "payload adulterado deve falhar na assinatura",
  );
});

Deno.test("state com assinatura adulterada é rejeitado", async () => {
  const state = await createSignedOAuthState("user-123", SECRET, 60_000);
  const [payload] = state.split(".");
  assert(
    (await verifySignedOAuthState(`${payload}.AAAA`, SECRET)) === null,
    "assinatura adulterada deve falhar",
  );
  assert(
    (await verifySignedOAuthState(state, "outro-segredo")) === null,
    "segredo errado deve falhar",
  );
});

Deno.test("state expirado, ausente ou malformado é rejeitado", async () => {
  const expired = await createSignedOAuthState("user-123", SECRET, -1_000);
  assert(
    (await verifySignedOAuthState(expired, SECRET)) === null,
    "state expirado deve ser rejeitado",
  );
  assert(
    (await verifySignedOAuthState(null, SECRET)) === null,
    "state ausente deve ser rejeitado",
  );
  assert(
    (await verifySignedOAuthState("nao-e-um-state", SECRET)) === null,
    "state malformado deve ser rejeitado",
  );
  assert(
    (await verifySignedOAuthState("abc.def.ghi", SECRET)) === null,
    "state com segmentos extras deve ser rejeitado",
  );
});
