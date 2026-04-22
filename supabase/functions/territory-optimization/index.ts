import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface TerritoryRow {
  id: string;
  territory_name: string;
  territory_type: string;
  current_owner_id: string | null;
  total_revenue: number;
  total_deals: number;
  is_contested: boolean;
}

interface SaleRow {
  id: string;
  amount: number;
  status: string;
  salesperson_id: string | null;
  category: string | null;
  created_at: string;
}

interface SalespersonLoad {
  salesperson_id: string;
  salesperson_name: string;
  territories_count: number;
  total_revenue: number;
  total_deals: number;
  load_score: number; // normalized 0..1
}

interface TerritoryAnalysis {
  id: string;
  territory_name: string;
  territory_type: string;
  owner_id: string | null;
  owner_name: string | null;
  is_contested: boolean;
  total_deals: number;
  total_revenue: number;
  recent_revenue: number;
  recent_deals: number;
  potential_revenue: number;
  coverage_score: number; // 0..1
  status: "healthy" | "underserved" | "overloaded" | "stagnant" | "unowned";
}

interface Recommendation {
  type: "reassign" | "split" | "merge" | "assign_owner" | "rebalance";
  priority: "high" | "medium" | "low";
  territory_id: string | null;
  territory_name: string | null;
  message: string;
  expected_impact: string;
}

function gini(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((s, v) => s + v, 0);
  if (sum === 0) return 0;
  let cum = 0;
  for (let i = 0; i < n; i++) cum += (i + 1) * sorted[i];
  return (2 * cum) / (n * sum) - (n + 1) / n;
}

function healthFromBalance(gini: number, unownedRatio: number, underservedRatio: number): string {
  if (gini < 0.2 && unownedRatio < 0.05 && underservedRatio < 0.1) return "excellent";
  if (gini < 0.35 && unownedRatio < 0.15 && underservedRatio < 0.25) return "healthy";
  if (gini < 0.5 && unownedRatio < 0.3 && underservedRatio < 0.4) return "warning";
  return "critical";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const days = Math.max(7, Math.min(365, parseInt(url.searchParams.get("days") || "30", 10)));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const startDate = new Date(Date.now() - days * 86400000).toISOString();

    const [
      { data: territories, error: terrErr },
      { data: people },
      { data: sales },
    ] = await Promise.all([
      supabase
        .from("sales_territories")
        .select("id,territory_name,territory_type,current_owner_id,total_revenue,total_deals,is_contested"),
      supabase.from("salespeople_public").select("id,name"),
      supabase
        .from("sales")
        .select("id,amount,status,salesperson_id,category,created_at")
        .gte("created_at", startDate)
        .limit(5000),
    ]);

    if (terrErr) throw terrErr;
    const terrs = (territories ?? []) as TerritoryRow[];
    const peopleMap = new Map<string, string>();
    (people ?? []).forEach((p: any) => peopleMap.set(p.id, p.name));

    // Recent sales per owner
    const wonSales = (sales ?? []).filter((s: SaleRow) =>
      ["won", "completed", "Fechado"].includes(s.status),
    );
    const ownerRevenue = new Map<string, { revenue: number; deals: number }>();
    wonSales.forEach((s: SaleRow) => {
      if (!s.salesperson_id) return;
      if (!ownerRevenue.has(s.salesperson_id)) {
        ownerRevenue.set(s.salesperson_id, { revenue: 0, deals: 0 });
      }
      const e = ownerRevenue.get(s.salesperson_id)!;
      e.revenue += Number(s.amount);
      e.deals += 1;
    });

    // Compute reference revenue (median of historic territory revenue) for "potential"
    const revenues = terrs.map((t) => Number(t.total_revenue) || 0).filter((v) => v > 0);
    revenues.sort((a, b) => a - b);
    const medianRevenue = revenues.length
      ? revenues[Math.floor(revenues.length / 2)]
      : 0;
    const p75Revenue = revenues.length
      ? revenues[Math.floor(revenues.length * 0.75)] ?? medianRevenue
      : 0;

    const analyses: TerritoryAnalysis[] = terrs.map((t) => {
      const ownerSales = t.current_owner_id ? ownerRevenue.get(t.current_owner_id) : undefined;
      const recentRevenue = ownerSales?.revenue ?? 0;
      const recentDeals = ownerSales?.deals ?? 0;
      const potential = Math.max(p75Revenue, Number(t.total_revenue) * 1.2);
      const coverage = potential > 0 ? Math.min(1, recentRevenue / potential) : 0;

      let status: TerritoryAnalysis["status"];
      if (!t.current_owner_id) status = "unowned";
      else if (coverage >= 0.7) status = "healthy";
      else if (coverage < 0.25 && Number(t.total_revenue) > medianRevenue * 0.5) status = "underserved";
      else if (recentDeals === 0 && Number(t.total_deals) > 0) status = "stagnant";
      else status = "underserved";

      return {
        id: t.id,
        territory_name: t.territory_name,
        territory_type: t.territory_type,
        owner_id: t.current_owner_id,
        owner_name: t.current_owner_id ? peopleMap.get(t.current_owner_id) ?? null : null,
        is_contested: t.is_contested,
        total_deals: t.total_deals,
        total_revenue: Number(t.total_revenue) || 0,
        recent_revenue: recentRevenue,
        recent_deals: recentDeals,
        potential_revenue: potential,
        coverage_score: coverage,
        status,
      };
    });

    // Detect overloaded owners (> 3 territories OR > 2 with contested)
    const ownerTerrCount = new Map<string, TerritoryAnalysis[]>();
    analyses.forEach((a) => {
      if (!a.owner_id) return;
      if (!ownerTerrCount.has(a.owner_id)) ownerTerrCount.set(a.owner_id, []);
      ownerTerrCount.get(a.owner_id)!.push(a);
    });
    ownerTerrCount.forEach((list, ownerId) => {
      if (list.length >= 3) {
        list.forEach((a) => {
          if (a.status === "underserved" || a.status === "stagnant") {
            // mark overloaded
            (a as TerritoryAnalysis).status = "overloaded";
          }
        });
      }
    });

    // Salesperson load distribution
    const loads: SalespersonLoad[] = Array.from(ownerTerrCount.entries()).map(([id, list]) => {
      const rev = list.reduce((s, a) => s + a.recent_revenue, 0);
      const deals = list.reduce((s, a) => s + a.recent_deals, 0);
      return {
        salesperson_id: id,
        salesperson_name: peopleMap.get(id) ?? "—",
        territories_count: list.length,
        total_revenue: rev,
        total_deals: deals,
        load_score: list.length, // raw count; normalized later
      };
    });
    const maxLoad = Math.max(1, ...loads.map((l) => l.load_score));
    loads.forEach((l) => (l.load_score = l.load_score / maxLoad));
    loads.sort((a, b) => b.territories_count - a.territories_count);

    // Aggregates
    const total = analyses.length;
    const unowned = analyses.filter((a) => a.status === "unowned").length;
    const underserved = analyses.filter((a) => a.status === "underserved").length;
    const overloaded = analyses.filter((a) => a.status === "overloaded").length;
    const healthy = analyses.filter((a) => a.status === "healthy").length;
    const avgCoverage = total ? analyses.reduce((s, a) => s + a.coverage_score, 0) / total : 0;
    const potentialLost = analyses
      .filter((a) => a.status === "underserved" || a.status === "unowned" || a.status === "stagnant")
      .reduce((s, a) => s + Math.max(0, a.potential_revenue - a.recent_revenue), 0);

    const balance = gini(loads.map((l) => l.territories_count));
    const health = healthFromBalance(balance, total ? unowned / total : 0, total ? underserved / total : 0);

    // Recommendations
    const recommendations: Recommendation[] = [];

    analyses
      .filter((a) => a.status === "unowned")
      .slice(0, 5)
      .forEach((a) =>
        recommendations.push({
          type: "assign_owner",
          priority: "high",
          territory_id: a.id,
          territory_name: a.territory_name,
          message: `Território "${a.territory_name}" está sem dono atribuído.`,
          expected_impact: `Potencial de receita: ${Math.round(a.potential_revenue).toLocaleString("pt-BR")}`,
        }),
      );

    analyses
      .filter((a) => a.status === "underserved")
      .sort((a, b) => b.potential_revenue - a.potential_revenue)
      .slice(0, 5)
      .forEach((a) =>
        recommendations.push({
          type: "reassign",
          priority: "high",
          territory_id: a.id,
          territory_name: a.territory_name,
          message: `"${a.territory_name}" sub-atendido por ${a.owner_name ?? "—"} (cobertura ${(a.coverage_score * 100).toFixed(0)}%).`,
          expected_impact: `Receita potencial não capturada: ${Math.round(a.potential_revenue - a.recent_revenue).toLocaleString("pt-BR")}`,
        }),
      );

    analyses
      .filter((a) => a.status === "overloaded")
      .slice(0, 3)
      .forEach((a) =>
        recommendations.push({
          type: "split",
          priority: "medium",
          territory_id: a.id,
          territory_name: a.territory_name,
          message: `"${a.territory_name}" pertence a vendedor sobrecarregado (${a.owner_name ?? "—"}).`,
          expected_impact: "Considerar split ou realocar para liberar capacidade.",
        }),
      );

    if (balance > 0.4 && loads.length >= 3) {
      const top = loads[0];
      const bottom = loads[loads.length - 1];
      recommendations.push({
        type: "rebalance",
        priority: "medium",
        territory_id: null,
        territory_name: null,
        message: `Distribuição desbalanceada (Gini ${(balance * 100).toFixed(0)}%): ${top.salesperson_name} tem ${top.territories_count} territórios, ${bottom.salesperson_name} tem ${bottom.territories_count}.`,
        expected_impact: "Rebalancear pode aumentar cobertura geral em 15-25%.",
      });
    }

    analyses
      .filter((a) => a.status === "stagnant")
      .slice(0, 3)
      .forEach((a) =>
        recommendations.push({
          type: "reassign",
          priority: "low",
          territory_id: a.id,
          territory_name: a.territory_name,
          message: `"${a.territory_name}" sem deals nos últimos ${days}d.`,
          expected_impact: "Reativar com nova abordagem ou reassign.",
        }),
      );

    return new Response(
      JSON.stringify({
        days,
        health,
        kpis: {
          total_territories: total,
          healthy_count: healthy,
          underserved_count: underserved,
          overloaded_count: overloaded,
          unowned_count: unowned,
          avg_coverage: avgCoverage,
          balance_index: balance,
          potential_revenue_lost: potentialLost,
        },
        territories: analyses.sort((a, b) => a.coverage_score - b.coverage_score),
        salesperson_loads: loads,
        recommendations,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("territory-optimization error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
