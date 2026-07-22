import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";
import { validateUUID, validateEnum, collectErrors, validationErrorResponse } from "../_shared/validation.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";



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
    const resp = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

Deno.serve(withRequestId("predict-quota-attainment", async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));

    const errs = collectErrors([
      validateEnum(body.period, "period", ["month", "quarter"], false),
      validateUUID(body.salesperson_id, "salesperson_id", false),
    ]);
    if (errs.length) return validationErrorResponse(errs, corsHeaders);

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

    let spQuery = supabase.from("salespeople").select("id, name, monthly_goal").limit(500);
    if (filterSp) spQuery = spQuery.eq("id", filterSp);
    const { data: salespeople, error: spErr } = await spQuery;
    if (spErr) throw spErr;

    const spIds = (salespeople ?? []).map((sp) => sp.id);

    // Batch-fetch probability scores + closed/open sales in parallel (was N+N queries)
    const [scoresRes, closedData, openData] = await Promise.all([
      supabase
        .from("deal_probability_scores")
        .select("sale_id, calibrated_probability")
        .order("calculated_at", { ascending: false })
        .limit(10000),
      chunkedIn<{ id: string; amount: number; salesperson_id: string }>(
        spIds,
        (chunk) => supabase
          .from("sales")
          .select("id, amount, salesperson_id")
          .in("salesperson_id", chunk)
          .eq("status", "closed_won")
          .gte("created_at", periodStart.toISOString())
          .lte("created_at", periodEnd.toISOString())
          .limit(10000),
        { parallel: true, label: "predict-quota-attainment.closed" },
      ),
      chunkedIn<{ id: string; amount: number; stage: string; salesperson_id: string }>(
        spIds,
        (chunk) => supabase
          .from("sales")
          .select("id, amount, stage, salesperson_id")
          .in("salesperson_id", chunk)
          .not("status", "in", "(closed_won,closed_lost)")
          .limit(10000),
        { parallel: true, label: "predict-quota-attainment.open" },
      ),
    ]);

    // Build lookup maps in memory
    const latestScore = new Map<string, number>();
    for (const s of scoresRes.data ?? []) {
      if (!latestScore.has(s.sale_id)) latestScore.set(s.sale_id, Number(s.calibrated_probability));
    }

    const closedBySp = new Map<string, Array<{ id: string; amount: number }>>();
    for (const s of closedData) {
      const bucket = closedBySp.get(s.salesperson_id) ?? [];
      bucket.push(s);
      closedBySp.set(s.salesperson_id, bucket);
    }

    const openBySp = new Map<string, Array<{ id: string; amount: number; stage: string | null }>>();
    for (const s of openData) {
      const bucket = openBySp.get(s.salesperson_id) ?? [];
      bucket.push(s);
      openBySp.set(s.salesperson_id, bucket);
    }

    // Compute all metrics in memory — zero DB calls inside this loop
    type SpMetrics = {
      sp: { id: string; name: string; monthly_goal: number | null };
      quotaAmount: number;
      closedAmount: number;
      weightedPipeline: number;
      openDeals: OpenDeal[];
      p10: number; p50: number; p90: number; samples: number[];
      totalProjected: number;
      probAttainment: number;
      currentPace: number;
      paceRequired: number;
      riskLevel: ReturnType<typeof classifyRisk>;
      factors: Record<string, number>;
    };
    const metricsPerSp: SpMetrics[] = [];

    for (const sp of salespeople ?? []) {
      const quotaMonthly = Number(sp.monthly_goal ?? 0);
      const quotaAmount = period === "quarter" ? quotaMonthly * 3 : quotaMonthly;

      const closedAmount = (closedBySp.get(sp.id) ?? []).reduce((sum, s) => sum + Number(s.amount ?? 0), 0);

      const openDeals: OpenDeal[] = (openBySp.get(sp.id) ?? []).map((d) => {
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

      metricsPerSp.push({ sp, quotaAmount, closedAmount, weightedPipeline, openDeals, p10, p50, p90, samples, totalProjected, probAttainment, currentPace, paceRequired, riskLevel, factors });
    }

    // Batch insert all predictions (was N individual inserts)
    const predRows = metricsPerSp.map((m) => ({
      salesperson_id: m.sp.id,
      period_start: periodStart.toISOString().slice(0, 10),
      period_end: periodEnd.toISOString().slice(0, 10),
      quota_amount: m.quotaAmount,
      closed_amount: m.closedAmount,
      weighted_pipeline: m.weightedPipeline,
      predicted_amount: m.totalProjected,
      attainment_probability: m.probAttainment,
      scenario_pessimistic: m.closedAmount + m.p10,
      scenario_realistic: m.closedAmount + m.p50,
      scenario_optimistic: m.closedAmount + m.p90,
      pace_required_per_day: m.paceRequired,
      current_pace_per_day: m.currentPace,
      risk_level: m.riskLevel,
      factors: m.factors,
    }));

    const { data: predsData, error: predErr } = await supabase
      .from("quota_attainment_predictions")
      .insert(predRows)
      .select("id, salesperson_id");
    if (predErr) throw predErr;
    const predictions = predsData ?? [];

    const predIdBySp = new Map<string, string>();
    for (const p of predictions) predIdBySp.set(p.salesperson_id, p.id);

    // Batch insert alerts for at-risk salespeople (was N conditional inserts)
    const alertRows = metricsPerSp
      .filter((m) => m.riskLevel === "at_risk" || m.riskLevel === "critical")
      .map((m) => {
        const gap = Math.max(0, m.quotaAmount - m.totalProjected);
        const negotiationCount = m.openDeals.filter((d) => d.probability >= 0.5).length;
        const message = `${m.sp.name}: ${(m.probAttainment * 100).toFixed(0)}% chance de atingir quota.`;
        const action = `Fechar R$ ${gap.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} em ${remainingDays} dias — focar em ${negotiationCount} deals avançados.`;
        return {
          prediction_id: predIdBySp.get(m.sp.id) ?? null,
          salesperson_id: m.sp.id,
          severity: m.riskLevel === "critical" ? "critical" : "warning",
          message,
          recommended_action: action,
        };
      });

    const alerts: Array<{ id: string; salesperson_id: string }> = [];
    if (alertRows.length > 0) {
      const { data: alertsData } = await supabase
        .from("quota_attainment_alerts")
        .insert(alertRows)
        .select("id, salesperson_id");
      if (alertsData) alerts.push(...alertsData);
    }

    // Batch upsert all forecasts (was N individual upserts)
    const fcRows = metricsPerSp.map((m) => ({
      salesperson_id: m.sp.id,
      period_start: periodStart.toISOString().slice(0, 10),
      period_end: periodEnd.toISOString().slice(0, 10),
      quota: m.quotaAmount,
      closed: m.closedAmount,
      weighted_open: m.weightedPipeline,
      pace_per_day: m.currentPace,
      days_remaining: remainingDays,
      p10: m.closedAmount + m.p10,
      p50: m.closedAmount + m.p50,
      p90: m.closedAmount + m.p90,
      attainment_probability: m.probAttainment,
      risk_level: m.riskLevel,
      simulations: 1000,
      computed_at: new Date().toISOString(),
    }));

    const { data: fcsData, error: fcErr } = await supabase
      .from("quota_attainment_forecasts")
      .upsert(fcRows, { onConflict: "salesperson_id,period_start" })
      .select("id, salesperson_id");
    if (fcErr) console.error("forecast upsert error", fcErr);

    if (fcsData && fcsData.length > 0) {
      const fcIds = fcsData.map((fc) => fc.id);
      const fcIdBySp = new Map<string, string>();
      for (const fc of fcsData) fcIdBySp.set(fc.salesperson_id, fc.id);

      // Batch delete old actions for ALL forecast IDs (chunked p/ evitar overflow)
      await chunkedIn<{ id: string }>(
        fcIds,
        (chunk) => supabase.from("quota_attainment_actions").delete().in("forecast_id", chunk).select("id"),
        { parallel: false, label: "predict-quota-attainment.delete-actions" },
      );

      // AI action generation in parallel (was sequential)
      await Promise.all(
        metricsPerSp.map((m) => {
          const fcId = fcIdBySp.get(m.sp.id);
          if (!fcId) return Promise.resolve();
          return generateAdvancedActions(supabase, {
            forecastId: fcId,
            salespersonName: m.sp.name,
            quota: m.quotaAmount,
            p50: m.closedAmount + m.p50,
            prob: m.probAttainment,
            risk: m.riskLevel,
          });
        }),
      );
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
}));
