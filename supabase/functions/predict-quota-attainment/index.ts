import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



const STAGE_PROBABILITY: Record<string, number> = {
  lead: 0.05,
  prospecting: 0.1,
  qualified: 0.25,
  proposal: 0.5,
  negotiation: 0.75,
  closed_won: 1,
  closed_lost: 0,
  won: 1,
  lost: 0,
};

interface OpenDeal {
  amount: number;
  probability: number;
}

function monteCarlo(deals: OpenDeal[], simulations = 1000): { p10: number; p50: number; p90: number; samples: number[] } {
  const samples: number[] = [];
  for (let i = 0; i < simulations; i++) {
    let sum = 0;
    for (const d of deals) {
      if (Math.random() < d.probability) sum += d.amount;
    }
    samples.push(sum);
  }
  samples.sort((a, b) => a - b);
  return {
    p10: samples[Math.floor(simulations * 0.1)] ?? 0,
    p50: samples[Math.floor(simulations * 0.5)] ?? 0,
    p90: samples[Math.floor(simulations * 0.9)] ?? 0,
    samples,
  };
}

function classifyRisk(prob: number): "safe" | "on_track" | "at_risk" | "critical" {
  if (prob >= 0.8) return "safe";
  if (prob >= 0.5) return "on_track";
  if (prob >= 0.25) return "at_risk";
  return "critical";
}

async function generateAdvancedActions(supabase: ReturnType<typeof createClient>, params: {
  forecastId: string;
  salespersonName: string;
  quota: number;
  p50: number;
  prob: number;
  risk: string;
}): Promise<void> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return;
  const gap = Math.max(0, params.quota - params.p50);
  const sys = "Você é um head of sales experiente. Gere de 1 a 3 ações táticas e específicas para o vendedor atingir a meta. Responda em pt-BR.";
  const usr = `Vendedor: ${params.salespersonName}\nMeta: R$ ${params.quota.toFixed(0)}\nProjeção P50: R$ ${params.p50.toFixed(0)}\nGap: R$ ${gap.toFixed(0)}\nProbabilidade: ${(params.prob * 100).toFixed(0)}%\nRisco: ${params.risk}`;
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, { role: "user", content: usr }],
        tools: [{
          type: "function",
          function: {
            name: "recommend_actions",
            description: "Lista de ações recomendadas",
            parameters: {
              type: "object",
              properties: {
                actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action_type: { type: "string", enum: ["close_deal", "generate_pipeline", "increase_ticket", "accelerate_stage"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      expected_impact: { type: "number" },
                      priority: { type: "integer", minimum: 1, maximum: 3 },
                    },
                    required: ["action_type", "title", "description", "expected_impact", "priority"],
                  },
                },
              },
              required: ["actions"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "recommend_actions" } },
      }),
    });
    if (!resp.ok) return;
    const data = await resp.json();
    const tc = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) return;
    const parsed = JSON.parse(tc.function.arguments) as { actions: Array<{ action_type: string; title: string; description: string; expected_impact: number; priority: number }> };
    const rows = parsed.actions.slice(0, 3).map((a) => ({ ...a, forecast_id: params.forecastId }));
    if (rows.length > 0) await supabase.from("quota_attainment_actions").insert(rows);
  } catch (e) {
    console.error("AI advanced actions error", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const period: "month" | "quarter" = body.period === "quarter" ? "quarter" : "month";
    const filterSp: string | null = body.salesperson_id ?? null;

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), period === "quarter" ? Math.floor(now.getMonth() / 3) * 3 : now.getMonth(), 1);
    const periodEnd = period === "quarter"
      ? new Date(periodStart.getFullYear(), periodStart.getMonth() + 3, 0)
      : new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);

    const totalDays = Math.max(1, Math.ceil((periodEnd.getTime() - periodStart.getTime()) / 86400000));
    const elapsedDays = Math.max(1, Math.ceil((now.getTime() - periodStart.getTime()) / 86400000));
    const remainingDays = Math.max(1, totalDays - elapsedDays);

    let spQuery = supabase.from("salespeople").select("id, name, monthly_goal");
    if (filterSp) spQuery = spQuery.eq("id", filterSp);
    const { data: salespeople, error: spErr } = await spQuery;
    if (spErr) throw spErr;

    const { data: scores } = await supabase
      .from("deal_probability_scores")
      .select("sale_id, calibrated_probability")
      .order("calculated_at", { ascending: false });

    const latestScore = new Map<string, number>();
    for (const s of scores ?? []) {
      if (!latestScore.has(s.sale_id)) latestScore.set(s.sale_id, Number(s.calibrated_probability));
    }

    const predictions = [];
    const alerts = [];

    for (const sp of salespeople ?? []) {
      const quotaMonthly = Number(sp.monthly_goal ?? 0);
      const quotaAmount = period === "quarter" ? quotaMonthly * 3 : quotaMonthly;

      const { data: closedSales } = await supabase
        .from("sales")
        .select("id, amount")
        .eq("salesperson_id", sp.id)
        .eq("status", "closed_won")
        .gte("created_at", periodStart.toISOString())
        .lte("created_at", periodEnd.toISOString());

      const closedAmount = (closedSales ?? []).reduce((sum, s) => sum + Number(s.amount ?? 0), 0);

      const { data: openSales } = await supabase
        .from("sales")
        .select("id, amount, stage")
        .eq("salesperson_id", sp.id)
        .not("status", "in", "(closed_won,closed_lost)");

      const openDeals: OpenDeal[] = (openSales ?? []).map((d) => {
        const stage = String(d.stage ?? "lead").toLowerCase();
        const probability = latestScore.get(d.id) ?? STAGE_PROBABILITY[stage] ?? 0.1;
        return { amount: Number(d.amount ?? 0), probability };
      });

      const weightedPipeline = openDeals.reduce((s, d) => s + d.amount * d.probability, 0);
      const { p10, p50, p90, samples } = monteCarlo(openDeals);

      const totalProjected = closedAmount + p50;
      const probAttainment = quotaAmount > 0
        ? samples.filter((v) => v + closedAmount >= quotaAmount).length / samples.length
        : 1;

      const currentPace = closedAmount / elapsedDays;
      const paceRequired = Math.max(0, (quotaAmount - closedAmount) / remainingDays);
      const riskLevel = classifyRisk(probAttainment);

      const factors = {
        elapsed_days: elapsedDays,
        remaining_days: remainingDays,
        open_deals_count: openDeals.length,
        avg_probability: openDeals.length > 0 ? openDeals.reduce((s, d) => s + d.probability, 0) / openDeals.length : 0,
      };

      const { data: pred, error: predErr } = await supabase
        .from("quota_attainment_predictions")
        .insert({
          salesperson_id: sp.id,
          period_start: periodStart.toISOString().slice(0, 10),
          period_end: periodEnd.toISOString().slice(0, 10),
          quota_amount: quotaAmount,
          closed_amount: closedAmount,
          weighted_pipeline: weightedPipeline,
          predicted_amount: totalProjected,
          attainment_probability: probAttainment,
          scenario_pessimistic: closedAmount + p10,
          scenario_realistic: closedAmount + p50,
          scenario_optimistic: closedAmount + p90,
          pace_required_per_day: paceRequired,
          current_pace_per_day: currentPace,
          risk_level: riskLevel,
          factors,
        })
        .select()
        .single();
      if (predErr) throw predErr;
      predictions.push(pred);

      if (riskLevel === "at_risk" || riskLevel === "critical") {
        const gap = Math.max(0, quotaAmount - totalProjected);
        const negotiationCount = openDeals.filter((d) => d.probability >= 0.5).length;
        const message = `${sp.name}: ${(probAttainment * 100).toFixed(0)}% chance de atingir quota.`;
        const action = `Fechar R$ ${gap.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} em ${remainingDays} dias — focar em ${negotiationCount} deals avançados.`;
        const { data: alert } = await supabase
          .from("quota_attainment_alerts")
          .insert({
            prediction_id: pred.id,
            salesperson_id: sp.id,
            severity: riskLevel === "critical" ? "critical" : "warning",
            message,
            recommended_action: action,
          })
          .select()
          .single();
        if (alert) alerts.push(alert);
      }

      // Advanced forecast (Monte Carlo with new band tables)
      const totalP10 = closedAmount + p10;
      const totalP50 = closedAmount + p50;
      const totalP90 = closedAmount + p90;
      const { data: fc, error: fcErr } = await supabase
        .from("quota_attainment_forecasts")
        .upsert({
          salesperson_id: sp.id,
          period_start: periodStart.toISOString().slice(0, 10),
          period_end: periodEnd.toISOString().slice(0, 10),
          quota: quotaAmount,
          closed: closedAmount,
          weighted_open: weightedPipeline,
          pace_per_day: currentPace,
          days_remaining: remainingDays,
          p10: totalP10,
          p50: totalP50,
          p90: totalP90,
          attainment_probability: probAttainment,
          risk_level: riskLevel,
          simulations: 1000,
          computed_at: new Date().toISOString(),
        }, { onConflict: "salesperson_id,period_start" })
        .select("id")
        .single();
      if (fcErr) {
        console.error("forecast upsert error", fcErr);
      } else if (fc) {
        await supabase.from("quota_attainment_actions").delete().eq("forecast_id", fc.id);
        await generateAdvancedActions(supabase, {
          forecastId: fc.id,
          salespersonName: sp.name,
          quota: quotaAmount,
          p50: totalP50,
          prob: probAttainment,
          risk: riskLevel,
        });
      }
    }

    return new Response(
      JSON.stringify({ predictions_count: predictions.length, alerts_count: alerts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("predict-quota-attainment error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
