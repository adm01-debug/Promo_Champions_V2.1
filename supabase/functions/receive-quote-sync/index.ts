// receive-quote-sync
// Inbound webhook (server-to-server) recebendo quotes de sistemas externos
// (ex.: Promo Gifts V4). Fluxo:
//   1. CORS liberado (POST/OPTIONS)
//   2. Valida x-webhook-signature = HMAC-SHA256(rawBody, QUOTE_SYNC_WEBHOOK_SECRET)
//   3. Lê { event, data, correlation_key }
//   4. Insere correlation_key em webhook_inbound_dedupe — se conflitar, retorna 200 duplicate_ignored
//   5. Faz upsert em `quotes` pelo external_quote_id (idempotente)
//
// Aceita `event = "quote.sent" | "quote.updated" | "quote.approved" | ...`
// Payload esperado (data):
//   {
//     external_quote_id: string (obrigatório),
//     title, client_name, client_email, client_phone, seller_name,
//     total_value, subtotal, discount_percent, discount_amount, currency,
//     status, valid_until, quote_number, items, notes, external_reference,
//     external_seller_id, pdf_url
//   }

import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const encoder = new TextEncoder();

async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Whitelist de colunas mapeadas para upsert seguro em `quotes`.
const QUOTE_COLUMNS = [
  "title",
  "description",
  "client_name",
  "client_email",
  "client_phone",
  "seller_name",
  "total_value",
  "subtotal",
  "discount_percent",
  "discount_amount",
  "currency",
  "status",
  "valid_until",
  "quote_number",
  "items",
  "notes",
  "external_reference",
  "external_seller_id",
  "pdf_url",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const secret = Deno.env.get("QUOTE_SYNC_WEBHOOK_SECRET");
  if (!secret) {
    console.error("[receive-quote-sync] QUOTE_SYNC_WEBHOOK_SECRET missing");
    return json({ error: "server_misconfigured" }, 500);
  }

  const rawBody = await req.text();
  const signatureHeader =
    req.headers.get("x-webhook-signature") ??
    req.headers.get("X-Webhook-Signature") ??
    "";

  if (!signatureHeader) {
    return json({ error: "missing_signature" }, 401);
  }

  const expected = await hmacSha256Hex(secret, rawBody);
  // Aceita "sha256=<hex>" ou apenas "<hex>"
  const provided = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : signatureHeader;

  if (!timingSafeEqual(expected, provided.toLowerCase())) {
    return json({ error: "invalid_signature" }, 401);
  }

  let parsed: {
    event?: string;
    data?: Record<string, unknown>;
    correlation_key?: string;
  };
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { event, data, correlation_key } = parsed;
  if (!event || typeof event !== "string") {
    return json({ error: "event_required" }, 400);
  }
  if (!correlation_key || typeof correlation_key !== "string") {
    return json({ error: "correlation_key_required" }, 400);
  }
  if (!data || typeof data !== "object") {
    return json({ error: "data_required" }, 400);
  }

  const externalQuoteId = (data as Record<string, unknown>).external_quote_id ??
    (data as Record<string, unknown>).quote_id ??
    (data as Record<string, unknown>).id;
  if (!externalQuoteId || typeof externalQuoteId !== "string") {
    return json({ error: "external_quote_id_required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Dedupe — INSERT com unique key. Se conflitar, é replay.
  const { error: dedupeErr } = await supabase
    .from("webhook_inbound_dedupe")
    .insert({
      correlation_key,
      event,
      source: "v4",
      payload: parsed as unknown as Record<string, unknown>,
    });

  if (dedupeErr) {
    // 23505 = unique_violation
    const code = (dedupeErr as { code?: string }).code;
    if (code === "23505") {
      return json({ status: "duplicate_ignored", correlation_key }, 200);
    }
    console.error("[receive-quote-sync] dedupe insert failed", dedupeErr);
    return json({ error: "dedupe_failed", details: dedupeErr.message }, 500);
  }

  // 2. Monta payload sanitizado para upsert
  const quoteRow: Record<string, unknown> = {
    external_quote_id: externalQuoteId,
    source: "v4",
    synced_from_external: true,
    last_synced_at: new Date().toISOString(),
    sync_status: "synced",
  };
  for (const col of QUOTE_COLUMNS) {
    const v = (data as Record<string, unknown>)[col];
    if (v !== undefined) quoteRow[col] = v;
  }
  // Defaults obrigatórios
  if (!quoteRow.title) quoteRow.title = `Orçamento ${externalQuoteId}`;
  if (!quoteRow.client_name) quoteRow.client_name = "Cliente V4";
  if (quoteRow.total_value === undefined) quoteRow.total_value = 0;

  // 3. Upsert idempotente por external_quote_id
  const { data: upserted, error: upsertErr } = await supabase
    .from("quotes")
    .upsert(quoteRow, { onConflict: "external_quote_id" })
    .select("id, external_quote_id, status")
    .single();

  if (upsertErr) {
    console.error("[receive-quote-sync] upsert failed", upsertErr);
    return json({ error: "upsert_failed", details: upsertErr.message }, 500);
  }

  return json(
    {
      status: "ok",
      event,
      correlation_key,
      quote: upserted,
    },
    200,
  );
});
