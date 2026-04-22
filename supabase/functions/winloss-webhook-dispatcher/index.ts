import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { describeError, dispatchOne, type DeadLetterEntry, type LogLevel, type Subscription } from "./retry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "x-request-id",
};

function structuredLog(level: LogLevel, data: Record<string, unknown>, requestId?: string) {
  const line = JSON.stringify({
    fn: "winloss-webhook-dispatcher",
    level,
    ts: new Date().toISOString(),
    requestId,
    ...data,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function buildDeps(
  supabase: ReturnType<typeof createClient>,
  requestId: string,
  replayOf: string | null,
) {
  return {
    fetchFn: fetch,
    sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
    insertDelivery: async (row: Parameters<typeof dispatchOne>[2]["insertDelivery"] extends (r: infer R) => unknown ? R : never) => {
      const { error } = await supabase.from("winloss_webhook_deliveries").insert(row);
      if (error) throw error;
    },
    updateSubscription: async (id: string, status: number) => {
      await supabase
        .from("winloss_webhook_subscriptions")
        .update({ last_dispatch_at: new Date().toISOString(), last_status: status })
        .eq("id", id);
    },
    onDeadLetter: async (entry: DeadLetterEntry) => {
      if (replayOf) {
        // Replay failed → update existing DLQ row instead of creating a new one.
        await supabase
          .from("winloss_webhook_dead_letters")
          .update({
            status: "pending",
            replay_count: ((await supabase.from("winloss_webhook_dead_letters").select("replay_count").eq("id", replayOf).single()).data?.replay_count ?? 0) + 1,
            last_replay_at: new Date().toISOString(),
            last_replay_status: entry.last_status,
            last_replay_error: entry.last_error,
          })
          .eq("id", replayOf);
      } else {
        await supabase.from("winloss_webhook_dead_letters").insert({
          subscription_id: entry.subscription_id,
          event: entry.event,
          payload: entry.payload,
          last_status: entry.last_status,
          last_error: entry.last_error,
          attempts: entry.attempts,
          total_latency_ms: entry.total_latency_ms,
          request_id: requestId,
        });
      }
    },
    log: (level: LogLevel, data: Record<string, unknown>) => structuredLog(level, data, requestId),
  };
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const requestId = crypto.randomUUID();
  const requestStart = Date.now();

  try {
    const payload = await req.json();
    const event = String(payload.event ?? "");
    if (!event) {
      structuredLog("warn", { msg: "invalid_payload", reason: "missing_event" }, requestId);
      return new Response(JSON.stringify({ error: "event required", requestId }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Request-Id": requestId },
      });
    }

    const targetSubId = typeof payload.__target_subscription_id === "string" ? payload.__target_subscription_id : null;
    const replayOf = typeof payload.__replay_of === "string" ? payload.__replay_of : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let targets: Subscription[];
    if (targetSubId) {
      const { data: sub, error } = await supabase
        .from("winloss_webhook_subscriptions")
        .select("id, url, events, secret, active")
        .eq("id", targetSubId)
        .maybeSingle();
      if (error || !sub) {
        structuredLog("error", { msg: "replay_subscription_missing", subscriptionId: targetSubId, error: error?.message }, requestId);
        return new Response(JSON.stringify({ error: "subscription not found", requestId }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json", "X-Request-Id": requestId },
        });
      }
      if (!sub.active) {
        structuredLog("warn", { msg: "replay_subscription_inactive", subscriptionId: targetSubId }, requestId);
      }
      targets = [{ id: sub.id as string, url: sub.url as string, events: sub.events as string[], secret: (sub.secret as string | null) ?? null }];
    } else {
      const { data: subs, error: subsError } = await supabase
        .from("winloss_webhook_subscriptions")
        .select("id, url, events, secret")
        .eq("active", true);
      if (subsError) {
        structuredLog("error", { msg: "fetch_subscriptions_failed", event, error: subsError.message }, requestId);
        throw subsError;
      }
      targets = ((subs as Subscription[] | null) ?? []).filter((s) => s.events.includes(event));
    }

    structuredLog("info", {
      msg: "dispatch_start",
      event,
      mode: replayOf ? "replay" : "broadcast",
      replay_of: replayOf,
      targets: targets.length,
      target_ids: targets.map((t) => t.id),
    }, requestId);

    // Per-subscription "planned" log → enables filtering the full lifecycle by subscriptionId
    for (const t of targets) {
      structuredLog("info", {
        msg: "subscription_planned",
        event,
        mode: replayOf ? "replay" : "broadcast",
        subscriptionId: t.id,
        url: t.url,
      }, requestId);
    }

    const deps = buildDeps(supabase, requestId, replayOf);
    const results = await Promise.all(targets.map((s) => dispatchOne(s, payload, deps)));

    // Per-subscription outcome log → end-of-flow marker per subscriptionId
    for (const r of results) {
      structuredLog(r.succeeded ? "info" : "warn", {
        msg: "subscription_outcome",
        event,
        subscriptionId: r.id,
        succeeded: r.succeeded,
        final_status: r.status,
        attempts: r.attempts,
        total_latency_ms: r.total_latency_ms,
        error: r.error,
      }, requestId);
    }

    // On replay success, mark the original DLQ row as replayed.
    if (replayOf && results.length === 1 && results[0].succeeded) {
      const { data: existing } = await supabase
        .from("winloss_webhook_dead_letters")
        .select("replay_count")
        .eq("id", replayOf)
        .single();
      await supabase
        .from("winloss_webhook_dead_letters")
        .update({
          status: "replayed",
          replay_count: (existing?.replay_count ?? 0) + 1,
          last_replay_at: new Date().toISOString(),
          last_replay_status: results[0].status,
          last_replay_error: null,
        })
        .eq("id", replayOf);
    }

    const succeededCount = results.filter((r) => r.succeeded).length;
    const failedCount = results.length - succeededCount;
    const totalLatency = Date.now() - requestStart;

    structuredLog(failedCount > 0 ? "warn" : "info", {
      msg: "dispatch_complete",
      event,
      dispatched: results.length,
      succeeded: succeededCount,
      failed: failedCount,
      total_latency_ms: totalLatency,
      results,
    }, requestId);

    return new Response(JSON.stringify({ requestId, dispatched: results.length, succeeded: succeededCount, failed: failedCount, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Request-Id": requestId },
    });
  } catch (e) {
    structuredLog("error", {
      msg: "dispatcher_fatal",
      ...describeError(e),
      latency_ms: Date.now() - requestStart,
    }, requestId);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", requestId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Request-Id": requestId },
    });
  }
};

serve(handler);
