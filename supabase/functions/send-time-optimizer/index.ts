import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface OpenEvent {
  tracked_at: string;
  sale_id: string | null;
}

function wilsonLowerBound(positives: number, total: number): number {
  if (total === 0) return 0;
  const z = 1.96;
  const phat = positives / total;
  const denom = 1 + (z * z) / total;
  const center = phat + (z * z) / (2 * total);
  const margin = z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * total)) / total);
  return Math.max(0, Math.min(1, (center - margin) / denom));
}

function aggregate(events: OpenEvent[]) {
  const tz = "America/Sao_Paulo";
  const hourBuckets = new Array(24).fill(0);
  const dowBuckets = new Array(7).fill(0);
  for (const e of events) {
    const d = new Date(e.tracked_at);
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour12: false, weekday: "short", hour: "2-digit",
    }).formatToParts(d);
    const hour = parseInt(fmt.find((p) => p.type === "hour")?.value ?? "0", 10);
    const wd = fmt.find((p) => p.type === "weekday")?.value ?? "Sun";
    const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    hourBuckets[hour]++;
    dowBuckets[map[wd] ?? 0]++;
  }
  let bestHour = 10, hMax = -1;
  hourBuckets.forEach((v, i) => { if (v > hMax) { hMax = v; bestHour = i; } });
  let bestDow = 2, dMax = -1;
  dowBuckets.forEach((v, i) => { if (v > dMax) { dMax = v; bestDow = i; } });
  return { hourBuckets, dowBuckets, bestHour, bestDow };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const body = await req.json().catch(() => ({}));
    const { sale_ids, recompute_all } = body as { sale_ids?: string[]; recompute_all?: boolean };

    let targets: string[] = [];
    if (sale_ids?.length) {
      targets = sale_ids;
    } else if (recompute_all) {
      const { data } = await admin.from("sales").select("id").limit(500);
      targets = (data ?? []).map((r: { id: string }) => r.id);
    } else {
      return new Response(JSON.stringify({ error: "sale_ids or recompute_all required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: globalStats } = await admin.rpc("get_global_send_time_stats");
    const fallback = Array.isArray(globalStats) && globalStats[0] ? globalStats[0] : { best_hour: 10, best_dow: 2, sample_size: 0 };

    let updated = 0, fallbacks = 0;
    const since = new Date(Date.now() - 90 * 86400000).toISOString();

    for (const saleId of targets) {
      const { data: events } = await admin
        .from("email_tracking_events")
        .select("tracked_at, sale_id")
        .eq("sale_id", saleId)
        .in("event_type", ["open", "opened"])
        .gte("tracked_at", since)
        .limit(2000);

      const list = (events ?? []) as OpenEvent[];
      const sample = list.length;

      let bestHour: number, bestDow: number, hourBuckets: number[], dowBuckets: number[], confidence: number;
      if (sample < 3) {
        bestHour = fallback.best_hour; bestDow = fallback.best_dow;
        hourBuckets = new Array(24).fill(0); dowBuckets = new Array(7).fill(0);
        confidence = 0;
        fallbacks++;
      } else {
        const agg = aggregate(list);
        bestHour = agg.bestHour; bestDow = agg.bestDow;
        hourBuckets = agg.hourBuckets; dowBuckets = agg.dowBuckets;
        const peak = Math.max(...hourBuckets);
        confidence = wilsonLowerBound(peak, sample);
      }

      const { error } = await admin.from("send_time_profiles").upsert({
        sale_id: saleId,
        best_hour: bestHour,
        best_dow: bestDow,
        confidence,
        sample_size: sample,
        hour_distribution: hourBuckets,
        dow_distribution: dowBuckets,
        last_calculated_at: new Date().toISOString(),
      }, { onConflict: "sale_id" });

      if (!error) updated++;
    }

    return new Response(JSON.stringify({ updated, fallbacks, total: targets.length }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
