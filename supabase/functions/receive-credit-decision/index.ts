// receive-credit-decision
// Recebe a decisao da analise de credito da 1a venda emitida pelo Promo Finance
// (credito.decidido) e aplica no pedido via aplicar_decisao_credito:
//   aprovado  -> orders.credit_status='aprovado' + itens enfileirados no Supply
//   reprovado -> orders.credit_status='reprovado' (vendedor decide o que fazer)
//
// Dedupe em public.webhook_inbound_dedupe por correlation_key (= analise_id).
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { readUtf8BodyWithinLimit } from "../_shared/request-body.ts";
import { errorEnvelope, jsonResponse } from "../_shared/http-envelope.ts";
import { createValidationErrorResponse, validateWebhookPayload } from "../_shared/webhook-validator.ts";
import {
  CREDIT_DECISION_EVENT,
  CreditDecisionPayloadSchema,
  signatureMatches,
} from "./contract.ts";

const MAX_WEBHOOK_BODY_BYTES = 64 * 1024;
const MAX_CORRELATION_KEY_LENGTH = 128;

Deno.serve(withRequestId("receive-credit-decision", async (req, ctx) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(req) });

  const rl = enforceRateLimit(req, {
    name: "receive-credit-decision", limit: 120, windowSeconds: 60, bypassAuthenticated: false,
  });
  if (rl) return rl;

  if (req.method !== "POST") {
    return errorEnvelope("BAD_REQUEST", "method_not_allowed", { status: 405, requestId: ctx.requestId });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return errorEnvelope("INTERNAL_ERROR", "server_misconfigured", { requestId: ctx.requestId });
  }
  const supabase: SupabaseClient = createClient(supabaseUrl, serviceKey);

  const secret = Deno.env.get("FINANCE_CREDITO_WEBHOOK_SECRET");
  if (!secret) {
    ctx.log("error", "finance_credito_secret_missing");
    return errorEnvelope("INTERNAL_ERROR", "secret_not_configured", { status: 503, requestId: ctx.requestId });
  }

  const rawBody = await readUtf8BodyWithinLimit(req, MAX_WEBHOOK_BODY_BYTES);
  if (rawBody === null) {
    return errorEnvelope("BAD_REQUEST", "payload_too_large", { status: 413, requestId: ctx.requestId });
  }

  const signatureHeader =
    req.headers.get("x-webhook-signature") ?? req.headers.get("X-Webhook-Signature") ?? "";
  if (!signatureHeader) {
    return errorEnvelope("UNAUTHORIZED", "hmac_missing", { requestId: ctx.requestId });
  }
  if (!(await signatureMatches(secret, rawBody, signatureHeader))) {
    return errorEnvelope("UNAUTHORIZED", "hmac_mismatch", { requestId: ctx.requestId });
  }

  let parsed: { event?: string; payload?: Record<string, unknown>; correlation_key?: string };
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return errorEnvelope("BAD_REQUEST", "invalid_json", { requestId: ctx.requestId });
  }

  const event = parsed.event ?? req.headers.get("x-webhook-event") ?? undefined;
  const correlationKey = parsed.correlation_key ?? req.headers.get("x-correlation-key") ?? undefined;
  const payload = parsed.payload;

  if (event !== CREDIT_DECISION_EVENT) {
    return errorEnvelope("BAD_REQUEST", "unsupported_event", {
      requestId: ctx.requestId,
      details: { event },
    });
  }
  if (
    typeof correlationKey !== "string" || correlationKey.trim().length === 0 ||
    correlationKey.length > MAX_CORRELATION_KEY_LENGTH
  ) {
    return errorEnvelope("BAD_REQUEST", "invalid_payload", {
      requestId: ctx.requestId,
      details: { missing: ["correlation_key"] },
    });
  }

  const validation = validateWebhookPayload(CreditDecisionPayloadSchema, payload);
  if (!validation.success || !validation.data) {
    return createValidationErrorResponse(
      validation.error ?? "invalid_payload",
      validation.details ?? [],
      validation.contract_version,
      getCorsHeaders(req),
    );
  }
  const decision = validation.data;

  const { data: reservation, error: dedupeErr } = await supabase
    .from("webhook_inbound_dedupe")
    .insert({
      correlation_key: correlationKey,
      event,
      source: "promo_finance",
      payload: parsed as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (dedupeErr) {
    if ((dedupeErr as { code?: string }).code === "23505") {
      return jsonResponse(
        { status: "duplicate_ignored", correlation_key: correlationKey },
        { requestId: ctx.requestId },
      );
    }
    ctx.log("error", "credit_dedupe_failed", { error: dedupeErr.message });
    return errorEnvelope("INTERNAL_ERROR", "internal", { requestId: ctx.requestId });
  }
  const reservationId = (reservation as { id?: string } | null)?.id;

  const { data: applied, error: applyErr } = await supabase.rpc(
    "aplicar_decisao_credito" as never,
    {
      p_order_id: decision.pedido_id,
      p_decisao: decision.decisao,
      p_limite: decision.limite_aprovado ?? null,
      p_parcelas: decision.parcelas_max ?? null,
      p_parecer: decision.parecer ?? null,
    } as never,
  );

  if (applyErr) {
    // Devolve a reserva para que um retry legitimo do Finance nao fique bloqueado.
    if (reservationId) {
      const { error: relErr } = await supabase
        .from("webhook_inbound_dedupe")
        .delete()
        .eq("id", reservationId);
      if (relErr) ctx.log("error", "credit_release_dedupe_failed", { error: relErr.message });
    }
    ctx.log("error", "credit_apply_failed", { error: applyErr.message, pedido_id: decision.pedido_id });
    return errorEnvelope("INTERNAL_ERROR", "internal", { requestId: ctx.requestId });
  }

  const result = (applied ?? {}) as { status?: string; credit_status?: string; itens_supply?: number };
  if (result.status === "pedido_nao_encontrado") {
    return errorEnvelope("NOT_FOUND", "pedido_nao_encontrado", {
      requestId: ctx.requestId,
      details: { pedido_id: decision.pedido_id },
    });
  }

  ctx.log("info", "credit_decision_applied", {
    pedido_id: decision.pedido_id,
    decisao: decision.decisao,
    resultado: result.status,
    itens_supply: result.itens_supply ?? 0,
  });

  return jsonResponse(
    {
      status: result.status ?? "aplicado",
      pedido_id: decision.pedido_id,
      credit_status: result.credit_status ?? decision.decisao,
      itens_supply: result.itens_supply ?? 0,
    },
    { requestId: ctx.requestId },
  );
}));
