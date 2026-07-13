// P16 — Alerta de threshold para retries exauridos.
// Agenda via pg_cron (ex.: a cada 15min). Consulta `edge_retry_events` das últimas
// 24h e dispara Slack se `exhausted_count > EDGE_RETRY_EXHAUSTED_THRESHOLD` (default 10).
//
// Secrets:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto)
//   SLACK_WEBHOOK_URL (obrigatório)
//   EDGE_RETRY_EXHAUSTED_THRESHOLD (opcional, default 10)
//   EDGE_RETRY_ALERT_WINDOW_HOURS (opcional, default 24)

import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { withEdgeCircuitBreaker, CircuitBreakerOpenError } from "../_shared/circuit-breaker.ts";
import { withRetry, RetryError } from "../_shared/retry.ts";

interface ExhaustedRow {
  function_name: string;
  operation: string;
  status_code: number | null;
  error_name: string | null;
}

async function postSlack(webhook: string, text: string, requestId: string | null) {
  await withEdgeCircuitBreaker(
    "slack:edge-retry-threshold-alert",
    async () => {
      await withRetry(async (_a, signal) => {
        const res = await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal,
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          if (res.status === 429 || res.status >= 500) throw res;
          throw new Error(`slack ${res.status}: ${body.slice(0, 200)}`);
        }
      }, {
        maxAttempts: 3,
        baseDelayMs: 300,
        maxDelayMs: 3000,
        timeoutMs: 6_000,
        isRetryable: (err) =>
          err instanceof Response
            ? err.status === 429 || err.status >= 500
            : (err as { name?: string })?.name === "AbortError" ||
              (err as { name?: string })?.name === "TypeError",
        telemetry: {
          functionName: "edge-retry-threshold-alert",
          operation: "slack_post",
          requestId: requestId ?? undefined,
        },
      });
    },
  );
}

Deno.serve(withRequestId(async (req, ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const webhook = Deno.env.get("SLACK_WEBHOOK_URL");
  const threshold = Number(Deno.env.get("EDGE_RETRY_EXHAUSTED_THRESHOLD") ?? "10");
  const windowH = Number(Deno.env.get("EDGE_RETRY_ALERT_WINDOW_HOURS") ?? "24");

  if (!url || !key) {
    return new Response(
      JSON.stringify({ error: "missing_env", request_id: ctx.requestId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (!webhook) {
    ctx.log("warn", "slack_webhook_missing");
    return new Response(
      JSON.stringify({ skipped: "no_webhook", request_id: ctx.requestId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const since = new Date(Date.now() - windowH * 60 * 60 * 1000).toISOString();
  const { data, error } = await client
    .from("edge_retry_events")
    .select("function_name, operation, status_code, error_name")
    .eq("outcome", "exhausted")
    .gte("created_at", since);

  if (error) {
    ctx.log("error", "query_failed", { error: error.message });
    return new Response(
      JSON.stringify({ error: "query_failed", detail: error.message, request_id: ctx.requestId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const rows = (data ?? []) as ExhaustedRow[];
  const total = rows.length;

  if (total <= threshold) {
    return new Response(
      JSON.stringify({
        ok: true,
        alerted: false,
        total,
        threshold,
        window_hours: windowH,
        request_id: ctx.requestId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Agrega top ofensores por função
  const byFn = new Map<string, number>();
  for (const r of rows) {
    byFn.set(r.function_name, (byFn.get(r.function_name) ?? 0) + 1);
  }
  const top = [...byFn.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([fn, n]) => `• *${fn}*: ${n}`)
    .join("\n");

  const text =
    `:rotating_light: *Edge Retry Exhausted acima do threshold*\n` +
    `Últimas ${windowH}h: *${total}* eventos exauridos (threshold: ${threshold})\n` +
    `\n*Top funções:*\n${top}\n\n_req: ${ctx.requestId}_`;

  try {
    await postSlack(webhook, text, ctx.requestId);
  } catch (err) {
    if (err instanceof CircuitBreakerOpenError) {
      ctx.log("warn", "slack_circuit_open");
      return new Response(
        JSON.stringify({
          ok: false,
          alerted: false,
          reason: "circuit_open",
          total,
          request_id: ctx.requestId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (err instanceof RetryError) {
      ctx.log("error", "slack_retry_exhausted", { attempts: err.attempts });
      return new Response(
        JSON.stringify({
          ok: false,
          alerted: false,
          reason: `retry_exhausted:${err.attempts}`,
          total,
          request_id: ctx.requestId,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    throw err;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      alerted: true,
      total,
      threshold,
      window_hours: windowH,
      request_id: ctx.requestId,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}));
