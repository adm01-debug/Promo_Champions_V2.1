import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { evaluateAlerts, type AlertContext } from "./alerts.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MAX_ATTEMPTS = 5;

function log(level: "info" | "warn" | "error", event: string, data: Record<string, unknown> = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...data });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: settings } = await supabase
    .from("v4_callback_alert_settings")
    .select("*")
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
  for (const c of candidates) {
    const { data: recent } = await supabase
      .from("v4_callback_alerts")
      .select("id")
      .eq("kind", c.kind)
      .gte("fired_at", suppressStart)
      .limit(1)
      .maybeSingle();
    if (recent) continue;
    const { error: insErr } = await supabase.from("v4_callback_alerts").insert({ kind: c.kind, details: c.details });
    if (insErr) log("error", "v4_alert_insert_failed", { kind: c.kind, message: insErr.message });
    else { fired.push(c.kind); log("warn", "v4_alert_fired", { kind: c.kind, ...c.details }); }
  }

  return new Response(JSON.stringify({ success: true, evaluated: ctx, fired }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
