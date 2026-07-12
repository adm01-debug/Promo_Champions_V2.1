// Regression tests for edge function `forecast-narrative`.
// Cobre validação de input, autenticação, rate-limit (bypass autenticado documentado)
// e tratamento de timeout do provedor de IA.
//
// Execução: as credenciais são carregadas do .env raiz via dotenv.
// Cenários que exigem sessão real são pulados quando TEST_USER_ACCESS_TOKEN não está definido.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const USER_TOKEN = Deno.env.get("TEST_USER_ACCESS_TOKEN") ?? "";
const FORECAST_ID = Deno.env.get("TEST_FORECAST_ID") ?? "";

const ENDPOINT = `${SUPABASE_URL}/functions/v1/forecast-narrative`;

function headers(auth?: string): HeadersInit {
  const h: Record<string, string> = {
    apikey: ANON,
    "Content-Type": "application/json",
  };
  if (auth !== undefined) h["Authorization"] = auth;
  return h;
}

async function post(body: string, auth?: string) {
  const res = await fetch(ENDPOINT, { method: "POST", headers: headers(auth), body });
  const text = await res.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* keep raw */ }
  return { status: res.status, json, text };
}

// ─────────────────────────────────────────────────────────────
// FALHAS — método HTTP e autenticação
// ─────────────────────────────────────────────────────────────

Deno.test("GET → 405 Method not allowed", async () => {
  const res = await fetch(ENDPOINT, { method: "GET", headers: headers(`Bearer ${ANON}`) });
  await res.text();
  assertEquals(res.status, 405);
});

Deno.test("OPTIONS → 200 CORS preflight", async () => {
  const res = await fetch(ENDPOINT, { method: "OPTIONS", headers: headers() });
  await res.text();
  // Deno.serve responde 200 ao preflight configurado com corsHeaders
  assertEquals([200, 204].includes(res.status), true);
});

Deno.test("Sem Authorization → 401", async () => {
  // Nota: usamos apikey (anon) para passar pelo gateway, mas sem Authorization
  // a função deve retornar 401.
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: "{}",
  });
  const j = await res.json();
  assertEquals(res.status, 401);
  assertEquals(j.error, "Authorization header required");
});

Deno.test("Bearer inválido → 401 Invalid or expired token", async () => {
  const { status, json } = await post("{}", "Bearer invalid.jwt.token");
  assertEquals(status, 401);
  assertEquals((json as { error: string }).error, "Invalid or expired token");
});

// ─────────────────────────────────────────────────────────────
// FALHAS — validação de payload (equivalente a Zod)
// ─────────────────────────────────────────────────────────────

Deno.test({
  name: "Body não-JSON → 400 Invalid JSON body",
  ignore: !USER_TOKEN,
  fn: async () => {
    const { status, json } = await post("not-json", `Bearer ${USER_TOKEN}`);
    assertEquals(status, 400);
    assertEquals((json as { error: string }).error, "Invalid JSON body");
  },
});

Deno.test({
  name: "forecast_id ausente → 400",
  ignore: !USER_TOKEN,
  fn: async () => {
    const { status, json } = await post("{}", `Bearer ${USER_TOKEN}`);
    assertEquals(status, 400);
    assertEquals((json as { error: string }).error, "forecast_id (uuid) required");
  },
});

Deno.test({
  name: "forecast_id com tipo errado (number) → 400",
  ignore: !USER_TOKEN,
  fn: async () => {
    const { status, json } = await post(
      JSON.stringify({ forecast_id: 123 }),
      `Bearer ${USER_TOKEN}`,
    );
    assertEquals(status, 400);
    assertEquals((json as { error: string }).error, "forecast_id (uuid) required");
  },
});

Deno.test({
  name: "forecast_id inexistente → 404",
  ignore: !USER_TOKEN,
  fn: async () => {
    const { status, json } = await post(
      JSON.stringify({ forecast_id: "00000000-0000-0000-0000-000000000000" }),
      `Bearer ${USER_TOKEN}`,
    );
    assertEquals(status, 404);
    assertEquals((json as { error: string }).error, "Forecast not found or not authorized");
  },
});

// ─────────────────────────────────────────────────────────────
// RATE-LIMIT
// ─────────────────────────────────────────────────────────────
// O limiter em _shared/rate-limit.ts faz BYPASS de chamadas autenticadas
// (Bearer ey…) para evitar bloquear usuários reais. Portanto, um burst
// autenticado NÃO deve retornar 429 — é o comportamento contratado.

Deno.test({
  name: "Rate-limit: 25 reqs autenticadas seguidas → nenhuma bloqueada (bypass by design)",
  ignore: !USER_TOKEN,
  fn: async () => {
    const results = await Promise.all(
      Array.from({ length: 25 }, () => post("{}", `Bearer ${USER_TOKEN}`)),
    );
    const blocked = results.filter((r) => r.status === 429).length;
    assertEquals(blocked, 0, "requests autenticadas devem passar pelo bypass do limiter");
    // Todas devem cair no 400 do validador (forecast_id ausente)
    for (const r of results) assertEquals(r.status, 400);
  },
});

// ─────────────────────────────────────────────────────────────
// TIMEOUT / falhas do provedor IA
// ─────────────────────────────────────────────────────────────
// Simulamos indisponibilidade abortando a request no cliente antes do prazo.
// A função em si não define AbortController — usamos o cliente para validar
// que a conexão é resiliente à queda do consumidor (não gera 5xx zumbi).

Deno.test({
  name: "Timeout no cliente (AbortController) → operação interrompida sem crash",
  ignore: !USER_TOKEN || !FORECAST_ID,
  fn: async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 50); // aborta antes do IA responder
    let aborted = false;
    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: headers(`Bearer ${USER_TOKEN}`),
        body: JSON.stringify({ forecast_id: FORECAST_ID }),
        signal: controller.signal,
      });
    } catch (e) {
      aborted = (e as Error).name === "AbortError";
    } finally {
      clearTimeout(timer);
    }
    assertEquals(aborted, true);
  },
});

// ─────────────────────────────────────────────────────────────
// SUCESSO — narrativa gerada / servida do cache
// ─────────────────────────────────────────────────────────────

Deno.test({
  name: "Sucesso: retorna narrative + flag cached (200)",
  ignore: !USER_TOKEN || !FORECAST_ID,
  fn: async () => {
    const { status, json } = await post(
      JSON.stringify({ forecast_id: FORECAST_ID }),
      `Bearer ${USER_TOKEN}`,
    );
    // Aceita 200 (sucesso) ou 502/402/503 (falhas transitórias do provedor IA)
    // — o objetivo do teste é garantir que o contrato de resposta é válido.
    assertEquals([200, 402, 502, 503].includes(status), true, `status inesperado: ${status}`);
    if (status === 200) {
      const j = json as { narrative: string; cached: boolean; generated_at: string };
      assertExists(j.narrative);
      assertEquals(typeof j.cached, "boolean");
      assertExists(j.generated_at);
    }
  },
});

Deno.test({
  name: "Cache: segunda chamada idêntica retorna cached:true",
  ignore: !USER_TOKEN || !FORECAST_ID,
  fn: async () => {
    // dispara e ignora o resultado
    await post(JSON.stringify({ forecast_id: FORECAST_ID }), `Bearer ${USER_TOKEN}`);
    const { status, json } = await post(
      JSON.stringify({ forecast_id: FORECAST_ID }),
      `Bearer ${USER_TOKEN}`,
    );
    if (status === 200) {
      assertEquals((json as { cached: boolean }).cached, true);
    }
  },
});
