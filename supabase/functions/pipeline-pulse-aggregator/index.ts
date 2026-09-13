import { getCorsHeaders } from "../_shared/cors.ts";
import {
  getServiceClient,
  getUserClient,
  UnauthorizedError,
} from "../_shared/auth-client.ts";
import { withRequestId } from "../_shared/request-id.ts";

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

Deno.serve(withRequestId("pipeline-pulse-aggregator", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // O agregado retorna indicadores de todo o time e, portanto, não pode usar
  // service_role em nome de qualquer usuário autenticado.
  let caller: Awaited<ReturnType<typeof getUserClient>>;
  try {
    caller = await getUserClient(req);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("pipeline-pulse-aggregator authentication error:", error);
    return new Response(
      JSON.stringify({ error: "authorization_unavailable" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { data: isAdminOrManager, error: roleError } = await caller.client.rpc(
    "is_admin_or_manager" as never,
    { _user_id: caller.userId } as never,
  );
  if (roleError) {
    console.error("pipeline-pulse-aggregator role check error:", roleError);
    return new Response(
      JSON.stringify({ error: "authorization_unavailable" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  if (!isAdminOrManager) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = getServiceClient(
      "pipeline-pulse-aggregator lê métricas agregadas de toda a organização após RBAC",
    );

    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString();
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Parallel aggregate
    const [
      salesOpen,
      salesWon,
      salesLost,
      healthScores,
      conversations,
      routingLog,
    ] = await Promise.all([
      supabase.from("sales").select(
        "id, amount, status, salesperson_id, created_at",
      ).in("status", [
        "lead",
        "qualified",
        "pending",
        "proposal",
        "negotiation",
      ]).limit(1000),
      supabase.from("sales").select("id, amount, updated_at").eq(
        "status",
        "won",
      ).gte("updated_at", since30).limit(1000),
      supabase.from("sales").select("id, amount, updated_at").eq(
        "status",
        "lost",
      ).gte("updated_at", since30).limit(1000),
      supabase.from("deal_health_scores").select(
        "sale_id, health_score, factors",
      ).lt("health_score", 60).limit(200),
      supabase.from("conversation_analyses").select("sentiment, created_at")
        .gte("created_at", since7).limit(500),
      supabase.from("lead_routing_log").select("id, created_at").gte(
        "created_at",
        since7,
      ).limit(500),
    ]);

    for (
      const result of [
        salesOpen,
        salesWon,
        salesLost,
        healthScores,
        conversations,
        routingLog,
      ]
    ) {
      if (result.error) throw result.error;
    }

    const openDeals = salesOpen.data ?? [];
    const wonDeals = salesWon.data ?? [];
    const lostDeals = salesLost.data ?? [];
    const lowHealth = healthScores.data ?? [];
    const convos = conversations.data ?? [];
    const routings = routingLog.data ?? [];

    // KPIs
    const pipelineTotal = openDeals.reduce(
      (s, d) => s + Number(d.amount ?? 0),
      0,
    );
    const totalClosed = wonDeals.length + lostDeals.length;
    const winRate = totalClosed > 0 ? wonDeals.length / totalClosed : 0;
    const revenue30d = wonDeals.reduce((s, d) => s + Number(d.amount ?? 0), 0);

    const criticalDeals = lowHealth.filter((h) => h.health_score < 40);
    const criticalDealIds = new Set(criticalDeals.map((d) => d.sale_id));
    const criticalExposure = openDeals
      .filter((d) => criticalDealIds.has(d.id))
      .reduce((s, d) => s + Number(d.amount ?? 0), 0);

    const sentimentScore = convos.length > 0
      ? convos.reduce((s, c) => {
        const v = c.sentiment === "positive"
          ? 1
          : c.sentiment === "negative"
          ? -1
          : c.sentiment === "mixed"
          ? -0.3
          : 0;
        return s + v;
      }, 0) / convos.length
      : 0;

    // Pulse score (weighted)
    const healthScoreNorm = openDeals.length > 0
      ? Math.max(0, 1 - lowHealth.length / openDeals.length)
      : 0.7;
    const sentimentNorm = (sentimentScore + 1) / 2;
    const pulseScore = Math.round(
      (healthScoreNorm * 0.35 +
        Math.min(revenue30d / Math.max(pipelineTotal * 0.3, 1), 1) * 0.30 +
        winRate * 0.25 +
        sentimentNorm * 0.10) * 100,
    );

    const kpis: Kpi[] = [
      {
        label: "Pipeline Total",
        value: pipelineTotal,
        format: "currency",
        hint: `${openDeals.length} deals abertos`,
      },
      {
        label: "Receita ganha 30d",
        value: revenue30d,
        format: "currency",
        hint: `${wonDeals.length} vendas ganhas`,
      },
      {
        label: "Deals Críticos",
        value: criticalDeals.length,
        format: "number",
        hint: `R$ ${criticalExposure.toLocaleString("pt-BR")} expostos`,
      },
      {
        label: "Win Rate 30d",
        value: winRate * 100,
        format: "percent",
        hint: `${wonDeals.length} ganhos / ${lostDeals.length} perdidos`,
      },
      {
        label: "Sentimento Médio",
        value: sentimentScore * 100,
        format: "score",
        hint: `${convos.length} conversas analisadas`,
      },
      {
        label: "Roteamentos 7d",
        value: routings.length,
        format: "number",
        hint: "eventos registrados",
      },
    ];

    // Alerts
    const alerts: Alert[] = [];
    if (criticalDeals.length > 0) {
      alerts.push({
        id: "health-critical",
        module: "health",
        severity: "critical",
        title: `${criticalDeals.length} deals em estado crítico`,
        description: `R$ ${
          criticalExposure.toLocaleString("pt-BR")
        } em risco com Health Score < 40`,
        suggested_action: "Revisar deals críticos e acionar coaching imediato",
      });
    }
    if (winRate < 0.2 && totalClosed > 5) {
      alerts.push({
        id: "winrate-low",
        module: "winloss",
        severity: "warning",
        title: "Win Rate abaixo de 20%",
        description: `Apenas ${
          (winRate * 100).toFixed(1)
        }% de conversão nos últimos 30d`,
        suggested_action: "Analisar razões de perda recorrentes no Win/Loss IA",
      });
    }
    const negSentiment = convos.filter((c) =>
      c.sentiment === "negative"
    ).length;
    if (negSentiment > convos.length * 0.3 && convos.length > 5) {
      alerts.push({
        id: "sentiment-negative",
        module: "conversation",
        severity: "warning",
        title: "Sentimento negativo em alta",
        description:
          `${negSentiment} de ${convos.length} conversas recentes com sentimento negativo`,
        suggested_action:
          "Revisar transcrições e treinar o time em handling de objeções",
      });
    }
    if (pipelineTotal < revenue30d * 3) {
      alerts.push({
        id: "coverage-low",
        module: "forecast",
        severity: "info",
        title: "Cobertura do pipeline abaixo de 3x",
        description: "Pipeline aberto está apenas " +
          (pipelineTotal / Math.max(revenue30d, 1)).toFixed(1) +
          "x da receita ganha nos últimos 30d",
        suggested_action: "Acelerar prospecção de SDRs",
      });
    }

    const severityRank = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

    const payload = {
      pulse_score: pulseScore,
      status: pulseScore >= 75
        ? "healthy"
        : pulseScore >= 50
        ? "warning"
        : "critical",
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
    console.error("pipeline-pulse-aggregator error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
