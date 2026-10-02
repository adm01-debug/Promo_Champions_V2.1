// WEBVITALS-REGRESSION — alerta diário de regressão de Web Vitals.
//
// Lê `public.v_web_vitals_p75` (service_role) e compara, para cada
// (metric_name, device_type) entre LCP/CLS/FCP, o p75 do último dia com a
// média móvel dos 7 dias anteriores. Dispara Slack quando:
//
//   p75_hoje > WEBVITALS_REGRESSION_FACTOR × média_7d   (default 1.4)
//   AND p75_hoje > budget_p75 da view (quando definido)
//   AND amostras do dia >= WEBVITALS_MIN_DAY_SAMPLES     (default 30)
//   AND baseline cobre >= WEBVITALS_MIN_BASELINE_DAYS dias (default 3)
//
// O p75 diário por (métrica, device) é agregado das rotas por média
// ponderada por `samples` — aproximação documentada (a view não expõe os
// percentis brutos por dia).
//
// Auth: X-Cron-Secret (via trigger_internal_edge_job) ou admin/manager.
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto) + SLACK_WEBHOOK_URL.
// Agendado por 'webvitals-regression-alert-daily' (migration 20261002010000).

import { createClient } from "npm:@supabase/supabase-js@2.49.4";

import { getCorsHeaders } from "../_shared/cors.ts";
import { getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";
import { isAuthorizedCronRequest } from "../_shared/cron-request-auth.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { withEdgeCircuitBreaker, CircuitBreakerOpenError } from "../_shared/circuit-breaker.ts";
import { withRetry } from "../_shared/retry.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import {
  collectErrors,
  validateEnum,
  validationErrorResponse,
} from "../_shared/validation.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const WATCHED_METRICS = new Set(["LCP", "CLS", "FCP"]);
const LOOKBACK_DAYS = 9; // último dia + até 8 de baseline (usa até 7)

interface VitalRow {
  day: string;
  route: string;
  device_type: string;
  metric_name: string;
  samples: number;
  p75: number | null;
  budget_p75: number | null;
}

interface Regression {
  metric: string;
  deviceType: string;
  day: string;
  p75Today: number;
  baseline7d: number;
  factor: number;
  samplesToday: number;
  budget: number | null;
  worstRoute: string | null;
}

async function isAdminOrManagerRequest(req: Request): Promise<boolean> {
  const caller = await getUserClient(req);
  const { data, error } = await caller.client.rpc(
    "is_admin_or_manager" as never,
    {
      _user_id: caller.userId,
    } as never,
  );
  if (error) throw error;
  return Boolean(data);
}

async function postSlack(webhook: string, text: string, blocks?: unknown, requestId?: string) {
  await withEdgeCircuitBreaker(
    "slack:webvitals-regression-alert",
    async () => {
      await withRetry(async (_attempt, signal) => {
        const res = await fetchWithTimeout(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blocks ? { text, blocks } : { text }),
          signal,
        });
        if (!res.ok) {
          const body = await res.text();
          if (res.status === 429 || res.status >= 500) throw res;
          throw new Error(`slack webhook ${res.status}: ${body.slice(0, 200)}`);
        }
      }, {
        maxAttempts: 3,
        baseDelayMs: 300,
        maxDelayMs: 3000,
        timeoutMs: 6_000,
        isRetryable: (err) => err instanceof Response
          ? (err.status === 429 || err.status >= 500)
          : ((err as { name?: string })?.name === "AbortError" || (err as { name?: string })?.name === "TypeError"),
        telemetry: {
          functionName: "webvitals-regression-alert",
          operation: "slack_post",
          requestId: requestId ?? null,
        },
      });
    },
    { failureThreshold: 3, resetTimeout: 60_000, timeoutMs: 20_000 },
  );
}

/**
 * Agrega as linhas da view por (métrica, device, dia): p75 ponderado por
 * amostras + rota de maior p75 do dia (para contexto do alerta).
 */
function detectRegressions(
  rows: VitalRow[],
  factor: number,
  minDaySamples: number,
  minBaselineDays: number,
): Regression[] {
  // group: metric|device|day -> {p75WeightedSum, samples, worstRoute, worstP75, budget}
  const groups = new Map<string, {
    day: string;
    metric: string;
    device: string;
    weighted: number;
    samples: number;
    budget: number | null;
    worstRoute: string | null;
    worstP75: number;
  }>();

  for (const r of rows) {
    if (!WATCHED_METRICS.has(r.metric_name)) continue;
    const p75 = Number(r.p75);
    const samples = Number(r.samples);
    if (!Number.isFinite(p75) || !Number.isFinite(samples) || samples <= 0) continue;

    const key = `${r.metric_name}|${r.device_type}|${r.day}`;
    const g = groups.get(key) ?? {
      day: r.day,
      metric: r.metric_name,
      device: r.device_type,
      weighted: 0,
      samples: 0,
      budget: r.budget_p75 == null ? null : Number(r.budget_p75),
      worstRoute: null,
      worstP75: -1,
    };
    g.weighted += p75 * samples;
    g.samples += samples;
    if (p75 > g.worstP75) {
      g.worstP75 = p75;
      g.worstRoute = r.route;
    }
    groups.set(key, g);
  }

  // Serie temporal por (métrica, device)
  const series = new Map<string, { day: string; p75: number; samples: number; budget: number | null; worstRoute: string | null }[]>();
  for (const g of groups.values()) {
    const key = `${g.metric}|${g.device}`;
    const arr = series.get(key) ?? [];
    arr.push({
      day: g.day,
      p75: g.weighted / g.samples,
      samples: g.samples,
      budget: g.budget,
      worstRoute: g.worstRoute,
    });
    series.set(key, arr);
  }

  const regressions: Regression[] = [];
  for (const [key, days] of series) {
    days.sort((a, b) => b.day.localeCompare(a.day));
    const latest = days[0];
    const baseline = days.slice(1, 8).filter(d => d.samples >= minDaySamples);

    if (latest.samples < minDaySamples) continue;
    if (baseline.length < minBaselineDays) continue;

    const baselineAvg = baseline.reduce((acc, d) => acc + d.p75, 0) / baseline.length;
    const threshold = baselineAvg * factor;

    if (latest.p75 > threshold && (latest.budget == null || latest.p75 > latest.budget)) {
      const [metric, device] = key.split("|");
      regressions.push({
        metric,
        deviceType: device,
        day: latest.day,
        p75Today: latest.p75,
        baseline7d: baselineAvg,
        factor: latest.p75 / baselineAvg,
        samplesToday: latest.samples,
        budget: latest.budget,
        worstRoute: latest.worstRoute,
      });
    }
  }

  return regressions.sort((a, b) => b.factor - a.factor);
}

function formatMetricValue(metric: string, v: number): string {
  // CLS é adimensional; demais métricas chegam em ms.
  return metric === "CLS" ? v.toFixed(3) : `${Math.round(v).toLocaleString("pt-BR")} ms`;
}

Deno.serve(withRequestId("webvitals-regression-alert", async (req, ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json({ error: "service_not_configured" }, 503);
  }

  const slack = Deno.env.get("SLACK_WEBHOOK_URL");
  if (!slack) {
    return json({
      error: "SLACK_WEBHOOK_URL not configured",
      hint: "Adicione o secret SLACK_WEBHOOK_URL para habilitar alertas.",
    }, 503);
  }

  let dryRun = false;
  const rawBody = await req.text();
  if (rawBody.trim()) {
    let body: { mode?: unknown };
    try {
      body = JSON.parse(rawBody) as { mode?: unknown };
    } catch {
      return json({ error: "invalid_json" }, 400);
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return json({ error: "invalid_body" }, 400);
    }
    const errors = collectErrors([
      validateEnum(body.mode, "mode", ["run", "dry_run"], false),
    ]);
    if (errors.length > 0) return validationErrorResponse(errors, corsHeaders);
    dryRun = body.mode === "dry_run";
  }

  const factor = Number(Deno.env.get("WEBVITALS_REGRESSION_FACTOR") ?? 1.4);
  const minDaySamples = Number(Deno.env.get("WEBVITALS_MIN_DAY_SAMPLES") ?? 30);
  const minBaselineDays = Number(Deno.env.get("WEBVITALS_MIN_BASELINE_DAYS") ?? 3);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  let authorizedByCron = false;
  try {
    authorizedByCron = await isAuthorizedCronRequest(req, async () => {
      const { data, error } = await admin
        .from("_internal_secrets")
        .select("value")
        .eq("key", "coaching_cron_secret")
        .maybeSingle();
      if (error) throw error;
      return (data as { value?: string | null } | null)?.value;
    });
  } catch (error) {
    ctx.log("error", "webvitals_cron_authorization_unavailable", { error: String(error) });
    return json({ error: "authorization_unavailable" }, 503);
  }

  if (!authorizedByCron) {
    try {
      if (!await isAdminOrManagerRequest(req)) {
        return json({ error: "forbidden" }, 403);
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return json({ error: "unauthorized" }, 401);
      }
      ctx.log("error", "webvitals_authorization_failed", { error: String(error) });
      return json({ error: "authorization_unavailable" }, 503);
    }
  }

  try {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - LOOKBACK_DAYS);
    const sinceDay = since.toISOString().slice(0, 10);

    const { data, error } = await admin
      .from("v_web_vitals_p75")
      .select("day, route, device_type, metric_name, samples, p75, budget_p75")
      .in("metric_name", [...WATCHED_METRICS])
      .gte("day", sinceDay)
      .limit(5000);

    if (error) throw error;

    const regressions = detectRegressions(
      (data ?? []) as VitalRow[],
      factor,
      minDaySamples,
      minBaselineDays,
    );

    if (regressions.length === 0) {
      return json({ ok: true, dry_run: dryRun, regressions: 0 });
    }

    const lines = regressions.map(r =>
      `🔴 *${r.metric}* (${r.deviceType}) — p75 ${formatMetricValue(r.metric, r.p75Today)}` +
      ` vs média 7d ${formatMetricValue(r.metric, r.baseline7d)}` +
      ` (${r.factor.toFixed(2)}×, ${r.samplesToday} amostras` +
      `${r.worstRoute ? `, pior rota ${r.worstRoute}` : ""})`
    );

    const text =
      `*[Web Vitals Regression]* ${regressions.length} regressão(ões) em ${regressions[0].day}\n` +
      lines.join("\n");

    if (dryRun) {
      return json({ ok: true, dry_run: true, regressions, preview: text });
    }

    await postSlack(slack, text, [
      { type: "section", text: { type: "mrkdwn", text } },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `fator=${factor} • min_amostras=${minDaySamples} • baseline≥${minBaselineDays}d • fonte=v_web_vitals_p75`,
          },
        ],
      },
    ], ctx.requestId);

    return json({ ok: true, regressions });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (e instanceof CircuitBreakerOpenError) {
      ctx.log("warn", "slack_circuit_open", { circuit: "slack:webvitals-regression-alert" });
      return json({ ok: false, degraded: true, reason: "slack_circuit_open" }, 503);
    }
    ctx.log("error", "webvitals_regression_alert_failed", { error: msg });
    return json({ error: msg }, 500);
  }
}));
