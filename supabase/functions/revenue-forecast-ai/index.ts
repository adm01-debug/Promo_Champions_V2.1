import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface ForecastRow {
  salesperson_id: string | null;
  total_open_pipeline: number;
  weighted_forecast: number;
  open_deals_count: number;
  avg_cycle_days: number;
  won_amount_90d: number;
  won_count_90d: number;
  monthly_goal: number;
  commit_amount: number;
  best_case_amount: number;
  pipeline_amount: number;
  pessimistic_30d: number;
  realistic_30d: number;
  optimistic_30d: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceKey,
      { auth: { persistSession: false } },
    );

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const horizonDays = Number(body.horizon_days ?? 30);
    const ownerId: string | null = body.owner_id ?? null;
    const includeAI: boolean = body.include_ai !== false;
    const factor = horizonDays / 30;

    let q = supabase.from("revenue_forecast_view").select("*");
    if (ownerId) q = q.eq("salesperson_id", ownerId);
    const { data: rows, error } = await q;
    if (error) throw error;

    const list = (rows ?? []) as ForecastRow[];
    const agg = list.reduce(
      (acc, r) => {
        acc.total_open_pipeline += Number(r.total_open_pipeline) || 0;
        acc.weighted_forecast += Number(r.weighted_forecast) || 0;
        acc.open_deals_count += Number(r.open_deals_count) || 0;
        acc.won_amount_90d += Number(r.won_amount_90d) || 0;
        acc.won_count_90d += Number(r.won_count_90d) || 0;
        acc.monthly_goal += Number(r.monthly_goal) || 0;
        acc.commit_amount += Number(r.commit_amount) || 0;
        acc.best_case_amount += Number(r.best_case_amount) || 0;
        acc.pipeline_amount += Number(r.pipeline_amount) || 0;
        acc.pessimistic += (Number(r.pessimistic_30d) || 0) * factor;
        acc.realistic += (Number(r.realistic_30d) || 0) * factor;
        acc.optimistic += (Number(r.optimistic_30d) || 0) * factor;
        acc.cycle_sum += Number(r.avg_cycle_days) || 0;
        acc.cycle_n += r.avg_cycle_days ? 1 : 0;
        return acc;
      },
      {
        total_open_pipeline: 0,
        weighted_forecast: 0,
        open_deals_count: 0,
        won_amount_90d: 0,
        won_count_90d: 0,
        monthly_goal: 0,
        commit_amount: 0,
        best_case_amount: 0,
        pipeline_amount: 0,
        pessimistic: 0,
        realistic: 0,
        optimistic: 0,
        cycle_sum: 0,
        cycle_n: 0,
      },
    );

    const avgCycle = agg.cycle_n > 0 ? agg.cycle_sum / agg.cycle_n : 45;
    const goalForHorizon = agg.monthly_goal * factor;
    const gapToGoal = goalForHorizon - agg.realistic;
    const confidence = goalForHorizon > 0
      ? Math.max(0, Math.min(100, Math.round((agg.realistic / goalForHorizon) * 100)))
      : Math.min(100, Math.round((agg.weighted_forecast / Math.max(agg.total_open_pipeline, 1)) * 100));

    const scenarios = {
      pessimistic: Math.round(agg.pessimistic),
      realistic: Math.round(agg.realistic),
      optimistic: Math.round(agg.optimistic),
    };

    const categories = {
      commit: Math.round(agg.commit_amount),
      best_case: Math.round(agg.best_case_amount),
      pipeline: Math.round(agg.pipeline_amount),
    };

    let narrative = "";
    let risks: string[] = [];
    let opportunities: string[] = [];

    if (includeAI && Deno.env.get("LOVABLE_API_KEY")) {
      try {
        const prompt = `Você é um analista de RevOps. Gere um resumo executivo curto (≤80 palavras) em PT-BR e 3 riscos + 3 oportunidades a partir destes dados de forecast (horizonte ${horizonDays}d):
- Pipeline aberto: R$ ${agg.total_open_pipeline.toFixed(0)}
- Forecast ponderado: R$ ${agg.weighted_forecast.toFixed(0)}
- Deals abertos: ${agg.open_deals_count}
- Ciclo médio: ${avgCycle.toFixed(0)} dias
- Ganho últimos 90d: R$ ${agg.won_amount_90d.toFixed(0)} (${agg.won_count_90d} deals)
- Meta no horizonte: R$ ${goalForHorizon.toFixed(0)}
- Cenário realista: R$ ${scenarios.realistic} | Pessimista: R$ ${scenarios.pessimistic} | Otimista: R$ ${scenarios.optimistic}
- Categorias: Commit R$ ${categories.commit} | Best Case R$ ${categories.best_case} | Pipeline R$ ${categories.pipeline}
- Gap vs meta: R$ ${gapToGoal.toFixed(0)}`;

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Responda apenas com JSON válido." },
              { role: "user", content: prompt },
            ],
            tools: [{
              type: "function",
              function: {
                name: "forecast_insights",
                description: "Gera insights de forecast",
                parameters: {
                  type: "object",
                  properties: {
                    narrative: { type: "string" },
                    risks: { type: "array", items: { type: "string" }, maxItems: 3 },
                    opportunities: { type: "array", items: { type: "string" }, maxItems: 3 },
                  },
                  required: ["narrative", "risks", "opportunities"],
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "forecast_insights" } },
          }),
        });

        if (aiRes.ok) {
          const j = await aiRes.json();
          const args = j.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
          if (args) {
            const parsed = JSON.parse(args);
            narrative = parsed.narrative ?? "";
            risks = parsed.risks ?? [];
            opportunities = parsed.opportunities ?? [];
          }
        }
      } catch (e) {
        console.error("AI insights failed:", e);
      }
    }

    return new Response(
      JSON.stringify({
        horizon_days: horizonDays,
        scenarios,
        confidence,
        metrics: {
          total_open_pipeline: Math.round(agg.total_open_pipeline),
          weighted_forecast: Math.round(agg.weighted_forecast),
          open_deals_count: agg.open_deals_count,
          avg_cycle_days: Math.round(avgCycle),
          won_amount_90d: Math.round(agg.won_amount_90d),
          won_count_90d: agg.won_count_90d,
          monthly_goal: Math.round(agg.monthly_goal),
          goal_for_horizon: Math.round(goalForHorizon),
          gap_to_goal: Math.round(gapToGoal),
          categories,
        },
        per_owner: list,
        narrative,
        risks,
        opportunities,
        generated_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("revenue-forecast-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
