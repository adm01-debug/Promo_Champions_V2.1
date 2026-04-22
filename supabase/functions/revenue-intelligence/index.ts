import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const url = new URL(req.url);
    const horizon = Number(url.searchParams.get("horizon") ?? "90");
    const dimension = url.searchParams.get("dimension") ?? "category";

    const [rollupRes, breakdownRes, inspectionRes, prevRollupRes] = await Promise.all([
      supabase.rpc("compute_forecast_rollup", { _horizon_days: horizon }),
      supabase.rpc("win_rate_breakdown", { _dimension: dimension, _days: 180 }),
      supabase
        .from("pipeline_inspection_snapshots")
        .select("*")
        .order("inspected_at", { ascending: false })
        .limit(200),
      supabase.rpc("compute_forecast_rollup", { _horizon_days: horizon * 2 }),
    ]);

    if (rollupRes.error) throw rollupRes.error;
    const rollup = rollupRes.data ?? [];
    const breakdown = breakdownRes.data ?? [];
    const inspection = inspectionRes.data ?? [];

    // Coverage ratio: weighted pipeline / target (1.2x closed as proxy)
    const closed =
      rollup.find((r: { category: string }) => r.category === "closed")?.weighted_amount ?? 0;
    const totalWeighted = rollup.reduce(
      (s: number, r: { weighted_amount: number; category: string }) =>
        r.category !== "closed" && r.category !== "omitted" ? s + Number(r.weighted_amount) : s,
      0,
    );
    const target = Math.max(Number(closed) * 1.2, 50000);
    const coverageRatio = target > 0 ? totalWeighted / target : 0;

    // Variance vs previous period
    const prev = prevRollupRes.data ?? [];
    const variance: Record<string, number> = {};
    rollup.forEach((r: { category: string; weighted_amount: number }) => {
      const prevVal = Number(
        prev.find((p: { category: string }) => p.category === r.category)?.weighted_amount ?? 0,
      );
      const cur = Number(r.weighted_amount);
      variance[r.category] = prevVal > 0 ? ((cur - prevVal) / prevVal) * 100 : 0;
    });

    // Aggregate inspection (latest snapshot per sale)
    const latest = new Map<string, typeof inspection[number]>();
    for (const s of inspection) {
      if (!latest.has(s.sale_id)) latest.set(s.sale_id, s);
    }
    const latestArr = Array.from(latest.values());
    const flagCounts: Record<string, number> = {};
    latestArr.forEach((s) => {
      (s.risk_flags as Array<{ flag: string }>).forEach((f) => {
        flagCounts[f.flag] = (flagCounts[f.flag] || 0) + 1;
      });
    });

    let healthLabel = "critical";
    if (coverageRatio >= 4) healthLabel = "excellent";
    else if (coverageRatio >= 3) healthLabel = "healthy";
    else if (coverageRatio >= 2) healthLabel = "warning";

    return new Response(
      JSON.stringify({
        horizon_days: horizon,
        forecast_rollup: rollup,
        variance,
        coverage: {
          ratio: Math.round(coverageRatio * 100) / 100,
          target,
          weighted_pipeline: totalWeighted,
          health_label: healthLabel,
        },
        win_rate_breakdown: breakdown,
        pipeline_inspection: {
          total_inspected: latestArr.length,
          flag_counts: flagCounts,
          deals: latestArr.slice(0, 50),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
