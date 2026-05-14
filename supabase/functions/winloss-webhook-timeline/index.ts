import { corsHeaders } from "../_shared/cors.ts";
// Endpoint: GET/POST winloss-webhook-timeline
// Returns a unified, chronologically sorted timeline of webhook events
// correlated by `requestId` and/or `subscriptionId`.
//
// Sources merged into the timeline:
//   - winloss_webhook_deliveries  (one row per HTTP attempt; has request_id)
//   - winloss_webhook_dead_letters (final failure rows; has request_id)
//   - winloss_webhook_alerts       (monitor-fired alerts per subscription)
//
// Auth: admin only (via has_role check, same pattern as winloss-webhook-replay).
// Response shape: { requestId, filters, count, items: TimelineItem[] }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";



function describeError(e: unknown): { error_name: string; error: string } {
  if (e instanceof Error) return { error_name: e.name || "Error", error: e.message || String(e) };
  return { error_name: "UnknownError", error: String(e) };
}

function jlog(level: "info" | "warn" | "error", data: Record<string, unknown>) {
  const line = JSON.stringify({ fn: "winloss-webhook-timeline", level, ts: new Date().toISOString(), ...data });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

function jsonResponse(body: unknown, status = 200, requestId?: string): Response {
  const headers: Record<string, string> = { ...corsHeaders, "Content-Type": "application/json" };
  if (requestId) headers["X-Request-Id"] = requestId;
  return new Response(JSON.stringify(body), { status, headers });
}

const InputSchema = z
  .object({
    requestId: z.string().uuid().optional(),
    subscriptionId: z.string().uuid().optional(),
    /** ISO timestamp lower bound. Defaults to now-7d when omitted. */
    since: z.string().datetime().optional(),
    /** Hard cap on items returned (default 200, max 500). */
    limit: z.number().int().min(1).max(500).optional(),
  })
  .refine(
    (v) => Boolean(v.requestId || v.subscriptionId),
    { message: "Provide at least one of requestId or subscriptionId." },
  );

type TimelineItem = {
  ts: string;
  source: "delivery" | "dead_letter" | "alert";
  kind: string;
  subscription_id: string;
  request_id: string | null;
  status: number | null;
  succeeded: boolean | null;
  attempt: number | null;
  duration_ms: number | null;
  event: string | null;
  message: string | null;
  ref_id: string;
  details: Record<string, unknown>;
};

async function assertAdmin(supabase: SupabaseClient, userId: string, requestId: string): Promise<Response | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) {
    jlog("error", { msg: "auth_role_lookup_failed", requestId, userId, ...describeError(error) });
    return jsonResponse({ error: "Forbidden", requestId }, 403, requestId);
  }
  if (!data) {
    jlog("warn", { msg: "auth_forbidden", requestId, userId });
    return jsonResponse({ error: "Forbidden", requestId }, 403, requestId);
  }
  return null;
}

async function readInput(req: Request): Promise<unknown> {
  if (req.method === "GET") {
    const u = new URL(req.url);
    const limitRaw = u.searchParams.get("limit");
    const out: Record<string, unknown> = {};
    const requestId = u.searchParams.get("requestId");
    const subscriptionId = u.searchParams.get("subscriptionId");
    const since = u.searchParams.get("since");
    if (requestId) out.requestId = requestId;
    if (subscriptionId) out.subscriptionId = subscriptionId;
    if (since) out.since = since;
    if (limitRaw) {
      const n = Number(limitRaw);
      if (Number.isFinite(n)) out.limit = n;
    }
    return out;
  }
  return await req.json().catch(() => ({}));
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const requestId = crypto.randomUUID();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized", requestId }, 401, requestId);
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: claimsErr } = await supabaseAuth.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      jlog("warn", { msg: "auth_invalid_token", requestId });
      return jsonResponse({ error: "Unauthorized", requestId }, 401, requestId);
    }
    const userId = claims.claims.sub as string;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const denied = await assertAdmin(supabase, userId, requestId);
    if (denied) return denied;

    const raw = await readInput(req);
    const parsed = InputSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonResponse(
        {
          error: "invalid_input",
          message: "Provide requestId and/or subscriptionId (uuid). Optional: since (ISO), limit (1-500).",
          details: parsed.error.flatten(),
          requestId,
        },
        400,
        requestId,
      );
    }

    const { requestId: filterRequestId, subscriptionId, since, limit } = parsed.data;
    const sinceIso = since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const cap = limit ?? 200;

    jlog("info", {
      msg: "timeline_query_start",
      requestId,
      filters: { requestId: filterRequestId ?? null, subscriptionId: subscriptionId ?? null, since: sinceIso, limit: cap },
    });

    // --- Deliveries ---
    let deliveriesQ = supabase
      .from("winloss_webhook_deliveries")
      .select("id, subscription_id, request_id, event, attempt, status, succeeded, duration_ms, error_message, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(cap);
    if (filterRequestId) deliveriesQ = deliveriesQ.eq("request_id", filterRequestId);
    if (subscriptionId) deliveriesQ = deliveriesQ.eq("subscription_id", subscriptionId);

    // --- Dead letters ---
    let dlqQ = supabase
      .from("winloss_webhook_dead_letters")
      .select("id, subscription_id, request_id, event, attempts, last_status, last_error, total_latency_ms, status, replay_count, created_at, last_replay_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(cap);
    if (filterRequestId) dlqQ = dlqQ.eq("request_id", filterRequestId);
    if (subscriptionId) dlqQ = dlqQ.eq("subscription_id", subscriptionId);

    // --- Alerts ---
    // Now correlates by request_id (top-level column) and/or subscription_id.
    let alertsQ = supabase
      .from("winloss_webhook_alerts")
      .select("id, subscription_id, request_id, kind, details, fired_at")
      .gte("fired_at", sinceIso)
      .order("fired_at", { ascending: false })
      .limit(cap);
    if (filterRequestId) alertsQ = alertsQ.eq("request_id", filterRequestId);
    if (subscriptionId) alertsQ = alertsQ.eq("subscription_id", subscriptionId);
    const alertsPromise = alertsQ;

    const [deliveriesRes, dlqRes, alertsRes] = await Promise.all([deliveriesQ, dlqQ, alertsPromise]);
    if (deliveriesRes.error) throw deliveriesRes.error;
    if (dlqRes.error) throw dlqRes.error;
    if (alertsRes.error) throw alertsRes.error;

    const items: TimelineItem[] = [];

    for (const r of (deliveriesRes.data ?? []) as Array<Record<string, unknown>>) {
      const succeeded = Boolean(r.succeeded);
      items.push({
        ts: String(r.created_at),
        source: "delivery",
        kind: succeeded ? "delivery_success" : "delivery_failure",
        subscription_id: String(r.subscription_id),
        request_id: (r.request_id as string | null) ?? null,
        status: (r.status as number | null) ?? null,
        succeeded,
        attempt: (r.attempt as number | null) ?? null,
        duration_ms: (r.duration_ms as number | null) ?? null,
        event: (r.event as string | null) ?? null,
        message: (r.error_message as string | null) ?? null,
        ref_id: String(r.id),
        details: {},
      });
    }

    for (const r of (dlqRes.data ?? []) as Array<Record<string, unknown>>) {
      items.push({
        ts: String(r.created_at),
        source: "dead_letter",
        kind: "dead_letter",
        subscription_id: String(r.subscription_id),
        request_id: (r.request_id as string | null) ?? null,
        status: (r.last_status as number | null) ?? null,
        succeeded: false,
        attempt: (r.attempts as number | null) ?? null,
        duration_ms: (r.total_latency_ms as number | null) ?? null,
        event: (r.event as string | null) ?? null,
        message: (r.last_error as string | null) ?? null,
        ref_id: String(r.id),
        details: {
          dlq_status: r.status,
          replay_count: r.replay_count,
          last_replay_at: r.last_replay_at,
        },
      });
    }

    for (const r of (alertsRes.data ?? []) as Array<Record<string, unknown>>) {
      items.push({
        ts: String(r.fired_at),
        source: "alert",
        kind: `alert_${String(r.kind)}`,
        subscription_id: String(r.subscription_id),
        request_id: (r.request_id as string | null) ?? null,
        status: null,
        succeeded: null,
        attempt: null,
        duration_ms: null,
        event: null,
        message: typeof r.kind === "string" ? `Monitor fired: ${r.kind}` : "Monitor fired",
        ref_id: String(r.id),
        details: (r.details as Record<string, unknown>) ?? {},
      });
    }

    items.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
    const limited = items.slice(0, cap);

    jlog("info", {
      msg: "timeline_query_complete",
      requestId,
      counts: {
        deliveries: deliveriesRes.data?.length ?? 0,
        dead_letters: dlqRes.data?.length ?? 0,
        alerts: alertsRes.data?.length ?? 0,
        returned: limited.length,
      },
    });

    return jsonResponse(
      {
        requestId,
        filters: {
          requestId: filterRequestId ?? null,
          subscriptionId: subscriptionId ?? null,
          since: sinceIso,
          limit: cap,
        },
        count: limited.length,
        items: limited,
      },
      200,
      requestId,
    );
  } catch (e) {
    jlog("error", { msg: "timeline_fatal", requestId, ...describeError(e) });
    return jsonResponse(
      { error: e instanceof Error ? e.message : "unknown", requestId },
      500,
      requestId,
    );
  }
};

serve(handler);
