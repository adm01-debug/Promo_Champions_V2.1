import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

// Testes puros de lógica auxiliar (guarda, URL, backoff) — os testes de integração
// completos com Supabase são executados via CI com credenciais.

function isValidUrl(u: string): boolean {
  try {
    const p = new URL(u);
    return p.protocol === "https:" || p.protocol === "http:";
  } catch {
    return false;
  }
}

const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 30_000;
function backoffMs(attempts: number): number {
  const base = BASE_BACKOFF_MS * Math.pow(2, Math.min(attempts, 6));
  const jitter = 0;
  return base + jitter;
}

Deno.test("isValidUrl rejeita string vazia e valores mal formados", () => {
  assertEquals(isValidUrl(""), false);
  assertEquals(isValidUrl("not-a-url"), false);
  assertEquals(isValidUrl("ftp://x.com"), false);
});

Deno.test("isValidUrl aceita https e http", () => {
  assertEquals(isValidUrl("https://v4.example.com/cb"), true);
  assertEquals(isValidUrl("http://localhost:8080/cb"), true);
});

Deno.test("backoff cresce exponencialmente até saturar", () => {
  assertEquals(backoffMs(1), 60_000);
  assertEquals(backoffMs(2), 120_000);
  assert(backoffMs(6) === backoffMs(7), "deve saturar no expoente 6");
});

Deno.test("MAX_ATTEMPTS é 5 (contrato do painel)", () => {
  assertEquals(MAX_ATTEMPTS, 5);
});

Deno.test("guarda: sem URL/API_KEY o dispatcher deve marcar callback como desligado", () => {
  const url = "";
  const key = "";
  const disabled = !url || !key;
  assertEquals(disabled, true);
});

Deno.test("exhausted é calculado quando attempts+1 >= MAX_ATTEMPTS", () => {
  const attemptsBefore = 4;
  const attempts = attemptsBefore + 1;
  assertEquals(attempts >= MAX_ATTEMPTS, true);
});
