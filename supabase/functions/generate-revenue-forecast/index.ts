import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  return d.toISOString().slice(0, 10);
}

interface DealRow {
  id: string;
  product_name: string | null;
  client_name: string | null;
  total_amount: number | null;
  stage: string | null;
  status: string | null;
  expected_close_date: string | null;
  salesperson_id: string | null;
  probability: number | null;
}

function classifyDeal(d: DealRow, health?: number, velocityStatus?: string, coverage?: string) {
  const prob = Number(d.probability ?? 0);
  const h = health ?? 50;
  const v = velocityStatus ?? "unknown";
  const c = coverage ?? "weak";

  // Commit: high health + on track + strong coverage + high prob
  if (h >= 75 && (v === "on_track" || v === "ahead") && (c === "strong" || c === "excellent") && prob >= 0.7) {
    return { category: "commit" as const, weight: 0.9 };
  }
  if (h >= 60 && prob >= 0.5) return { category: "best" as const, weight: 0.6 };
  if (prob >= 0.2) return { category: "upside" as const, weight: 0.3 };
  return { category: "omitted" as const, weight: 0 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
        : today.toISOString().slice(0, 10);
    const period_start: string = body.period_start ?? defaultStart;
    const owner_id: string | null = body.owner_id ?? null;
    const period_end_str = periodEnd(period_start, period_type);

    // Fetch open deals in period
    let dealsQ = supabase
      .from("sales")
      .select("id, product_name, client_name, total_amount, stage, status, expected_close_date, salesperson_id, probability")
      .in("status", ["open", "in_progress", "qualified", "proposal", "negotiation"])
      .gte("expected_close_date", period_start)
      .lte("expected_close_date", period_end_str);
    if (owner_id) dealsQ = dealsQ.eq("salesperson_id", owner_id);
    const { data: deals, error: dealsErr } = await dealsQ;
    if (dealsErr) throw dealsErr;

    const dealList = (deals ?? []) as DealRow[];

    // Fetch enrichment signals
    const dealIds = dealList.map((d) => d.id);
    const [healthRes, velocityRes] = await Promise.all([
      dealIds.length
        ? supabase.from("deal_health_scores").select("sale_id, health_score").in("sale_id", dealIds)
        : Promise.resolve({ data: [], error: null }),
      dealIds.length
        ? supabase.from("deal_velocity_predictions").select("sale_id, status").in("sale_id", dealIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const healthMap = new Map<string, number>(
      (healthRes.data ?? []).map((h: { sale_id: string; health_score: number }) => [h.sale_id, Number(h.health_score)]),
    );
    const velocityMap = new Map<string, string>(
      (velocityRes.data ?? []).map((v: { sale_id: string; status: string }) => [v.sale_id, v.status]),
    );

    // Fetch goal
    let goalQ = supabase
      .from("sales_goals")
      .select("goal_amount, salesperson_id, month")
      .gte("month", period_start)
      .lte("month", period_end_str);
    if (owner_id) goalQ = goalQ.eq("salesperson_id", owner_id);
    const { data: goals } = await goalQ;
    const goal_amount = (goals ?? []).reduce((s, g: { goal_amount: number }) => s + Number(g.goal_amount ?? 0), 0);

    // Classify and aggregate
    let commit = 0, best = 0, upside = 0, weighted = 0;
    const contributions: Array<{
      sale_id: string;
      category: "commit" | "best" | "upside" | "omitted";
      weighted_amount: number;
      probability: number;
      reasoning: string;
    }> = [];

    for (const d of dealList) {
      const amount = Number(d.total_amount ?? 0);
      const health = healthMap.get(d.id);
      const velocity = velocityMap.get(d.id);
      const cls = classifyDeal(d, health, velocity);
      const w = amount * cls.weight;
      weighted += w;
      if (cls.category === "commit") commit += w;
      else if (cls.category === "best") best += w;
      else if (cls.category === "upside") upside += w;
      contributions.push({
        sale_id: d.id,
        category: cls.category,
        weighted_amount: w,
        probability: cls.weight,
        reasoning: `health=${health ?? "?"}, velocity=${velocity ?? "?"}, prob=${d.probability ?? 0}`,
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
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
});
