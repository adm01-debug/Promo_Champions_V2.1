// receive-quote-sync
// Inbound webhook (server-to-server) recebendo quotes de sistemas externos
// (ex.: Promo Gifts V4).

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";
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
      source: "v4",
    });
  } catch (e) {
    console.error("[receive-quote-sync] failed to write inbound log", e);
  }
}

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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey)
    : null;

  if (req.method !== "POST") {
    await logInbound(supabase, {
      status: "method_not_allowed",
      http_status: 405,
      error_message: `method=${req.method}`,
    });
    return json({ error: "method_not_allowed" }, 405);
  }

  const secret = Deno.env.get("QUOTE_SYNC_WEBHOOK_SECRET");
  if (!secret) {
    console.error("[receive-quote-sync] QUOTE_SYNC_WEBHOOK_SECRET missing");
    await logInbound(supabase, {
      status: "server_misconfigured",
      http_status: 500,
      error_message: "QUOTE_SYNC_WEBHOOK_SECRET missing",
    });
    return json({ error: "server_misconfigured" }, 500);
  }

  const rawBody = await req.text();
  const signatureHeader =
    req.headers.get("x-webhook-signature") ??
    req.headers.get("X-Webhook-Signature") ??
    "";

  if (!signatureHeader) {
    await logInbound(supabase, {
      status: "missing_signature",
      http_status: 401,
      error_message: "x-webhook-signature header ausente",
    });
    return json({ error: "missing_signature" }, 401);
  }

  const expected = await hmacSha256Hex(secret, rawBody);
  const provided = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : signatureHeader;

  if (!timingSafeEqual(expected, provided.toLowerCase())) {
    await logInbound(supabase, {
      status: "invalid_signature",
      http_status: 401,
      error_message: "assinatura HMAC não confere",
    });
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
    await logInbound(supabase, {
      status: "invalid_json",
      http_status: 400,
      error_message: "rawBody não é JSON válido",
    });
    return json({ error: "invalid_json" }, 400);
  }

  const { event, data, correlation_key } = parsed;
  if (!event || typeof event !== "string") {
    await logInbound(supabase, {
      status: "event_required",
      http_status: 400,
      correlation_key,
      payload: parsed,
    });
    return json({ error: "event_required" }, 400);
  }
  if (!correlation_key || typeof correlation_key !== "string") {
    await logInbound(supabase, {
      status: "correlation_key_required",
      http_status: 400,
      event,
      payload: parsed,
    });
    return json({ error: "correlation_key_required" }, 400);
  }
  if (!data || typeof data !== "object") {
    await logInbound(supabase, {
      status: "data_required",
      http_status: 400,
      event,
      correlation_key,
      payload: parsed,
    });
    return json({ error: "data_required" }, 400);
  }

  const externalQuoteId = (data as Record<string, unknown>).external_quote_id ??
    (data as Record<string, unknown>).quote_id ??
    (data as Record<string, unknown>).id;
  if (!externalQuoteId || typeof externalQuoteId !== "string") {
    await logInbound(supabase, {
      status: "external_quote_id_required",
      http_status: 400,
      event,
      correlation_key,
      payload: parsed,
    });
    return json({ error: "external_quote_id_required" }, 400);
  }

  if (!supabase) {
    return json({ error: "server_misconfigured" }, 500);
  }

  // Dedupe
  const { error: dedupeErr } = await supabase
    .from("webhook_inbound_dedupe")
    .insert({
      correlation_key,
      event,
      source: "v4",
      payload: parsed as unknown as Record<string, unknown>,
    });

  if (dedupeErr) {
    const code = (dedupeErr as { code?: string }).code;
    if (code === "23505") {
      await logInbound(supabase, {
        status: "duplicate_ignored",
        http_status: 200,
        event,
        correlation_key,
        external_quote_id: externalQuoteId,
        payload: parsed,
      });
      return json({ status: "duplicate_ignored", correlation_key }, 200);
    }
    console.error("[receive-quote-sync] dedupe insert failed", dedupeErr);
    await logInbound(supabase, {
      status: "dedupe_failed",
      http_status: 500,
      event,
      correlation_key,
      external_quote_id: externalQuoteId,
      error_message: dedupeErr.message,
      payload: parsed,
    });
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
    .from("quotes")
    .select("id")
    .eq("external_quote_id", externalQuoteId)
    .maybeSingle();

  if (selErr) {
    console.error("[receive-quote-sync] select failed", selErr);
    await logInbound(supabase, {
      status: "lookup_failed",
      http_status: 500,
      event,
      correlation_key,
      external_quote_id: externalQuoteId,
      error_message: selErr.message,
      payload: parsed,
    });
    return json({ error: "lookup_failed", details: selErr.message }, 500);
  }

  let upserted: { id: string; external_quote_id: string; status: string } | null = null;
  if (existing?.id) {
    const { data: updated, error: updErr } = await supabase
      .from("quotes")
      .update(quoteRow)
      .eq("id", existing.id)
      .select("id, external_quote_id, status")
      .single();
    if (updErr) {
      console.error("[receive-quote-sync] update failed", updErr);
      await logInbound(supabase, {
        status: "upsert_failed",
        http_status: 500,
        event,
        correlation_key,
        external_quote_id: externalQuoteId,
        error_message: updErr.message,
        payload: parsed,
      });
      return json({ error: "upsert_failed", details: updErr.message }, 500);
    }
    upserted = updated as typeof upserted;
  } else {
    const { data: inserted, error: insErr } = await supabase
      .from("quotes")
      .insert(quoteRow)
      .select("id, external_quote_id, status")
      .single();
    if (insErr) {
      console.error("[receive-quote-sync] insert failed", insErr);
      await logInbound(supabase, {
        status: "upsert_failed",
        http_status: 500,
        event,
        correlation_key,
        external_quote_id: externalQuoteId,
        error_message: insErr.message,
        payload: parsed,
      });
      return json({ error: "upsert_failed", details: insErr.message }, 500);
    }
    upserted = inserted as typeof upserted;
  }

  await logInbound(supabase, {
    status: existing?.id ? "updated" : "created",
    http_status: 200,
    event,
    correlation_key,
    external_quote_id: externalQuoteId,
    quote_id: upserted?.id ?? null,
    payload: parsed,
  });

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
