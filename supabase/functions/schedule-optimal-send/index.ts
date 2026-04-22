import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function nextOccurrence(dow: number, hour: number, tz = "America/Sao_Paulo"): Date {
  const now = new Date();
  // Compute current dow/hour in target tz
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", hour: "2-digit", hour12: false }).formatToParts(now);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const curDow = map[wd] ?? 0;
  const curHour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);

  let dayDiff = (dow - curDow + 7) % 7;
  if (dayDiff === 0 && hour <= curHour) dayDiff = 7;
  const target = new Date(now.getTime() + dayDiff * 86400000);
  // approximate target hour in UTC - shift by -3h for São Paulo (BRT, no DST anymore)
  target.setUTCHours(hour + 3, 0, 0, 0);
  return target;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const body = await req.json();
    const { sale_id, channel, payload, force_now } = body as { sale_id: string; channel: string; payload: Record<string, unknown>; force_now?: boolean };

    if (!sale_id || !channel || !payload) {
      return new Response(JSON.stringify({ error: "sale_id, channel, payload required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let scheduledFor: Date;
    let source: "profile" | "global" | "manual" = "manual";
    let confidence = 0;

    if (force_now) {
      scheduledFor = new Date();
    } else {
      const { data: profile } = await admin.from("send_time_profiles").select("*").eq("sale_id", sale_id).maybeSingle();
      if (profile && profile.confidence > 0) {
        scheduledFor = nextOccurrence(profile.best_dow, profile.best_hour);
        source = "profile";
        confidence = Number(profile.confidence);
      } else {
        const { data: g } = await admin.rpc("get_global_send_time_stats");
        const stats = Array.isArray(g) && g[0] ? g[0] : { best_hour: 10, best_dow: 2 };
        scheduledFor = nextOccurrence(stats.best_dow, stats.best_hour);
        source = "global";
      }
    }

    const { data: inserted, error } = await admin.from("scheduled_sends").insert({
      owner_id: user.id,
      sale_id, channel, payload,
      scheduled_for: scheduledFor.toISOString(),
      optimization_source: source,
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({
      id: inserted.id,
      scheduled_for: scheduledFor.toISOString(),
      source, confidence,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
