import { corsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



const STAGE_PROB: Record<string, number> = {
  pending: 0.10, lead: 0.10, prospecting: 0.20, qualified: 0.30,
  in_progress: 0.30, proposal: 0.55, negotiation: 0.80,
  completed: 1.0, won: 1.0, cancelled: 0, lost: 0,
};

interface PredictiveSnapshot {
  forecast: {
    weighted_revenue: number;
    best_case: number;
    worst_case: number;
    confidence: number;
    horizon_days: number;
    deal_count: number;
  };
  pipeline_health: {
    healthy: number;
    at_risk: number;
    critical: number;
    avg_probability: number;
  };
  churn: {
    high_risk_count: number;
    medium_risk_count: number;
    total_revenue_at_risk: number;
    top_at_risk: Array<{ id: string; name: string; risk: number; reasons: string[] }>;
  };
  win_propensity: {
    high: number;
    medium: number;
    low: number;
    top_opportunities: Array<{ id: string; client: string; amount: number; probability: number }>;
  };
  trends: {
    velocity_change_pct: number;
    win_rate_30d: number;
    win_rate_90d: number;
    avg_deal_cycle_days: number;
  };
  ai_insights?: {
    summary: string;
    recommendations: string[];
    risks: string[];
  };
  generated_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, key);

    const body = await req.json().catch(() => ({}));
    const horizonDays = Number(body.horizon_days ?? 90);
    const includeAI = body.include_ai !== false;

    const horizonDate = new Date();
    horizonDate.setDate(horizonDate.getDate() + horizonDays);
    const past90 = new Date();
    past90.setDate(past90.getDate() - 90);
    const past30 = new Date();
    past30.setDate(past30.getDate() - 30);

    const [openDealsRes, allClosedRes, clientsRes, leadScoresRes] = await Promise.all([
      supabase.from("sales").select("id, amount, status, created_at, client_name, salesperson_id")
        .not("status", "in", "(completed,won,cancelled,lost)").limit(500),
      supabase.from("sales").select("id, amount, status, created_at, updated_at")
        .in("status", ["completed", "won", "cancelled", "lost"])
        .gte("created_at", past90.toISOString()).limit(1000),
      supabase.from("clients").select("id, name, total_value, updated_at").limit(500),
      supabase.from("lead_scores").select("sale_id, total_score").limit(500),
    ]);

    const openDeals = openDealsRes.data ?? [];
    const closedDeals = allClosedRes.data ?? [];
    const clients = clientsRes.data ?? [];
    const scoreMap = new Map<string, number>();
    (leadScoresRes.data ?? []).forEach((r: { sale_id: string; total_score: number }) =>
      scoreMap.set(r.sale_id, r.total_score)
    );

    // FORECAST
    let weighted = 0, best = 0, worst = 0;
    const probs: number[] = [];
    let high = 0, medium = 0, low = 0;
    const opportunities: Array<{ id: string; client: string; amount: number; probability: number }> = [];

    openDeals.forEach((d) => {
      const baseProb = STAGE_PROB[d.status] ?? 0.1;
      const score = scoreMap.get(d.id);
      const scoreMult = score ? (score > 70 ? 1.2 : score > 40 ? 1.0 : 0.8) : 1.0;
      const prob = Math.min(0.95, baseProb * scoreMult);
      const amt = Number(d.amount) || 0;
      weighted += amt * prob;
      best += amt * Math.min(0.99, prob * 1.3);
      worst += amt * (prob * 0.6);
      probs.push(prob);
      if (prob >= 0.7) { high++; opportunities.push({ id: d.id, client: d.client_name ?? "—", amount: amt, probability: prob }); }
      else if (prob >= 0.4) medium++;
      else low++;
    });

    opportunities.sort((a, b) => b.amount * b.probability - a.amount * a.probability);

    const avgProb = probs.length ? probs.reduce((a, b) => a + b, 0) / probs.length : 0;
    const healthy = probs.filter((p) => p >= 0.6).length;
    const atRisk = probs.filter((p) => p >= 0.3 && p < 0.6).length;
    const critical = probs.filter((p) => p < 0.3).length;

    // CHURN
    const now = Date.now();
    const churnAnalysis = clients.map((c) => {
      const days = Math.floor((now - new Date(c.updated_at).getTime()) / 86400000);
      let risk = Math.min(100, days * 1.5);
      const reasons: string[] = [];
      if (days > 90) { reasons.push("Sem atividade > 90 dias"); risk += 20; }
      else if (days > 60) { reasons.push("Sem atividade > 60 dias"); risk += 10; }
      if (Number(c.total_value) > 10000) { reasons.push("Cliente de alto valor"); }
      return { id: c.id, name: c.name, risk: Math.min(100, risk), reasons, value: Number(c.total_value) || 0 };
    });
    const highRiskClients = churnAnalysis.filter((c) => c.risk >= 70);
    const mediumRiskClients = churnAnalysis.filter((c) => c.risk >= 40 && c.risk < 70);
    const revenueAtRisk = highRiskClients.reduce((s, c) => s + c.value, 0);

    // TRENDS
    const won30 = closedDeals.filter((d) => ["completed", "won"].includes(d.status) && new Date(d.created_at) >= past30).length;
    const total30 = closedDeals.filter((d) => new Date(d.created_at) >= past30).length;
    const won90 = closedDeals.filter((d) => ["completed", "won"].includes(d.status)).length;
    const total90 = closedDeals.length;
    const winRate30 = total30 ? (won30 / total30) * 100 : 0;
    const winRate90 = total90 ? (won90 / total90) * 100 : 0;
    const cycles = closedDeals
      .filter((d) => ["completed", "won"].includes(d.status))
      .map((d) => (new Date(d.updated_at).getTime() - new Date(d.created_at).getTime()) / 86400000);
    const avgCycle = cycles.length ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 0;
    const velocityChange = winRate90 ? ((winRate30 - winRate90) / winRate90) * 100 : 0;

    const snapshot: PredictiveSnapshot = {
      forecast: {
        weighted_revenue: Math.round(weighted),
        best_case: Math.round(best),
        worst_case: Math.round(worst),
        confidence: Math.round(avgProb * 100),
        horizon_days: horizonDays,
        deal_count: openDeals.length,
      },
      pipeline_health: { healthy, at_risk: atRisk, critical, avg_probability: Math.round(avgProb * 100) },
      churn: {
        high_risk_count: highRiskClients.length,
        medium_risk_count: mediumRiskClients.length,
        total_revenue_at_risk: Math.round(revenueAtRisk),
        top_at_risk: highRiskClients.sort((a, b) => b.value - a.value).slice(0, 5)
          .map(({ id, name, risk, reasons }) => ({ id, name, risk, reasons })),
      },
      win_propensity: { high, medium, low, top_opportunities: opportunities.slice(0, 5) },
      trends: {
        velocity_change_pct: Math.round(velocityChange * 10) / 10,
        win_rate_30d: Math.round(winRate30 * 10) / 10,
        win_rate_90d: Math.round(winRate90 * 10) / 10,
        avg_deal_cycle_days: Math.round(avgCycle),
      },
      generated_at: new Date().toISOString(),
    };

    // AI INSIGHTS
    if (includeAI) {
      const aiKey = Deno.env.get("LOVABLE_API_KEY");
      if (aiKey) {
        try {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "Você é um analista de Revenue Intelligence sênior. Analise os dados preditivos e responda em JSON estrito com { summary: string, recommendations: string[], risks: string[] }. Use português brasileiro, seja conciso e acionável (max 3 itens cada)." },
                { role: "user", content: `Dados:\n${JSON.stringify(snapshot, null, 2)}` },
              ],
              tools: [{
                type: "function",
                function: {
                  name: "report_insights",
                  description: "Reporta insights preditivos",
                  parameters: {
                    type: "object",
                    properties: {
                      summary: { type: "string" },
                      recommendations: { type: "array", items: { type: "string" } },
                      risks: { type: "array", items: { type: "string" } },
                    },
                    required: ["summary", "recommendations", "risks"],
                  },
                },
              }],
              tool_choice: { type: "function", function: { name: "report_insights" } },
            }),
          });
          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const args = aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
            if (args) snapshot.ai_insights = JSON.parse(args);
          } else if (aiResp.status === 429 || aiResp.status === 402) {
            console.warn("AI gateway limit:", aiResp.status);
          }
        } catch (e) {
          console.error("AI insight error:", e);
        }
      }
    }

    return new Response(JSON.stringify(snapshot), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predictive-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
