import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface CoachingTarget {
  salesperson_id: string;
  name: string;
  avatar_url: string | null;
  win_rate: number;
  deals_count: number;
  total_revenue: number;
  avg_deal_size: number;
  activities_30d: number;
  health_score: number; // 0-100
  priority: "critical" | "warning" | "healthy";
  top_issue: string;
  recommended_action: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const since30 = new Date(Date.now() - 30 * 86400000).toISOString();

    const [{ data: salespeople }, { data: sales }, { data: activities }] = await Promise.all([
      supabase.from("salespeople").select("id, name, avatar_url, role, is_active").eq("is_active", true),
      supabase.from("sales").select("id, salesperson_id, status, amount, created_at").gte("created_at", since30),
      supabase.from("activities").select("id, salesperson_id, created_at").gte("created_at", since30),
    ]);

    const targets: CoachingTarget[] = (salespeople ?? []).map((sp) => {
      const myDeals = (sales ?? []).filter((s) => s.salesperson_id === sp.id);
      const won = myDeals.filter((d) => d.status === "completed");
      const lost = myDeals.filter((d) => d.status === "lost");
      const revenue = won.reduce((sum, d) => sum + Number(d.amount ?? 0), 0);
      const winRate = (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
      const myActs = (activities ?? []).filter((a) => a.salesperson_id === sp.id).length;
      const avgDeal = won.length > 0 ? revenue / won.length : 0;

      // Health score = win rate weight + activity weight + revenue
      const activityScore = Math.min(100, (myActs / 30) * 100); // 30+ activities = max
      const revenueScore = Math.min(100, (revenue / 50000) * 100); // 50k = max
      const healthScore = Math.round(winRate * 0.5 + activityScore * 0.3 + revenueScore * 0.2);

      let priority: CoachingTarget["priority"] = "healthy";
      let topIssue = "Performance dentro da média";
      let recommendedAction = "Manter ritmo atual";

      if (myActs < 5) {
        priority = "critical";
        topIssue = "Baixíssimo volume de atividades (menos de 5 em 30 dias)";
        recommendedAction = "Sessão urgente: revisar rotina diária e cadências";
      } else if (winRate < 15 && myDeals.length >= 3) {
        priority = "critical";
        topIssue = `Win rate crítico: ${Math.round(winRate)}%`;
        recommendedAction = "Coaching de qualificação BANT e tratamento de objeções";
      } else if (winRate < 30 && myDeals.length >= 3) {
        priority = "warning";
        topIssue = `Win rate abaixo do esperado: ${Math.round(winRate)}%`;
        recommendedAction = "Roleplay de fechamento + revisão de propostas perdidas";
      } else if (myActs < 15) {
        priority = "warning";
        topIssue = `Volume de atividades baixo: ${myActs} em 30 dias`;
        recommendedAction = "Aumentar prospecção ativa e cadências";
      } else if (avgDeal < 2000 && won.length >= 2) {
        priority = "warning";
        topIssue = `Ticket médio baixo: R$ ${avgDeal.toFixed(0)}`;
        recommendedAction = "Treinamento em upsell e cross-sell";
      }

      return {
        salesperson_id: sp.id,
        name: sp.name,
        avatar_url: sp.avatar_url,
        win_rate: Math.round(winRate),
        deals_count: myDeals.length,
        total_revenue: revenue,
        avg_deal_size: Math.round(avgDeal),
        activities_30d: myActs,
        health_score: healthScore,
        priority,
        top_issue: topIssue,
        recommended_action: recommendedAction,
      };
    });

    // Sort: critical → warning → healthy
    const order = { critical: 0, warning: 1, healthy: 2 };
    targets.sort((a, b) => order[a.priority] - order[b.priority] || a.health_score - b.health_score);

    const summary = {
      total: targets.length,
      critical: targets.filter((t) => t.priority === "critical").length,
      warning: targets.filter((t) => t.priority === "warning").length,
      healthy: targets.filter((t) => t.priority === "healthy").length,
      avg_health_score: targets.length > 0 ? Math.round(targets.reduce((s, t) => s + t.health_score, 0) / targets.length) : 0,
    };

    return new Response(JSON.stringify({ targets, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("coaching-intelligence error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
