import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { dispatchOne, type LogLevel, type Subscription } from "./retry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

function dispatchOneWithSupabase(
  sub: Subscription,
  payload: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  requestId: string,
) {
  return dispatchOne(sub, payload, {
    fetchFn: fetch,
    sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
    insertDelivery: async (row) => {
      const { error } = await supabase.from("winloss_webhook_deliveries").insert(row);
      if (error) throw error;
    },
    updateSubscription: async (id, status) => {
      await supabase
        .from("winloss_webhook_subscriptions")
        .update({ last_dispatch_at: new Date().toISOString(), last_status: status })
        .eq("id", id);
    },
    log: (level, data) => structuredLog(level, data, requestId),
  });
}

serve(async (req) => {
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
      structuredLog("error", { msg: "fetch_subscriptions_failed", event, error: subsError.message }, requestId);
      throw subsError;
    }

    const targets = ((subs as Subscription[] | null) ?? []).filter((s) => s.events.includes(event));
    structuredLog("info", {
      msg: "dispatch_start",
      event,
      candidates: subs?.length ?? 0,
      targets: targets.length,
      target_ids: targets.map((t) => t.id),
    }, requestId);

    const results = await Promise.all(targets.map((s) => dispatchOneWithSupabase(s, payload, supabase, requestId)));
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    structuredLog("error", {
      msg: "dispatcher_fatal",
      error: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
      latency_ms: Date.now() - requestStart,
    }, requestId);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", requestId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
