import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAGE_WEIGHTS: Record<string, number> = {
  lead: 0.05,
  prospecting: 0.15,
  qualified: 0.3,
  proposal: 0.55,
  negotiation: 0.75,
  closed: 0.95,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const horizonDays = Number(url.searchParams.get("horizon") ?? "90");
    const since = new Date(Date.now() - horizonDays * 86400000).toISOString();

    const [salesRes, activitiesRes, commissionsRes] = await Promise.all([
      supabase.from("sales").select("id,amount,stage,status,created_at,updated_at,salesperson_id"),
      supabase.from("activities").select("id,outcome,created_at").gte("created_at", since),
      supabase.from("commissions").select("commission_amount,status,created_at").gte("created_at", since),
    ]);

    const sales = salesRes.data ?? [];
    const activities = activitiesRes.data ?? [];
    const commissions = commissionsRes.data ?? [];

    // Pipeline ativo
    const openDeals = sales.filter((s) => !["completed", "lost", "cancelled"].includes(s.status));
    const wonDeals = sales.filter((s) => s.status === "completed" && s.created_at >= since);
    const lostDeals = sales.filter((s) => s.status === "lost" && s.created_at >= since);

    // Pipeline coverage e weighted forecast
    const totalPipeline = openDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const weightedForecast = openDeals.reduce(
      (sum, d) => sum + Number(d.amount || 0) * (STAGE_WEIGHTS[d.stage] ?? 0.1),
      0,
    );
    const closedRevenue = wonDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    // Win rate
    const totalClosed = wonDeals.length + lostDeals.length;
    const winRate = totalClosed > 0 ? (wonDeals.length / totalClosed) * 100 : 0;

    // Sales velocity (deals * avg_value * win_rate / cycle_days)
    const cycleDays = wonDeals.length
      ? wonDeals.reduce((sum, d) => {
          const days =
            (new Date(d.updated_at).getTime() - new Date(d.created_at).getTime()) / 86400000;
          return sum + days;
        }, 0) / wonDeals.length
      : 0;
    const avgDealSize = wonDeals.length ? closedRevenue / wonDeals.length : 0;
    const velocity =
      cycleDays > 0 ? (openDeals.length * avgDealSize * (winRate / 100)) / cycleDays : 0;

    // Stage distribution
    const stageDistribution: Record<string, { count: number; value: number }> = {};
    openDeals.forEach((d) => {
      if (!stageDistribution[d.stage]) stageDistribution[d.stage] = { count: 0, value: 0 };
      stageDistribution[d.stage].count++;
      stageDistribution[d.stage].value += Number(d.amount || 0);
    });

    // Activity efficiency
    const positiveOutcomes = activities.filter((a) =>
      ["successful", "interested", "meeting_scheduled"].includes(a.outcome),
    ).length;
    const activityEfficiency =
      activities.length > 0 ? (positiveOutcomes / activities.length) * 100 : 0;

    // Commission earned
    const earnedCommissions = commissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
    const pendingCommissions = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);

    // Health: pipeline coverage ratio (3x cota geralmente saudável)
    const monthlyTarget = closedRevenue * 1.2 || 100000;
    const coverageRatio = monthlyTarget > 0 ? totalPipeline / monthlyTarget : 0;

    let healthLabel = "critical";
    if (coverageRatio >= 3) healthLabel = "excellent";
    else if (coverageRatio >= 2) healthLabel = "healthy";
    else if (coverageRatio >= 1) healthLabel = "warning";

    return new Response(
      JSON.stringify({
        horizon_days: horizonDays,
        kpis: {
          total_pipeline: totalPipeline,
          weighted_forecast: weightedForecast,
          closed_revenue: closedRevenue,
          win_rate: Math.round(winRate * 10) / 10,
          avg_deal_size: Math.round(avgDealSize),
          cycle_days: Math.round(cycleDays),
          velocity: Math.round(velocity),
          coverage_ratio: Math.round(coverageRatio * 100) / 100,
          activity_efficiency: Math.round(activityEfficiency * 10) / 10,
          earned_commissions: earnedCommissions,
          pending_commissions: pendingCommissions,
        },
        health: {
          label: healthLabel,
          coverage_ratio: coverageRatio,
          recommendation:
            healthLabel === "critical"
              ? "Pipeline insuficiente. Acelere prospecção urgentemente."
              : healthLabel === "warning"
                ? "Cobertura abaixo do ideal. Reforce geração de leads."
                : healthLabel === "healthy"
                  ? "Pipeline saudável. Mantenha o ritmo."
                  : "Pipeline excelente. Foco em conversão e qualidade.",
        },
        stage_distribution: stageDistribution,
        deal_counts: {
          open: openDeals.length,
          won: wonDeals.length,
          lost: lostDeals.length,
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
