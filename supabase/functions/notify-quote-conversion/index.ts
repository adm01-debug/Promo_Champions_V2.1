// Edge Function: notify-quote-conversion
// Notifica (Slack + webhook genérico opcional) cada conversão quote → sale,
// incluindo order_number e reused_order. Também grava a auditoria via RPC
// fn_record_conversion_attempt para correlação com X-Request-Id.
//
// Body esperado (JSON):
// {
//   quote_id: string,
//   sale_id?: string,
//   order_id?: string,
//   order_number?: string,
//   previous_status?: string,
//   new_status?: string,
//   reused_order?: boolean,
//   idempotent?: boolean,
//   success: boolean,
//   error_code?: string,
//   error_message?: string,
//   latency_ms?: number
// }
//
// Header opcional: X-Request-Id (propagado; se ausente, gera).

import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withEdgeCircuitBreaker, CircuitBreakerOpenError } from "../_shared/circuit-breaker.ts";
import { withRetry, RetryError } from "../_shared/retry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-request-id",
};

interface Payload {
  quote_id: string;
  sale_id?: string | null;
  order_id?: string | null;
  order_number?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  reused_order?: boolean;
  idempotent?: boolean;
  success: boolean;
  error_code?: string | null;
  error_message?: string | null;
  latency_ms?: number | null;
}

function json(status: number, body: unknown, requestId: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
    },
  });
}

function log(level: "info" | "warn" | "error", requestId: string, msg: string, extra: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ level, request_id: requestId, msg, ...extra }));
}

async function postSlack(webhookUrl: string, p: Payload, requestId: string) {
  const status = p.success
    ? p.idempotent
      ? "🔁 Idempotente"
      : p.reused_order
      ? "♻️ Reuso de pedido"
      : "✅ Nova conversão"
    : "❌ Falha na conversão";

  const fields = [
    { title: "Quote", value: p.quote_id, short: true },
    { title: "Sale", value: p.sale_id ?? "—", short: true },
    { title: "Pedido", value: p.order_number ?? "—", short: true },
    { title: "Status", value: `${p.previous_status ?? "?"} → ${p.new_status ?? "?"}`, short: true },
    { title: "reused_order", value: String(p.reused_order ?? false), short: true },
    { title: "idempotent", value: String(p.idempotent ?? false), short: true },
    { title: "Latência", value: p.latency_ms != null ? `${p.latency_ms} ms` : "—", short: true },
    { title: "Request-Id", value: requestId, short: true },
  ];
  if (!p.success) {
    fields.push({ title: "Erro", value: `[${p.error_code ?? "UNKNOWN"}] ${p.error_message ?? ""}`, short: false });
  }

  const body = {
    text: `${status} — quote→sale`,
    attachments: [
      {
        color: p.success ? "#36a64f" : "#c0392b",
        fields,
        footer: "quote-to-sale • notify-quote-conversion",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    await withEdgeCircuitBreaker(
      "slack:quote-conversion",
      async () => {
        await withRetry(async (_attempt, signal) => {
          const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal,
          });
          if (!res.ok) {
            const text = await res.text();
            log("error", requestId, "slack_post_failed", { status: res.status, body: text.slice(0, 500) });
            if (res.status === 429 || res.status >= 500) throw res;
            throw new Error(`slack_http_${res.status}`);
          }
        }, {
          maxAttempts: 3,
          baseDelayMs: 300,
          maxDelayMs: 3000,
          timeoutMs: 7_000,
          isRetryable: (err) => err instanceof Response
            ? (err.status === 429 || err.status >= 500)
            : ((err as { name?: string })?.name === "AbortError" || (err as { name?: string })?.name === "TypeError"),
          telemetry: {
            functionName: "notify-quote-conversion",
            operation: "slack_post",
            requestId,
          },
        });
      },
      { failureThreshold: 5, resetTimeout: 30_000, timeoutMs: 25_000 },
    );
  } catch (err) {
    if (err instanceof CircuitBreakerOpenError) {
      log("warn", requestId, "slack_circuit_open", { circuit: "slack:quote-conversion" });
    } else if (err instanceof RetryError) {
      log("warn", requestId, "slack_retry_exhausted", { attempts: err.attempts });
    }
  }
}

async function postGenericWebhook(url: string, p: Payload, requestId: string) {
  try {
    await withEdgeCircuitBreaker(
      "webhook:quote-conversion",
      async () => {
        await withRetry(async (_attempt, signal) => {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Request-Id": requestId,
              "X-Event": "quote_conversion",
            },
            body: JSON.stringify({ event: "quote_conversion", request_id: requestId, ...p }),
            signal,
          });
          if (!res.ok) {
            const text = await res.text();
            log("error", requestId, "webhook_post_failed", { status: res.status, body: text.slice(0, 500) });
            if (res.status === 429 || res.status >= 500) throw res;
            throw new Error(`webhook_http_${res.status}`);
          }
        }, {
          maxAttempts: 3,
          baseDelayMs: 300,
          maxDelayMs: 3000,
          timeoutMs: 7_000,
          isRetryable: (err) => err instanceof Response
            ? (err.status === 429 || err.status >= 500)
            : ((err as { name?: string })?.name === "AbortError" || (err as { name?: string })?.name === "TypeError"),
          telemetry: {
            functionName: "notify-quote-conversion",
            operation: "generic_webhook_post",
            requestId,
          },
        });
      },
      { failureThreshold: 5, resetTimeout: 30_000, timeoutMs: 25_000 },
    );
  } catch (err) {
    if (err instanceof CircuitBreakerOpenError) {
      log("warn", requestId, "webhook_circuit_open", { circuit: "webhook:quote-conversion" });
    } else if (err instanceof RetryError) {
      log("warn", requestId, "webhook_retry_exhausted", { attempts: err.attempts });
    }
  }
}

Deno.serve(async (req) => {
  const requestId =
    req.headers.get("x-request-id") ?? crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...corsHeaders, "X-Request-Id": requestId } });
  }

  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" }, requestId);
  }

  // Requer JWT do usuário; usamos para gravar auditoria com actor_user_id correto.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json(401, { error: "unauthorized" }, requestId);
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return json(400, { error: "invalid_json" }, requestId);
  }
  if (!payload?.quote_id || typeof payload.success !== "boolean") {
    return json(400, { error: "invalid_payload", detail: "quote_id e success são obrigatórios" }, requestId);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // 1) Grava auditoria (RPC SECURITY DEFINER — respeita auth.uid())
  const { data: auditId, error: auditErr } = await client.rpc(
    "fn_record_conversion_attempt" as never,
    {
      _quote_id: payload.quote_id,
      _sale_id: payload.sale_id ?? null,
      _order_id: payload.order_id ?? null,
      _order_number: payload.order_number ?? null,
      _previous_status: payload.previous_status ?? null,
      _new_status: payload.new_status ?? null,
      _reused_order: payload.reused_order ?? false,
      _idempotent: payload.idempotent ?? false,
      _success: payload.success,
      _error_code: payload.error_code ?? null,
      _error_message: payload.error_message ?? null,
      _latency_ms: payload.latency_ms ?? null,
      _request_id: requestId,
    } as never,
  );
  if (auditErr) {
    log("error", requestId, "audit_insert_failed", { error: auditErr.message });
  } else {
    log("info", requestId, "audit_recorded", { audit_id: auditId });
  }

  // 2) Notificações (não bloqueiam retorno em caso de falha isolada)
  const slackUrl = Deno.env.get("SLACK_WEBHOOK_URL");
  const genericUrl = Deno.env.get("QUOTE_CONVERSION_WEBHOOK_URL");
  const dispatches: Promise<void>[] = [];
  if (slackUrl) dispatches.push(postSlack(slackUrl, payload, requestId));
  if (genericUrl) dispatches.push(postGenericWebhook(genericUrl, payload, requestId));
  await Promise.allSettled(dispatches);

  return json(
    200,
    {
      ok: true,
      request_id: requestId,
      audit_id: auditId ?? null,
      dispatched: {
        slack: Boolean(slackUrl),
        webhook: Boolean(genericUrl),
      },
    },
    requestId,
  );
});
