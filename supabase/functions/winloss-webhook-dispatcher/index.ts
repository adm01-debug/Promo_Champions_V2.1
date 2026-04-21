import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Subscription { id: string; url: string; events: string[]; secret: string | null }

const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 8000;

function backoffDelay(attempt: number): number {
  // Exponential with jitter: 250ms, 500ms, 1000ms (+ up to 250ms jitter), capped at 8s
  const base = Math.min(8000, 2 ** (attempt - 1) * 250);
  return base + Math.floor(Math.random() * 250);
}

function structuredLog(level: "info" | "warn" | "error", data: Record<string, unknown>) {
  const line = JSON.stringify({ fn: "winloss-webhook-dispatcher", level, ts: new Date().toISOString(), ...data });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

async function dispatchOne(
  sub: Subscription,
  payload: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
) {
  const body = JSON.stringify({ ...payload, dispatched_at: new Date().toISOString() });
  const event = String(payload.event ?? "unknown");
  let finalStatus = 0;
  let finalAttempt = 0;
  let succeeded = false;
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    finalAttempt = attempt;
    const start = Date.now();
    let status = 0;
    let errorMessage: string | null = null;

    try {
      const res = await fetch(sub.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Winloss-Event": event,
          ...(sub.secret ? { "X-Winloss-Signature": sub.secret } : {}),
        },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      status = res.status;
      // Drain body to free connection
      try { await res.text(); } catch { /* noop */ }
    } catch (e) {
      errorMessage = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      lastError = errorMessage;
    }

    const duration = Date.now() - start;
    const ok = status >= 200 && status < 300;
    succeeded = ok;
    finalStatus = status;

    structuredLog(ok ? "info" : "warn", {
      msg: "delivery_attempt",
      subscription_id: sub.id,
      url: sub.url,
      event,
      attempt,
      status,
      duration_ms: duration,
      error: errorMessage,
    });

    // Persist delivery log (best-effort)
    try {
      await supabase.from("winloss_webhook_deliveries").insert({
        subscription_id: sub.id,
        event,
        payload,
        attempt,
        status,
        error_message: errorMessage,
        duration_ms: duration,
        succeeded: ok,
      });
    } catch (logErr) {
      structuredLog("error", { msg: "delivery_log_insert_failed", subscription_id: sub.id, error: String(logErr) });
    }

    if (ok) break;
    if (attempt < MAX_ATTEMPTS) {
      const wait = backoffDelay(attempt);
      structuredLog("info", { msg: "backoff", subscription_id: sub.id, attempt, wait_ms: wait });
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  await supabase
    .from("winloss_webhook_subscriptions")
    .update({ last_dispatch_at: new Date().toISOString(), last_status: finalStatus })
    .eq("id", sub.id);

  return { id: sub.id, status: finalStatus, attempts: finalAttempt, succeeded, error: lastError };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const event = String(payload.event ?? "");
    if (!event) {
      return new Response(JSON.stringify({ error: "event required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: subs, error: subsError } = await supabase
      .from("winloss_webhook_subscriptions")
      .select("id, url, events, secret")
      .eq("active", true);

    if (subsError) {
      structuredLog("error", { msg: "fetch_subscriptions_failed", error: subsError.message });
      throw subsError;
    }

    const targets = ((subs as Subscription[] | null) ?? []).filter((s) => s.events.includes(event));
    structuredLog("info", { msg: "dispatch_start", event, candidates: subs?.length ?? 0, targets: targets.length });

    const results = await Promise.all(targets.map((s) => dispatchOne(s, payload, supabase)));
    structuredLog("info", { msg: "dispatch_complete", event, dispatched: results.length, results });

    return new Response(JSON.stringify({ dispatched: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    structuredLog("error", { msg: "dispatcher_fatal", error: e instanceof Error ? e.message : String(e) });
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
