import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { isAuthorizedCronRequest } from "../_shared/cron-request-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { evaluateAlerts, type AlertContext } from "./alerts.ts";
import { withRequestId } from "../_shared/request-id.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const MAX_ATTEMPTS = 5;

function log(level: "info" | "warn" | "error", event: string, data: Record<string, unknown> = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...data });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

Deno.serve(withRequestId("check-v4-callback-alerts", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    log("error", "supabase_service_credentials_missing");
    return new Response(JSON.stringify({ error: "service_not_configured" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const authorized = await isAuthorizedCronRequest(req, async () => {
      const { data, error } = await supabase
        .from("_internal_secrets")
        .select("value")
        .eq("key", "coaching_cron_secret")
        .maybeSingle();
      if (error) throw error;
      return (data as { value?: string | null } | null)?.value;
    });
    if (!authorized) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    log("error", "cron_authorization_unavailable", {
      message: error instanceof Error ? error.message : String(error),
    });
    return new Response(JSON.stringify({ error: "authorization_unavailable" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: settings } = await supabase
    .from("v4_callback_alert_settings")
    .select("is_active, window_minutes, min_events, failure_rate_threshold, exhausted_threshold_24h, pending_threshold, suppress_minutes")
    .eq("singleton", true)
    .maybeSingle();

  if (!settings || !settings.is_active) {
    log("info", "v4_alerts_disabled", {});
    return new Response(JSON.stringify({ success: true, skipped: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const windowMinutes = settings.window_minutes as number;
  const now = Date.now();
  const winStart = new Date(now - windowMinutes * 60_000).toISOString();
  const dayStart = new Date(now - 24 * 60 * 60_000).toISOString();

  const [okQ, failedQ, exhaustedQ, pendingQ] = await Promise.all([
    supabase.from("v4_callback_dead_letters").select("id", { count: "exact", head: true })
      .gte("resolved_at", winStart),
    supabase.from("v4_callback_dead_letters").select("id", { count: "exact", head: true })
      .is("resolved_at", null).gt("attempts", 0).gte("updated_at", winStart),
    supabase.from("v4_callback_dead_letters").select("id", { count: "exact", head: true })
      .is("resolved_at", null).gte("attempts", MAX_ATTEMPTS).gte("updated_at", dayStart),
    supabase.from("v4_callback_dead_letters").select("id", { count: "exact", head: true })
      .is("resolved_at", null).lt("attempts", MAX_ATTEMPTS),
  ]);

  const ctx: AlertContext = {
    windowMinutes,
    minEvents: settings.min_events,
    failureRateThreshold: Number(settings.failure_rate_threshold),
    exhaustedThreshold24h: settings.exhausted_threshold_24h,
    pendingThreshold: settings.pending_threshold,
    ok: okQ.count ?? 0,
    failed: failedQ.count ?? 0,
    exhausted24h: exhaustedQ.count ?? 0,
    pending: pendingQ.count ?? 0,
  };

  const candidates = evaluateAlerts(ctx);
  const suppressStart = new Date(now - settings.suppress_minutes * 60_000).toISOString();

  const fired: string[] = [];
  if (candidates.length > 0) {
    // Batch-check suppression for all candidates in one query — eliminates N+1
    const candidateKinds = candidates.map(c => c.kind);
    const { data: recentlyFired } = await supabase
      .from("v4_callback_alerts")
      .select("kind")
      .in("kind", candidateKinds)
      .gte("fired_at", suppressStart)
      .limit(candidateKinds.length);

    const suppressedKinds = new Set((recentlyFired ?? []).map(r => r.kind));
    const toFire = candidates.filter(c => !suppressedKinds.has(c.kind));

    if (toFire.length > 0) {
      const alertRows = toFire.map(c => ({ kind: c.kind, details: c.details }));
      const { error: insErr } = await supabase.from("v4_callback_alerts").insert(alertRows);
      if (insErr) {
        log("error", "v4_alert_insert_failed", { message: insErr.message });
      } else {
        for (const c of toFire) {
          fired.push(c.kind);
          log("warn", "v4_alert_fired", { kind: c.kind, ...c.details });
        }
      }
    }
  }

  return new Response(JSON.stringify({ success: true, evaluated: ctx, fired }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}));
