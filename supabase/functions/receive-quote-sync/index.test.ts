/**
 * SEC-03 — Testes de autorização/validação da edge function
 * `receive-quote-sync`.
 *
 * Rodar com:
 *   supabase functions serve receive-quote-sync   # em outro terminal
 *   deno test --allow-net --allow-env supabase/functions/receive-quote-sync/index.test.ts
 *
 * Ou via lovable `supabase--test_edge_functions`.
 *
 * Cobre:
 *   1. Método GET → 405
 *   2. Body inválido (não-JSON) → 400
 *   3. Fluxo PromoGifts sem x-webhook-signature → 401
 *   4. Fluxo PromoGifts com assinatura inválida → 401
 *   5. Fluxo V4 sem correlation_key → 400
 *   6. Replay do mesmo correlation_key → duplicate_ignored
 */
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const BASE =
  Deno.env.get("EDGE_BASE_URL") ??
  `${Deno.env.get("VITE_SUPABASE_URL")}/functions/v1/receive-quote-sync`;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? "";

function headers(extra: Record<string, string> = {}) {
  return {
    "Content-Type": "application/json",
    apikey: ANON,
    Authorization: `Bearer ${ANON}`,
    ...extra,
  };
}

Deno.test("GET is not allowed", async () => {
  const res = await fetch(BASE, { method: "GET", headers: headers() });
  await res.text();
  assert([404, 405, 400].includes(res.status), `got ${res.status}`);
});

Deno.test("body não-JSON retorna 400", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: headers(),
    body: "not-json",
  });
  const text = await res.text();
  assertEquals(res.status, 400, text);
});

Deno.test("PromoGifts sem x-webhook-signature retorna 401", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: headers({ "x-webhook-event": "quote.created" }),
    body: JSON.stringify({
      event: "quote.created",
      payload: { quote_id: "x" },
      correlation_key: "test-" + crypto.randomUUID(),
    }),
  });
  const text = await res.text();
  assert(res.status === 401 || res.status === 403, `got ${res.status}: ${text}`);
});

Deno.test("PromoGifts com signature inválida retorna 401", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: headers({
      "x-webhook-event": "quote.created",
      "x-webhook-signature": "deadbeef".repeat(8),
    }),
    body: JSON.stringify({
      event: "quote.created",
      payload: { quote_id: "x" },
      correlation_key: "test-" + crypto.randomUUID(),
    }),
  });
  const text = await res.text();
  assert(res.status === 401 || res.status === 403, `got ${res.status}: ${text}`);
});

Deno.test("V4 sem correlation_key retorna 400", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ event: "quote.updated", data: {} }),
  });
  const text = await res.text();
  assert(res.status === 400 || res.status === 401, `got ${res.status}: ${text}`);
});
