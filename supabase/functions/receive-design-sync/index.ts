// receive-design-sync
// Recebe os design.created / design.updated emitidos pelo Promo Design.
//
// Envelope identico ao fluxo PromoGifts do receive-quote-sync (decisao de arquitetura: um
// unico formato de webhook no CRM, para nao duplicar validador e dedupe):
//   headers: x-webhook-signature: sha256=<hex>, x-webhook-event, x-correlation-key
//   body:    { event, payload, correlation_key }
//   secret:  DESIGN_SYNC_WEBHOOK_SECRET
//
// Destino: upsert em public.designs_inbound por design_id. Dedupe em
// public.webhook_inbound_dedupe por correlation_key (= design_id).
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { readUtf8BodyWithinLimit } from "../_shared/request-body.ts";
import { createValidationErrorResponse, validateWebhookPayload } from "../_shared/webhook-validator.ts";
import { DesignPayloadSchema, rowFromParsed } from "./mapping.ts";

const encoder = new TextEncoder();
const MAX_WEBHOOK_BODY_BYTES = 240 * 1024;
const MAX_EVENT_LENGTH = 120;
const MAX_CORRELATION_KEY_LENGTH = 128;

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

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

function jsonb(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
}

Deno.serve(withRequestId("receive-design-sync", async (req, ctx) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(req) });

  const rl = enforceRateLimit(req, {
    name: "receive-design-sync", limit: 300, windowSeconds: 60, bypassAuthenticated: false,
  });
  if (rl) return rl;

  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json(req, { error: "server_misconfigured" }, 500);
  const supabase: SupabaseClient = createClient(supabaseUrl, serviceKey);

  const secret = Deno.env.get("DESIGN_SYNC_WEBHOOK_SECRET");
  if (!secret) {
    console.error("[receive-design-sync] DESIGN_SYNC_WEBHOOK_SECRET missing");
    return json(req, { ok: false, error: "secret_not_configured" }, 503);
  }

  const rawBody = await readUtf8BodyWithinLimit(req, MAX_WEBHOOK_BODY_BYTES);
  if (rawBody === null) return json(req, { error: "payload_too_large" }, 413);

  const signatureHeader =
    req.headers.get("x-webhook-signature") ?? req.headers.get("X-Webhook-Signature") ?? "";
  if (!signatureHeader) return json(req, { ok: false, error: "hmac_missing" }, 401);

  const expected = await hmacSha256Hex(secret, rawBody);
  const provided = (signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : signatureHeader).toLowerCase();
  if (!timingSafeEqual(expected, provided)) {
    return json(req, { ok: false, error: "hmac_mismatch" }, 401);
  }

  let parsed: { event?: string; payload?: Record<string, unknown>; correlation_key?: string };
  try { parsed = JSON.parse(rawBody); }
  catch { return json(req, { ok: false, error: "invalid_payload", details: "invalid_json" }, 400); }

  const headerEvent = req.headers.get("x-webhook-event") ?? req.headers.get("X-Webhook-Event");
  const headerCorrelation =
    req.headers.get("x-correlation-key") ?? req.headers.get("X-Correlation-Key");

  const event = parsed.event ?? headerEvent ?? undefined;
  const correlationKey = parsed.correlation_key ?? headerCorrelation ?? undefined;
  const payload = parsed.payload;

  const missing: string[] = [];
  if (typeof event !== "string" || event.trim().length === 0 || event.length > MAX_EVENT_LENGTH) {
    missing.push("event");
  }
  if (typeof correlationKey !== "string" || correlationKey.trim().length === 0 ||
    correlationKey.length > MAX_CORRELATION_KEY_LENGTH) {
    missing.push("correlation_key");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) missing.push("payload");
  if (missing.length > 0) {
    return json(req, { ok: false, error: "invalid_payload", details: { missing } }, 400);
  }

  const p = payload as Record<string, unknown>;
  const validation = validateWebhookPayload(DesignPayloadSchema, p);
  if (!validation.success || !validation.data) {
    return createValidationErrorResponse(
      validation.error ?? "invalid_payload",
      validation.details ?? [],
      validation.contract_version,
      getCorsHeaders(req),
    );
  }
  const row = rowFromParsed(validation.data);
  const designId = row.design_id;
  const { data: reservation, error: dedupeErr } = await supabase
    .from("webhook_inbound_dedupe")
    .insert({
      correlation_key: correlationKey!,
      event: event!,
      source: "promo_design",
      payload: parsed as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (dedupeErr) {
    if ((dedupeErr as { code?: string }).code === "23505") {
      return json(req, { ok: true, status: "duplicate_ignored", correlation_key: correlationKey }, 200);
    }
    console.error("[receive-design-sync] dedupe failed", dedupeErr);
    return json(req, { ok: false, error: "internal", request_id: ctx.requestId }, 500);
  }

  const reservationId = (reservation as { id?: string } | null)?.id;

  const { error: upErr } = await supabase
    .from("designs_inbound")
    .upsert({
      design_id: row.design_id,
      name: row.name,
      product_name: row.product_name,
      product_sku: row.product_sku,
      thumbnail_url: row.thumbnail_url,
      seller_email: row.seller_email,
      last_event: event!,
      last_correlation_key: correlationKey!,
      source: "promo_design",
      source_updated_at: row.source_updated_at,
      raw_payload: jsonb(p),
      received_at: new Date().toISOString(),
    }, { onConflict: "design_id" });

  if (upErr) {
    // Devolve a reserva para que um retry legitimo do emissor nao seja bloqueado para sempre.
    if (reservationId) {
      const { error: relErr } = await supabase
        .from("webhook_inbound_dedupe")
        .delete()
        .eq("id", reservationId);
      if (relErr) console.error("[receive-design-sync] release dedupe failed", relErr.message);
    }
    console.error("[receive-design-sync] upsert failed", upErr);
    return json(req, { ok: false, error: "internal", request_id: ctx.requestId }, 500);
  }

  return json(req, { ok: true, status: "processed", design_id: designId }, 200);
}));