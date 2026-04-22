import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const BUCKETS = [
  { min: 0, max: 20 },
  { min: 20, max: 40 },
  { min: 40, max: 60 },
  { min: 60, max: 80 },
  { min: 80, max: 100 },
];

const STAGE_DEFAULT_PROB: Record<string, number> = {
  lead: 10,
  prospecting: 20,
  qualified: 35,
  proposal: 55,
  negotiation: 75,
  won: 100,
  lost: 0,
  closed: 100,
};

function findBucket(p: number) {
  return BUCKETS.find((b) => p >= b.min && p < b.max) ?? BUCKETS[BUCKETS.length - 1];
}

function getDeclaredProbability(sale: any): number {
  if (typeof sale.probability === "number") return Number(sale.probability);
  const stage = (sale.stage ?? sale.status ?? "").toString().toLowerCase();
  return STAGE_DEFAULT_PROB[stage] ?? 30;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const since = new Date(Date.now() - 180 * 86400_000).toISOString();

    const { data: closed, error: e1 } = await supabase
      .from("sales")
      .select("id, status, stage, probability, salesperson_id, segment, category, source, created_at, updated_at")
      .in("status", ["completed", "lost", "won", "cancelled"])
      .gte("updated_at", since)
      .limit(5000);
    if (e1) throw e1;

    const groups = new Map<string, any[]>();
    for (const s of closed ?? []) {
      const stage = (s.stage ?? s.status ?? "unknown").toString().toLowerCase();
      const segment = (s.segment ?? s.category ?? "all").toString();
      const key = `${stage}::${segment}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    }

    const bucketRows: any[] = [];
    for (const [key, deals] of groups.entries()) {
      if (deals.length < 20) continue;
      const [stage, segment] = key.split("::");
      for (const b of BUCKETS) {
        const inBucket = deals.filter((d) => {
          const p = getDeclaredProbability(d);
          return p >= b.min && p < (b.max === 100 ? 101 : b.max);
        });
        if (inBucket.length === 0) continue;
        const wins = inBucket.filter((d) => ["completed", "won"].includes(String(d.status).toLowerCase())).length;
        const winRate = wins / inBucket.length;
        bucketRows.push({
          stage,
          segment,
          bucket_min: b.min,
          bucket_max: b.max,
          actual_win_rate: Number(winRate.toFixed(4)),
          sample_size: inBucket.length,
          computed_at: new Date().toISOString(),
        });
      }
    }

    if (bucketRows.length > 0) {
      const { error: eb } = await supabase
        .from("win_calibration_buckets")
        .upsert(bucketRows, { onConflict: "stage,segment,bucket_min" });
      if (eb) throw eb;
    }

    const { data: open, error: e2 } = await supabase
      .from("sales")
      .select("id, status, stage, probability, salesperson_id, segment, category, source")
      .not("status", "in", "(completed,lost,won,cancelled)")
      .limit(5000);
    if (e2) throw e2;

    const { data: allBuckets } = await supabase.from("win_calibration_buckets").select("*");
    const bucketMap = new Map<string, any>();
    for (const b of allBuckets ?? []) {
      bucketMap.set(`${b.stage}::${b.segment}::${b.bucket_min}`, b);
    }

    const calibrations: any[] = [];
    for (const s of open ?? []) {
      const stage = (s.stage ?? s.status ?? "unknown").toString().toLowerCase();
      const segment = (s.segment ?? s.category ?? "all").toString();
      const declared = getDeclaredProbability(s);
      const b = findBucket(declared);
      const bucket = bucketMap.get(`${stage}::${segment}::${b.min}`)
        ?? bucketMap.get(`${stage}::all::${b.min}`);
      const historical = bucket ? Number(bucket.actual_win_rate) * 100 : declared;
      const sample = bucket?.sample_size ?? 0;
      const calibrated = bucket ? historical : declared;
      const delta = calibrated - declared;
      const flag = delta < -15 ? "overconfident" : delta > 15 ? "underconfident" : "aligned";
      const confidence = sample >= 100 ? "high" : sample >= 30 ? "medium" : "low";

      calibrations.push({
        sale_id: s.id,
        stage,
        segment,
        owner_id: s.salesperson_id,
        declared_probability: Number(declared.toFixed(2)),
        historical_win_rate: Number(historical.toFixed(2)),
        calibrated_probability: Number(calibrated.toFixed(2)),
        confidence,
        flag,
        sample_size: sample,
        computed_at: new Date().toISOString(),
      });
    }

    if (calibrations.length > 0) {
      const { error: ec } = await supabase
        .from("win_probability_deal_calibrations")
        .upsert(calibrations, { onConflict: "sale_id" });
      if (ec) throw ec;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        buckets_written: bucketRows.length,
        calibrations_written: calibrations.length,
        groups_analyzed: groups.size,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
