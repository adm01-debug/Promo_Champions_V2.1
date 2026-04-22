import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { describeError, dispatchOne, type DeadLetterEntry, type LogLevel, type Subscription } from "./retry.ts";
import { DispatcherPayloadSchema } from "./schema.ts";

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
    sleep: (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms)),
    insertDelivery: async (row: Parameters<typeof dispatchOne>[2]["insertDelivery"] extends (r: infer R) => unknown ? R : never) => {
      // Augment with request_id so each delivery row can be correlated back to the
      // dispatcher invocation that produced it (used by the timeline endpoint).
      const enriched = { ...(row as unknown as Record<string, unknown>), request_id: requestId };
      const { error } = await supabase.from("winloss_webhook_deliveries").insert(enriched);
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
            replay_count: (((await supabase.from("winloss_webhook_dead_letters").select("replay_count").eq("id", replayOf).single()).data as { replay_count?: number } | null)?.replay_count ?? 0) + 1,
            last_replay_at: new Date().toISOString(),
            last_replay_status: entry.last_status,
            last_replay_error: entry.last_error,
            last_replay_request_id: requestId,
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
    requestId,
  };
}

/**
 * Standard response envelope. Every non-OPTIONS response — success or error —
 * includes the same four canonical fields so clients can rely on a stable
 * troubleshooting payload:
 *   { requestId, error, dispatched, results }
 *
 * On success, `error` is null. On error, `dispatched` is 0 and `results` is [].
 * Extra fields (succeeded, failed, etc.) may be appended for richer telemetry
 * but the four canonical keys are always present.
 */
function envelope(
  requestId: string,
  status: number,
  fields: { error?: string | null; dispatched?: number; results?: unknown[]; extra?: Record<string, unknown> } = {},
): Response {
  const body = {
    requestId,
    error: fields.error ?? null,
    dispatched: fields.dispatched ?? 0,
    results: fields.results ?? [],
    ...(fields.extra ?? {}),
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "X-Request-Id": requestId },
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Honor an inbound X-Request-Id header (or payload.__request_id) so internal
  // callers — like winloss-webhook-replay — can stitch the entire flow under
  // one correlation id end-to-end. Falls back to a freshly generated UUID.
  const inboundHeaderId = req.headers.get("x-request-id") ?? req.headers.get("X-Request-Id");
  let requestId = inboundHeaderId && UUID_RE.test(inboundHeaderId)
    ? inboundHeaderId
    : crypto.randomUUID();
  const requestStart = Date.now();

  try {
    const rawPayload = await req.json().catch(() => null);
    if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
      structuredLog("warn", { msg: "invalid_payload", reason: "not_an_object" }, requestId);
      return envelope(requestId, 400, { error: "invalid payload (object required)" });
    }

    // Zod-validate the dispatcher contract BEFORE any DB lookup or fan-out.
    const parsed = DispatcherPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      structuredLog("warn", { msg: "invalid_payload", reason: "schema", details: flat }, requestId);
      const firstFieldErr = Object.values(flat.fieldErrors).flat()[0];
      return envelope(requestId, 400, {
        error: firstFieldErr ?? flat.formErrors[0] ?? "invalid payload",
        extra: { details: flat },
      });
    }
    const payload = parsed.data;

    // Adopt the validated correlation id from the payload if present.
    if (payload.__request_id) requestId = payload.__request_id;

    const event = payload.event;
    const targetSubId = payload.__target_subscription_id ?? null;
    const replayOf = payload.__replay_of ?? null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let targets: Subscription[];
    let activeSubsCount = 0;
    if (targetSubId) {
      const { data: sub, error } = await supabase
        .from("winloss_webhook_subscriptions")
        .select("id, url, events, secret, active")
        .eq("id", targetSubId)
        .maybeSingle();
      if (error || !sub) {
        structuredLog("error", { msg: "replay_subscription_missing", subscriptionId: targetSubId, error: error?.message }, requestId);
        return envelope(requestId, 404, { error: "subscription not found" });
      }
      if (!sub.active) {
        structuredLog("warn", {
          msg: "replay_rejected_inactive_subscription",
          subscriptionId: targetSubId,
          event,
          replay_of: replayOf,
        }, requestId);
        return envelope(requestId, 409, {
          error: "subscription is inactive",
          extra: { subscriptionId: targetSubId, reason: "inactive_subscription" },
        });
      }
      targets = [{ id: sub.id as string, url: sub.url as string, events: sub.events as string[], secret: (sub.secret as string | null) ?? null }];
      activeSubsCount = 1;
    } else {
      const { data: subs, error: subsError } = await supabase
        .from("winloss_webhook_subscriptions")
        .select("id, url, events, secret")
        .eq("active", true);
      if (subsError) {
        structuredLog("error", { msg: "fetch_subscriptions_failed", event, error: subsError.message }, requestId);
        throw subsError;
      }
      const allActive = (subs as Subscription[] | null) ?? [];
      activeSubsCount = allActive.length;
      targets = allActive.filter((s) => s.events.includes(event));

      // Silent-failure detection: in broadcast mode an empty target set means no
      // subscriber will ever receive this event. Emit a structured warn log AND
      // persist a metric row so admins can alert on it without scraping logs.
      if (targets.length === 0) {
        const reason = activeSubsCount === 0 ? "no_active_subscriptions" : "no_event_match";
        structuredLog("warn", {
          msg: "broadcast_no_subscribers",
          event,
          mode: "broadcast",
          active_subscriptions_count: activeSubsCount,
          matching_subscriptions_count: 0,
          reason,
        }, requestId);

        try {
          const { error: metricError } = await supabase
            .from("winloss_webhook_dispatch_metrics")
            .insert({
              metric: "broadcast_no_subscribers",
              event,
              request_id: requestId,
              active_subscriptions_count: activeSubsCount,
              matching_subscriptions_count: 0,
              metadata: { reason },
            });
          if (metricError) {
            structuredLog("error", {
              msg: "metric_insert_failed",
              metric: "broadcast_no_subscribers",
              error: metricError.message,
            }, requestId);
          }
        } catch (metricEx) {
          structuredLog("error", {
            msg: "metric_insert_exception",
            metric: "broadcast_no_subscribers",
            ...describeError(metricEx),
          }, requestId);
        }
      }
    }

    structuredLog("info", {
      msg: "dispatch_start",
      event,
      mode: replayOf ? "replay" : "broadcast",
      replay_of: replayOf,
      targets: targets.length,
      active_subscriptions_count: activeSubsCount,
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

    const deps = buildDeps(supabase as unknown as ReturnType<typeof createClient>, requestId, replayOf);
    const results = await Promise.all(targets.map((s) => dispatchOne(s, payload, deps as unknown as Parameters<typeof dispatchOne>[2])));

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
          last_replay_request_id: requestId,
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

    return envelope(requestId, 200, {
      dispatched: results.length,
      results,
      extra: { succeeded: succeededCount, failed: failedCount },
    });
  } catch (e) {
    structuredLog("error", {
      msg: "dispatcher_fatal",
      ...describeError(e),
      latency_ms: Date.now() - requestStart,
    }, requestId);
    return envelope(requestId, 500, { error: e instanceof Error ? e.message : "unknown" });
  }
};

serve(handler);
