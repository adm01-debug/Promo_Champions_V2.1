// receive-quote-sync
// Endpoint único que atende DOIS emissores:
//
// A) Fluxo V4 (legado) — sem header x-webhook-event
//    - Secret: QUOTE_SYNC_WEBHOOK_SECRET
//    - Body:   { event, data, correlation_key }
//    - Destino: upsert em public.quotes (por external_quote_id)
//    - Resposta: { status: "ok"|"duplicate_ignored", ... }
//
// B) Fluxo PromoGifts — header x-webhook-event presente
//    - Secret: PROMOGIFTS_WEBHOOK_SECRET
//    - Headers: x-webhook-signature (hex), x-webhook-event, x-correlation-key
//    - Body:   { event, payload, correlation_key }
//    - Destino: upsert em public.quotes_inbound (por quote_id)
//    - Resposta: { ok:true, status:"processed"|"duplicate_ignored", ... }
//
// Ambos compartilham public.webhook_inbound_dedupe e public.quote_sync_inbound_log.

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { withRequestId } from "../_shared/request-id.ts";

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

async function logInbound(
  supabase: SupabaseClient | null,
  entry: {
    correlation_key?: string | null;
    event?: string | null;
    status: string;
    http_status: number;
    error_message?: string | null;
    external_quote_id?: string | null;
    quote_id?: string | null;
    payload?: unknown;
    source?: string;
  },
) {
  if (!supabase) return;
  try {
    await supabase.from("quote_sync_inbound_log").insert({
      correlation_key: entry.correlation_key ?? null,
      event: entry.event ?? null,
      status: entry.status,
      http_status: entry.http_status,
      error_message: entry.error_message ?? null,
      external_quote_id: entry.external_quote_id ?? null,
      quote_id: entry.quote_id ?? null,
      payload: entry.payload ?? {},
      source: entry.source ?? "v4",
    });
  } catch (e) {
    console.error("[receive-quote-sync] failed to write inbound log", e);
  }
}

// ─── Fluxo V4 (legado) ──────────────────────────────────────────────────────
const QUOTE_COLUMNS = [
  "title", "description", "client_name", "client_email", "client_phone",
  "seller_name", "total_value", "subtotal", "discount_percent",
  "discount_amount", "currency", "status", "valid_until", "quote_number",
  "items", "notes", "external_reference", "external_seller_id", "pdf_url",
] as const;

async function handleV4(
  supabase: SupabaseClient,
  rawBody: string,
  signatureHeader: string,
): Promise<Response> {
  const secret = Deno.env.get("QUOTE_SYNC_WEBHOOK_SECRET");
  if (!secret) {
    console.error("[receive-quote-sync/v4] QUOTE_SYNC_WEBHOOK_SECRET missing");
    await logInbound(supabase, {
      status: "server_misconfigured", http_status: 500,
      error_message: "QUOTE_SYNC_WEBHOOK_SECRET missing", source: "v4",
    });
    return json({ error: "server_misconfigured" }, 500);
  }

  const expected = await hmacSha256Hex(secret, rawBody);
  const provided = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : signatureHeader;
  if (!timingSafeEqual(expected, provided.toLowerCase())) {
    await logInbound(supabase, {
      status: "invalid_signature", http_status: 401,
      error_message: "assinatura HMAC não confere", source: "v4",
    });
    return json({ error: "invalid_signature" }, 401);
  }

  let parsed: { event?: string; data?: Record<string, unknown>; correlation_key?: string };
  try { parsed = JSON.parse(rawBody); }
  catch {
    await logInbound(supabase, { status: "invalid_json", http_status: 400, source: "v4" });
    return json({ error: "invalid_json" }, 400);
  }

  const { event, data, correlation_key } = parsed;
  if (!event || typeof event !== "string") {
    await logInbound(supabase, { status: "event_required", http_status: 400, correlation_key, payload: parsed, source: "v4" });
    return json({ error: "event_required" }, 400);
  }
  if (!correlation_key || typeof correlation_key !== "string") {
    await logInbound(supabase, { status: "correlation_key_required", http_status: 400, event, payload: parsed, source: "v4" });
    return json({ error: "correlation_key_required" }, 400);
  }
  if (!data || typeof data !== "object") {
    await logInbound(supabase, { status: "data_required", http_status: 400, event, correlation_key, payload: parsed, source: "v4" });
    return json({ error: "data_required" }, 400);
  }

  const externalQuoteId = (data as Record<string, unknown>).external_quote_id
    ?? (data as Record<string, unknown>).quote_id
    ?? (data as Record<string, unknown>).id;
  if (!externalQuoteId || typeof externalQuoteId !== "string") {
    await logInbound(supabase, { status: "external_quote_id_required", http_status: 400, event, correlation_key, payload: parsed, source: "v4" });
    return json({ error: "external_quote_id_required" }, 400);
  }

  const { error: dedupeErr } = await supabase
    .from("webhook_inbound_dedupe")
    .insert({ correlation_key, event, source: "v4", payload: parsed as unknown as Record<string, unknown> });

  if (dedupeErr) {
    if ((dedupeErr as { code?: string }).code === "23505") {
      await logInbound(supabase, { status: "duplicate_ignored", http_status: 200, event, correlation_key, external_quote_id: externalQuoteId, payload: parsed, source: "v4" });
      return json({ status: "duplicate_ignored", correlation_key }, 200);
    }
    await logInbound(supabase, { status: "dedupe_failed", http_status: 500, event, correlation_key, external_quote_id: externalQuoteId, error_message: dedupeErr.message, payload: parsed, source: "v4" });
    return json({ error: "dedupe_failed", details: dedupeErr.message }, 500);
  }

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
  if (!quoteRow.title) quoteRow.title = `Orçamento ${externalQuoteId}`;
  if (!quoteRow.client_name) quoteRow.client_name = "Cliente V4";
  if (quoteRow.total_value === undefined) quoteRow.total_value = 0;

  const { data: existing, error: selErr } = await supabase
    .from("quotes").select("id").eq("external_quote_id", externalQuoteId).maybeSingle();
  if (selErr) {
    await logInbound(supabase, { status: "lookup_failed", http_status: 500, event, correlation_key, external_quote_id: externalQuoteId, error_message: selErr.message, payload: parsed, source: "v4" });
    return json({ error: "lookup_failed", details: selErr.message }, 500);
  }

  let upserted: { id: string; external_quote_id: string; status: string } | null = null;
  if (existing?.id) {
    const { data: updated, error: updErr } = await supabase
      .from("quotes").update(quoteRow).eq("id", existing.id)
      .select("id, external_quote_id, status").single();
    if (updErr) {
      await logInbound(supabase, { status: "upsert_failed", http_status: 500, event, correlation_key, external_quote_id: externalQuoteId, error_message: updErr.message, payload: parsed, source: "v4" });
      return json({ error: "upsert_failed", details: updErr.message }, 500);
    }
    upserted = updated as typeof upserted;
  } else {
    const { data: inserted, error: insErr } = await supabase
      .from("quotes").insert(quoteRow)
      .select("id, external_quote_id, status").single();
    if (insErr) {
      await logInbound(supabase, { status: "upsert_failed", http_status: 500, event, correlation_key, external_quote_id: externalQuoteId, error_message: insErr.message, payload: parsed, source: "v4" });
      return json({ error: "upsert_failed", details: insErr.message }, 500);
    }
    upserted = inserted as typeof upserted;
  }

  await logInbound(supabase, {
    status: existing?.id ? "updated" : "created",
    http_status: 200, event, correlation_key,
    external_quote_id: externalQuoteId, quote_id: upserted?.id ?? null,
    payload: parsed, source: "v4",
  });

  return json({ status: "ok", event, correlation_key, quote: upserted }, 200);
}

// ─── Fluxo PromoGifts ───────────────────────────────────────────────────────
function isUuid(v: unknown): v is string {
  return typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

async function handlePromoGifts(
  supabase: SupabaseClient,
  rawBody: string,
  signatureHeader: string,
  headerEvent: string | null,
  headerCorrelation: string | null,
  requestId: string,
): Promise<Response> {
  const secret = Deno.env.get("PROMOGIFTS_WEBHOOK_SECRET");
  if (!secret) {
    console.error("[receive-quote-sync/promogifts] PROMOGIFTS_WEBHOOK_SECRET missing");
    await logInbound(supabase, {
      status: "secret_not_configured", http_status: 401,
      error_message: "PROMOGIFTS_WEBHOOK_SECRET missing", source: "promogifts",
    });
    return json({ ok: false, error: "secret_not_configured", hint: "Configure PROMOGIFTS_WEBHOOK_SECRET no Promo Champions" }, 401);
  }

  if (!signatureHeader) {
    await logInbound(supabase, { status: "hmac_missing", http_status: 401, source: "promogifts" });
    return json({ ok: false, error: "hmac_missing", hint: "Envie o header x-webhook-signature" }, 401);
  }

  const expected = await hmacSha256Hex(secret, rawBody);
  const provided = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : signatureHeader;
  if (!timingSafeEqual(expected, provided.toLowerCase())) {
    await logInbound(supabase, {
      status: "hmac_mismatch", http_status: 401,
      error_message: "HMAC divergente", source: "promogifts",
    });
    return json({ ok: false, error: "hmac_mismatch", hint: "Verifique o segredo compartilhado" }, 401);
  }

  let parsed: {
    event?: string;
    payload?: Record<string, unknown>;
    correlation_key?: string;
  };
  try { parsed = JSON.parse(rawBody); }
  catch {
    await logInbound(supabase, { status: "invalid_payload", http_status: 400, source: "promogifts", error_message: "JSON inválido" });
    return json({ ok: false, error: "invalid_payload", details: "invalid_json" }, 400);
  }

  const event = parsed.event ?? headerEvent ?? undefined;
  const correlationKey = parsed.correlation_key ?? headerCorrelation ?? undefined;
  const payload = parsed.payload;

  const missing: string[] = [];
  if (!event || typeof event !== "string") missing.push("event");
  if (!correlationKey || typeof correlationKey !== "string") missing.push("correlation_key");
  if (!payload || typeof payload !== "object") missing.push("payload");
  if (missing.length > 0) {
    await logInbound(supabase, {
      status: "invalid_payload", http_status: 400, event, correlation_key: correlationKey,
      payload: parsed, error_message: `missing:${missing.join(",")}`, source: "promogifts",
    });
    return json({ ok: false, error: "invalid_payload", details: { missing } }, 400);
  }

  const p = payload as Record<string, unknown>;
  const quoteId = p.quote_id;
  if (!isUuid(quoteId)) {
    await logInbound(supabase, {
      status: "invalid_payload", http_status: 400, event, correlation_key: correlationKey,
      payload: parsed, error_message: "payload.quote_id não é UUID", source: "promogifts",
    });
    return json({ ok: false, error: "invalid_payload", details: { field: "payload.quote_id", reason: "expected_uuid" } }, 400);
  }

  // Dedupe
  const { error: dedupeErr } = await supabase
    .from("webhook_inbound_dedupe")
    .insert({ correlation_key: correlationKey!, event: event!, source: "promogifts", payload: parsed as unknown as Record<string, unknown> });

  if (dedupeErr) {
    if ((dedupeErr as { code?: string }).code === "23505") {
      await logInbound(supabase, {
        status: "duplicate_ignored", http_status: 200, event, correlation_key: correlationKey,
        external_quote_id: quoteId, payload: parsed, source: "promogifts",
      });
      return json({ ok: true, status: "duplicate_ignored", correlation_key: correlationKey }, 200);
    }
    console.error("[receive-quote-sync/promogifts] dedupe failed", dedupeErr);
    await logInbound(supabase, {
      status: "dedupe_failed", http_status: 500, event, correlation_key: correlationKey,
      external_quote_id: quoteId, error_message: dedupeErr.message, payload: parsed, source: "promogifts",
    });
    return json({ ok: false, error: "internal", request_id: requestId }, 500);
  }

  // Upsert em quotes_inbound
  const mirrorRow = {
    quote_id: quoteId,
    quote_number: typeof p.quote_number === "string" ? p.quote_number : null,
    status: typeof p.status === "string" ? p.status : null,
    client_id: p.client_id != null ? String(p.client_id) : null,
    client_name: typeof p.client_name === "string" ? p.client_name : null,
    total: typeof p.total === "number" ? p.total : (p.total != null ? Number(p.total) : null),
    seller_email: typeof p.seller_email === "string" ? p.seller_email : null,
    source: "promogifts",
    source_updated_at: typeof p.updated_at === "string" ? p.updated_at : null,
    last_event: event,
    last_correlation_key: correlationKey,
    raw_payload: p,
    received_at: new Date().toISOString(),
  };

  const { error: upErr } = await supabase
    .from("quotes_inbound")
    .upsert(mirrorRow, { onConflict: "quote_id" });

  if (upErr) {
    console.error("[receive-quote-sync/promogifts] upsert failed", upErr);
    await logInbound(supabase, {
      status: "upsert_failed", http_status: 500, event, correlation_key: correlationKey,
      external_quote_id: quoteId, error_message: upErr.message, payload: parsed, source: "promogifts",
    });
    return json({ ok: false, error: "internal", request_id: requestId }, 500);
  }

  await logInbound(supabase, {
    status: "processed", http_status: 200, event, correlation_key: correlationKey,
    external_quote_id: quoteId, payload: parsed, source: "promogifts",
  });

  return json({ ok: true, status: "processed", quote_id: quoteId }, 200);
}

// ─── Handler principal ─────────────────────────────────────────────────────
Deno.serve(withRequestId('receive-quote-sync', async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // S1: rate-limit por IP — 300 req / 60s (webhook legítimo raramente ultrapassa; HMAC valida acima)
  const rl = enforceRateLimit(req, { name: "receive-quote-sync", limit: 300, windowSeconds: 60, bypassAuthenticated: false });
  if (rl) return rl;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

  if (req.method !== "POST") {
    await logInbound(supabase, { status: "method_not_allowed", http_status: 405, error_message: `method=${req.method}` });
    return json({ error: "method_not_allowed" }, 405);
  }

  if (!supabase) {
    return json({ error: "server_misconfigured" }, 500);
  }

  const rawBody = await req.text();
  const signatureHeader =
    req.headers.get("x-webhook-signature") ??
    req.headers.get("X-Webhook-Signature") ?? "";
  const headerEvent =
    req.headers.get("x-webhook-event") ?? req.headers.get("X-Webhook-Event");
  const headerCorrelation =
    req.headers.get("x-correlation-key") ?? req.headers.get("X-Correlation-Key");

  // Roteamento: presença de x-webhook-event ⇒ fluxo PromoGifts.
  if (headerEvent) {
    const requestId = crypto.randomUUID();
    return handlePromoGifts(supabase, rawBody, signatureHeader, headerEvent, headerCorrelation, requestId);
  }

  // Caso contrário, fluxo V4 legado.
  if (!signatureHeader) {
    await logInbound(supabase, {
      status: "missing_signature", http_status: 401,
      error_message: "x-webhook-signature header ausente", source: "v4",
    });
    return json({ error: "missing_signature" }, 401);
  }
  return handleV4(supabase, rawBody, signatureHeader);
}));
