import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "x-request-id",
};

type LogLevel = "info" | "warn" | "error";
type AlertKind = "consecutive_failures" | "high_retry_rate" | "attempts_exhausted";

const CONSECUTIVE_FAILURES = Number(Deno.env.get("ALERT_CONSECUTIVE_FAILURES") ?? 5);
const RETRY_RATE_THRESHOLD = Number(Deno.env.get("ALERT_RETRY_RATE_THRESHOLD") ?? 0.5);
const WINDOW_MINUTES = Number(Deno.env.get("ALERT_WINDOW_MINUTES") ?? 30);
const MIN_DELIVERIES = Number(Deno.env.get("ALERT_MIN_DELIVERIES") ?? 10);
const SUPPRESS_MINUTES = Number(Deno.env.get("ALERT_SUPPRESS_MINUTES") ?? 60);
const MAX_ATTEMPTS = Number(Deno.env.get("ALERT_MAX_ATTEMPTS") ?? 3);

function describeError(e: unknown): { error_name: string; error: string; error_stack: string | null } {
  if (e instanceof Error) {
    return {
      error_name: e.name || "Error",
      error: e.message || String(e),
      error_stack: e.stack ? e.stack.slice(0, 4000) : null,
    };
  }
  return { error_name: "UnknownError", error: String(e), error_stack: null };
}

function structuredLog(level: LogLevel, data: Record<string, unknown>, requestId?: string) {
  const line = JSON.stringify({
    fn: "winloss-webhook-health-monitor",
    level,
    ts: new Date().toISOString(),
    requestId,
    ...data,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

interface DeliveryRow {
  attempt: number;
  succeeded: boolean;
  status: number;
  error_message: string | null;
  created_at: string;
}

interface SubscriptionRow {
  id: string;
  url: string;
}

interface EvaluationResult {
  subscriptionId: string;
  url: string;
  total: number;
  failed: number;
  retries: number;
  retryRate: number;
  consecutiveFailures: number;
  fired: AlertKind[];
  suppressed: AlertKind[];
}

function evaluate(rows: DeliveryRow[]): {
  total: number;
  failed: number;
  retries: number;
  retryRate: number;
  consecutiveFailures: number;
  triggers: Array<{ kind: AlertKind; details: Record<string, unknown> }>;
} {
  const total = rows.length;
  const failed = rows.filter((r) => !r.succeeded).length;
  const retries = rows.filter((r) => r.attempt > 1).length;
  const retryRate = total === 0 ? 0 : retries / total;

  // Consecutive failures: rows are ordered DESC by created_at; count head streak of !succeeded
  let consecutiveFailures = 0;
  for (const r of rows) {
    if (!r.succeeded) consecutiveFailures += 1;
    else break;
  }

  const triggers: Array<{ kind: AlertKind; details: Record<string, unknown> }> = [];

  if (consecutiveFailures >= CONSECUTIVE_FAILURES) {
    const last = rows[0];
    triggers.push({
      kind: "consecutive_failures",
      details: {
        consecutive_failures: consecutiveFailures,
        threshold: CONSECUTIVE_FAILURES,
        last_status: last?.status ?? null,
        last_error: last?.error_message ?? null,
      },
    });
  }

  if (total >= MIN_DELIVERIES && retryRate > RETRY_RATE_THRESHOLD) {
    triggers.push({
      kind: "high_retry_rate",
      details: {
        retry_rate: Number(retryRate.toFixed(3)),
        threshold: RETRY_RATE_THRESHOLD,
        retries,
        total,
        window_minutes: WINDOW_MINUTES,
      },
    });
  }

  return { total, failed, retries, retryRate, consecutiveFailures, triggers };
}

async function sendAlertEmail(
  url: string,
  subscriptionId: string,
  triggers: Array<{ kind: AlertKind; details: Record<string, unknown> }>,
  requestId: string,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
  if (!apiKey || !adminEmail) {
    structuredLog("info", { msg: "email_skipped", subscriptionId, reason: "missing_env" }, requestId);
    return { sent: false, reason: "missing_env" };
  }

  const items = triggers
    .map((t) => `<li><strong>${t.kind}</strong>: <code>${JSON.stringify(t.details)}</code></li>`)
    .join("");
  const html = `
    <h2>⚠️ Webhook degradado</h2>
    <p>Assinatura <code>${subscriptionId}</code> (<a href="${url}">${url}</a>) disparou alerta(s):</p>
    <ul>${items}</ul>
    <p>Investigue no painel Win/Loss Intelligence → Webhooks.</p>
  `;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Win/Loss Webhooks <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `Webhook degradado: ${triggers.map((t) => t.kind).join(", ")}`,
        html,
      }),
    });
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      structuredLog("error", { msg: "email_failed", subscriptionId, status: r.status, body: text.slice(0, 500) }, requestId);
      return { sent: false, reason: `resend_${r.status}` };
    }
    return { sent: true };
  } catch (e) {
    structuredLog("error", { msg: "email_failed", subscriptionId, ...describeError(e) }, requestId);
    return { sent: false, reason: "exception" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const requestId = crypto.randomUUID();
  const requestStart = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    structuredLog("info", {
      msg: "monitor_start",
      consecutive_threshold: CONSECUTIVE_FAILURES,
      retry_rate_threshold: RETRY_RATE_THRESHOLD,
      window_minutes: WINDOW_MINUTES,
      min_deliveries: MIN_DELIVERIES,
      suppress_minutes: SUPPRESS_MINUTES,
    }, requestId);

    const { data: subs, error: subsError } = await supabase
      .from("winloss_webhook_subscriptions")
      .select("id, url")
      .eq("active", true);

    if (subsError) {
      structuredLog("error", { msg: "fetch_subscriptions_failed", error: subsError.message }, requestId);
      throw subsError;
    }

    const subscriptions = (subs as SubscriptionRow[] | null) ?? [];
    const sinceIso = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
    const suppressIso = new Date(Date.now() - SUPPRESS_MINUTES * 60_000).toISOString();

    const evaluations: EvaluationResult[] = [];
    let firedCount = 0;
    let suppressedCount = 0;

    for (const sub of subscriptions) {
      const { data: rows, error: rowsError } = await supabase
        .from("winloss_webhook_deliveries")
        .select("attempt, succeeded, status, error_message, created_at")
        .eq("subscription_id", sub.id)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(500);

      if (rowsError) {
        structuredLog("warn", { msg: "fetch_deliveries_failed", subscriptionId: sub.id, error: rowsError.message }, requestId);
        continue;
      }

      const deliveries = (rows as DeliveryRow[] | null) ?? [];
      const result = evaluate(deliveries);

      const evalEntry: EvaluationResult = {
        subscriptionId: sub.id,
        url: sub.url,
        total: result.total,
        failed: result.failed,
        retries: result.retries,
        retryRate: result.retryRate,
        consecutiveFailures: result.consecutiveFailures,
        fired: [],
        suppressed: [],
      };

      structuredLog("info", {
        msg: "subscription_evaluated",
        subscriptionId: sub.id,
        total: result.total,
        failed: result.failed,
        retries: result.retries,
        retry_rate: Number(result.retryRate.toFixed(3)),
        consecutive_failures: result.consecutiveFailures,
        triggers: result.triggers.map((t) => t.kind),
      }, requestId);

      if (result.triggers.length === 0) {
        evaluations.push(evalEntry);
        continue;
      }

      // Anti-spam: check recent alerts of the same kind
      const { data: recent, error: recentError } = await supabase
        .from("winloss_webhook_alerts")
        .select("kind, fired_at")
        .eq("subscription_id", sub.id)
        .gte("fired_at", suppressIso);

      if (recentError) {
        structuredLog("warn", { msg: "fetch_recent_alerts_failed", subscriptionId: sub.id, error: recentError.message }, requestId);
      }

      const recentKinds = new Set((recent ?? []).map((r) => (r as { kind: string }).kind));

      for (const trigger of result.triggers) {
        if (recentKinds.has(trigger.kind)) {
          structuredLog("info", {
            msg: "alert_suppressed",
            subscriptionId: sub.id,
            kind: trigger.kind,
            suppress_minutes: SUPPRESS_MINUTES,
          }, requestId);
          evalEntry.suppressed.push(trigger.kind);
          suppressedCount += 1;
          continue;
        }

        const { error: insertError } = await supabase.from("winloss_webhook_alerts").insert({
          subscription_id: sub.id,
          kind: trigger.kind,
          request_id: requestId,
          details: { ...trigger.details, request_id: requestId },
        });

        if (insertError) {
          structuredLog("error", {
            msg: "alert_insert_failed",
            subscriptionId: sub.id,
            kind: trigger.kind,
            error: insertError.message,
          }, requestId);
          continue;
        }

        structuredLog("warn", {
          msg: "alert_fired",
          subscriptionId: sub.id,
          kind: trigger.kind,
          details: trigger.details,
        }, requestId);

        evalEntry.fired.push(trigger.kind);
        firedCount += 1;
      }

      // One email per subscription summarizing newly fired triggers
      if (evalEntry.fired.length > 0) {
        await sendAlertEmail(sub.url, sub.id, result.triggers.filter((t) => evalEntry.fired.includes(t.kind)), requestId);
      }

      evaluations.push(evalEntry);
    }

    const totalLatency = Date.now() - requestStart;

    structuredLog(firedCount > 0 ? "warn" : "info", {
      msg: "monitor_complete",
      checked: subscriptions.length,
      fired: firedCount,
      suppressed: suppressedCount,
      latency_ms: totalLatency,
    }, requestId);

    return new Response(
      JSON.stringify({
        requestId,
        checked: subscriptions.length,
        fired: firedCount,
        suppressed: suppressedCount,
        evaluations,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json", "X-Request-Id": requestId } },
    );
  } catch (e) {
    structuredLog("error", {
      msg: "monitor_fatal",
      ...describeError(e),
      latency_ms: Date.now() - requestStart,
    }, requestId);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", requestId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Request-Id": requestId },
    });
  }
});
