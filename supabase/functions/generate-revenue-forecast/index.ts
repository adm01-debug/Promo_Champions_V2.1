import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from '../_shared/request-id.ts';
import { chunkedIn } from '../_shared/chunked-in.ts';
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { LOVABLE_AI_CHAT_COMPLETIONS_URL } from "../_shared/ai-gateway.ts";
import { toBusinessDate } from "../_shared/business-date.ts";

// [FORECAST-SSOT] Fonte canônica por superfície:
// - Tempo real (dashboards, Pipeline Pulse): revenue-forecast-ai lê a view
//   revenue_forecast_view direto.
// - Persistido (aba AI Forecast, revenue_forecasts/forecast_deal_contributions):
//   esta função, usando as MESMAS definições da view — pipeline aberto =
//   stage_probabilities.probability estritamente entre 0 e 1 (join em
//   sales.status) e classificação = sales.forecast_category (trigger
//   auto_set_forecast_category). Assim commit/best_case/pipeline aqui são
//   idênticos aos da view e dos dashboards; não existe segunda conta.

type PeriodType = "week" | "month" | "quarter";

function periodEnd(start: string, type: PeriodType): string {
  const d = new Date(start + "T00:00:00Z");
  if (type === "week") d.setUTCDate(d.getUTCDate() + 6);
  else if (type === "month") {
    d.setUTCMonth(d.getUTCMonth() + 1);
    d.setUTCDate(d.getUTCDate() - 1);
  } else {
    d.setUTCMonth(d.getUTCMonth() + 3);
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return toBusinessDate(d);
}

interface DealRow {
  id: string;
  product_name: string | null;
  client_name: string | null;
  amount: number | null;
  status: string | null;
  forecast_category: string | null;
  salesperson_id: string | null;
}

// Mapeia a categoria canônica (sales.forecast_category) para o bucket do
// forecast persistido — mesma semântica de revenue_forecast_view.
function categoryBucket(cat: string | null): "commit" | "best" | "upside" | "omitted" {
  if (cat === "commit") return "commit";
  if (cat === "best_case") return "best";
  if (cat === "pipeline") return "upside";
  return "omitted";
}

Deno.serve(withRequestId("generate-revenue-forecast", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador)
    const rl = enforceRateLimit(req, { name: "generate-revenue-forecast", limit: 20, windowSeconds: 60 });
    if (rl) return rl;

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const body = await req.json().catch(() => ({}));
    const period_type: PeriodType = body.period_type ?? "month";
    const today = new Date();
    const defaultStart =
      period_type === "month"
        ? `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-01`
        : toBusinessDate(today);
    const period_start: string = body.period_start ?? defaultStart;
    const owner_id: string | null = body.owner_id ?? null;
    const period_end_str = periodEnd(period_start, period_type);

    // Pipeline aberto = definição canônica de revenue_forecast_view:
    // stage_probabilities.probability estritamente entre 0 e 1, join em
    // sales.status. O período delimita a janela de meta (sales_goals) e o
    // rótulo do forecast; o pipeline é o snapshot aberto no momento.
    const { data: probRows, error: probErr } = await supabase
      .from("stage_probabilities")
      .select("stage, probability");
    if (probErr) throw probErr;
    const openStatuses: string[] = [];
    const probByStatus = new Map<string, number>();
    for (const p of probRows ?? []) {
      const prob = Number(p.probability);
      probByStatus.set(p.stage, prob);
      if (prob > 0 && prob < 1) openStatuses.push(p.stage);
    }

    const dealList = await chunkedIn<DealRow>(
      openStatuses,
      (chunk) => {
        let q = supabase
          .from("sales")
          .select("id, product_name, client_name, amount, status, forecast_category, salesperson_id")
          .in("status", chunk)
          .is("deleted_at", null)
          .limit(10000);
        if (owner_id) q = q.eq("salesperson_id", owner_id);
        return q;
      },
      { maxConcurrency: 4, label: "generate-revenue-forecast.deals" },
    );

    // Fetch goal
    let goalQ = supabase
      .from("sales_goals")
      .select("goal_amount, salesperson_id, month")
      .gte("month", period_start)
      .lte("month", period_end_str);
    if (owner_id) goalQ = goalQ.eq("salesperson_id", owner_id);
    const { data: goals } = await goalQ.limit(5000);
    const goal_amount = (goals ?? []).reduce((s, g: { goal_amount: number }) => s + Number(g.goal_amount ?? 0), 0);

    // Agrega com as mesmas contas de revenue_forecast_view: commit/best/upside
    // são somas brutas por forecast_category; weighted_pipeline =
    // sum(amount * stage_probability) — igual a weighted_forecast da view.
    let commit = 0, best = 0, upside = 0, weighted = 0;
    const contributions: Array<{
      sale_id: string;
      category: "commit" | "best" | "upside" | "omitted";
      weighted_amount: number;
      probability: number;
      reasoning: string;
    }> = [];

    for (const d of dealList) {
      const amount = Number(d.amount ?? 0);
      const prob = probByStatus.get(d.status ?? "") ?? 0;
      const bucket = categoryBucket(d.forecast_category);
      const w = amount * prob;
      weighted += w;
      if (bucket === "commit") commit += amount;
      else if (bucket === "best") best += amount;
      else if (bucket === "upside") upside += amount;
      contributions.push({
        sale_id: d.id,
        category: bucket,
        weighted_amount: w,
        probability: prob,
        reasoning: `forecast_category=${d.forecast_category ?? "?"}, status=${d.status ?? "?"}, prob=${prob}`,
      });
    }

    const total_scenario = commit + best + upside;
    const gap_to_goal = goal_amount - commit;
    const confidence_score = Math.min(
      100,
      Math.round(
        (dealList.length > 0 ? 50 : 20) +
          (commit / Math.max(total_scenario, 1)) * 30 +
          (goal_amount > 0 && commit >= goal_amount ? 20 : 0),
      ),
    );

    // AI summary via Lovable AI
    let ai_summary: string | null = null;
    let factors: unknown[] = [];
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (apiKey && dealList.length > 0) {
      try {
        const aiResp = await fetchWithTimeout(LOVABLE_AI_CHAT_COMPLETIONS_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "Você é um analista de Revenue Operations. Resuma um forecast em 2 frases curtas (PT-BR) e liste 3 fatores principais.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  period_type, period_start, period_end: period_end_str,
                  commit, best, upside, goal_amount, gap_to_goal,
                  deals_count: dealList.length, confidence_score,
                }),
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "summarize_forecast",
                  description: "Resumo executivo do forecast",
                  parameters: {
                    type: "object",
                    properties: {
                      summary: { type: "string" },
                      factors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            label: { type: "string" },
                            impact: { type: "string", enum: ["positive", "negative", "neutral"] },
                            detail: { type: "string" },
                          },
                          required: ["label", "impact", "detail"],
                        },
                      },
                    },
                    required: ["summary", "factors"],
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "summarize_forecast" } },
          }),
        });
        if (aiResp.ok) {
          const j = await aiResp.json();
          const args = j.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
          if (args) {
            const parsed = JSON.parse(args);
            ai_summary = parsed.summary;
            factors = parsed.factors ?? [];
          }
        }
      } catch (e) {
        console.error("AI summary error:", e);
      }
    }

    // Upsert forecast
    const { data: existing } = await supabase
      .from("revenue_forecasts")
      .select("id")
      .eq("period_type", period_type)
      .eq("period_start", period_start)
      .is("owner_id", owner_id as string | null)
      .maybeSingle();

    const forecastPayload = {
      owner_id, period_type, period_start, period_end: period_end_str,
      commit_amount: commit, best_case_amount: best, upside_amount: upside,
      confidence_score, goal_amount, gap_to_goal,
      deals_count: dealList.length, weighted_pipeline: weighted,
      factors, ai_summary, calculated_at: new Date().toISOString(),
    };

    let forecastId: string;
    if (existing?.id) {
      forecastId = existing.id;
      const { error } = await supabase.from("revenue_forecasts").update(forecastPayload).eq("id", forecastId);
      if (error) throw error;
      await supabase.from("forecast_deal_contributions").delete().eq("forecast_id", forecastId);
    } else {
      const { data: ins, error } = await supabase.from("revenue_forecasts").insert(forecastPayload).select("id").single();
      if (error) throw error;
      forecastId = ins.id;
    }

    if (contributions.length) {
      const rows = contributions.map((c) => ({ ...c, forecast_id: forecastId }));
      const { error } = await supabase.from("forecast_deal_contributions").insert(rows);
      if (error) console.error("contributions insert error:", error);
    }

    return new Response(
      JSON.stringify({ ...forecastPayload, id: forecastId, contributions_count: contributions.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-revenue-forecast error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}));
