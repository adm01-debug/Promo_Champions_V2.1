import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Kpi {
  label: string;
  value: number;
  format: "currency" | "number" | "percent" | "score";
  delta?: number;
  hint?: string;
}

interface Alert {
  id: string;
  module: "health" | "winloss" | "forecast" | "routing" | "conversation";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  suggested_action: string;
  link?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Parallel aggregate
    const [salesOpen, salesWon, salesLost, healthScores, conversations, routingAssignments] = await Promise.all([
      supabase.from("sales").select("id, total_amount, status, salesperson_id, created_at").in("status", ["open", "negotiating", "proposal"]).limit(1000),
      supabase.from("sales").select("id, total_amount, updated_at").eq("status", "won").gte("updated_at", since30).limit(1000),
      supabase.from("sales").select("id, total_amount, updated_at").eq("status", "lost").gte("updated_at", since30).limit(1000),
      supabase.from("deal_health_scores").select("sale_id, health_score, factors").lt("health_score", 60).limit(200),
      supabase.from("conversation_analyses").select("sentiment, created_at").gte("created_at", since7).limit(500),
      supabase.from("lead_routing_assignments").select("id, status, salesperson_id, created_at").gte("created_at", since7).limit(500),
    ]);

    const openDeals = salesOpen.data ?? [];
    const wonDeals = salesWon.data ?? [];
    const lostDeals = salesLost.data ?? [];
    const lowHealth = healthScores.data ?? [];
    const convos = conversations.data ?? [];
    const routings = routingAssignments.data ?? [];

    // KPIs
    const pipelineTotal = openDeals.reduce((s, d) => s + Number(d.total_amount ?? 0), 0);
    const totalClosed = wonDeals.length + lostDeals.length;
    const winRate = totalClosed > 0 ? wonDeals.length / totalClosed : 0;
    const wonAmount = wonDeals.reduce((s, d) => s + Number(d.total_amount ?? 0), 0);
    const forecast30d = wonAmount * 1.05; // simple projection

    const criticalDeals = lowHealth.filter((h) => h.health_score < 40);
    const criticalDealIds = new Set(criticalDeals.map((d) => d.sale_id));
    const criticalExposure = openDeals
      .filter((d) => criticalDealIds.has(d.id))
      .reduce((s, d) => s + Number(d.total_amount ?? 0), 0);

    const sentimentScore = convos.length > 0
      ? convos.reduce((s, c) => {
          const v = c.sentiment === "positive" ? 1 : c.sentiment === "negative" ? -1 : c.sentiment === "mixed" ? -0.3 : 0;
          return s + v;
        }, 0) / convos.length
      : 0;

    const acceptedRoutings = routings.filter((r) => r.status === "accepted").length;
    const teamCapacity = routings.length > 0 ? acceptedRoutings / routings.length : 0.5;

    // Pulse score (weighted)
    const healthScoreNorm = openDeals.length > 0 ? Math.max(0, 1 - lowHealth.length / openDeals.length) : 0.7;
    const sentimentNorm = (sentimentScore + 1) / 2;
    const pulseScore = Math.round(
      (healthScoreNorm * 0.30 +
        Math.min(forecast30d / Math.max(pipelineTotal * 0.3, 1), 1) * 0.25 +
        winRate * 0.20 +
        teamCapacity * 0.15 +
        sentimentNorm * 0.10) * 100
    );

    const kpis: Kpi[] = [
      { label: "Pipeline Total", value: pipelineTotal, format: "currency", hint: `${openDeals.length} deals abertos` },
      { label: "Forecast 30d", value: forecast30d, format: "currency", hint: "projeção IA" },
      { label: "Deals Críticos", value: criticalDeals.length, format: "number", hint: `R$ ${criticalExposure.toLocaleString("pt-BR")} expostos` },
      { label: "Win Rate 30d", value: winRate * 100, format: "percent", hint: `${wonDeals.length} ganhos / ${lostDeals.length} perdidos` },
      { label: "Sentimento Médio", value: sentimentScore * 100, format: "score", hint: `${convos.length} conversas analisadas` },
      { label: "Capacidade do Time", value: teamCapacity * 100, format: "percent", hint: `${acceptedRoutings}/${routings.length} aceites 7d` },
    ];

    // Alerts
    const alerts: Alert[] = [];
    if (criticalDeals.length > 0) {
      alerts.push({
        id: "health-critical",
        module: "health",
        severity: "critical",
        title: `${criticalDeals.length} deals em estado crítico`,
        description: `R$ ${criticalExposure.toLocaleString("pt-BR")} em risco com Health Score < 40`,
        suggested_action: "Revisar deals críticos e acionar coaching imediato",
      });
    }
    if (winRate < 0.2 && totalClosed > 5) {
      alerts.push({
        id: "winrate-low",
        module: "winloss",
        severity: "warning",
        title: "Win Rate abaixo de 20%",
        description: `Apenas ${(winRate * 100).toFixed(1)}% de conversão nos últimos 30d`,
        suggested_action: "Analisar razões de perda recorrentes no Win/Loss IA",
      });
    }
    if (teamCapacity < 0.5 && routings.length > 5) {
      alerts.push({
        id: "routing-low-acceptance",
        module: "routing",
        severity: "warning",
        title: "Baixa aceitação de leads roteados",
        description: `Apenas ${(teamCapacity * 100).toFixed(0)}% dos leads roteados foram aceitos`,
        suggested_action: "Revisar regras de roteamento e capacidade dos closers",
      });
    }
    const negSentiment = convos.filter((c) => c.sentiment === "negative").length;
    if (negSentiment > convos.length * 0.3 && convos.length > 5) {
      alerts.push({
        id: "sentiment-negative",
        module: "conversation",
        severity: "warning",
        title: "Sentimento negativo em alta",
        description: `${negSentiment} de ${convos.length} conversas recentes com sentimento negativo`,
        suggested_action: "Revisar transcrições e treinar o time em handling de objeções",
      });
    }
    if (pipelineTotal < forecast30d * 3) {
      alerts.push({
        id: "coverage-low",
        module: "forecast",
        severity: "info",
        title: "Cobertura do pipeline abaixo de 3x",
        description: "Pipeline aberto está apenas " + (pipelineTotal / Math.max(forecast30d, 1)).toFixed(1) + "x da meta",
        suggested_action: "Acelerar prospecção de SDRs",
      });
    }

    const severityRank = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

    const payload = {
      pulse_score: pulseScore,
      status: pulseScore >= 75 ? "healthy" : pulseScore >= 50 ? "warning" : "critical",
      kpis,
      alerts: alerts.slice(0, 8),
      trends: {
        sentiment_7d: sentimentScore,
        win_rate_30d: winRate,
        critical_count: criticalDeals.length,
      },
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
