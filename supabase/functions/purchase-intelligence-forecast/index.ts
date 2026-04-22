// Purchase Intelligence Forecast - AI prediction layer for client purchase patterns
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = await req.json().catch(() => ({}));
    const clientId = body?.client_id as string | undefined;
    if (!clientId) {
      return new Response(JSON.stringify({ error: "client_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull summary + heatmap
    const [summaryRes, heatmapRes] = await Promise.all([
      supabase.rpc("get_purchase_intelligence_summary", { _client_id: clientId }),
      supabase.rpc("get_client_purchase_heatmap", { _client_id: clientId, _months: 24 }),
    ]);

    if (summaryRes.error) throw summaryRes.error;
    const summary = summaryRes.data as Record<string, unknown> | null;
    if (!summary || (summary as { error?: string }).error) {
      return new Response(JSON.stringify(summary ?? { error: "no_data" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const heatmap = (heatmapRes.data ?? []) as Array<Record<string, unknown>>;

    // Compact context for the LLM
    const monthly = heatmap.reduce<Record<string, number>>((acc, row) => {
      const m = String(row.month_start);
      acc[m] = (acc[m] ?? 0) + Number(row.revenue ?? 0);
      return acc;
    }, {});
    const context = {
      client_name: summary.client_name,
      total_purchases: summary.total_purchases,
      total_revenue: summary.total_revenue,
      avg_ticket: summary.avg_ticket,
      avg_cycle_days: summary.avg_cycle_days,
      last_purchase_date: summary.last_purchase_date,
      days_since_last_purchase: summary.days_since_last_purchase,
      share_with_me_pct: summary.share_with_me_pct,
      share_with_others_pct: summary.share_with_others_pct,
      top_competitor_internal: summary.top_competitor_internal,
      monthly_revenue: monthly,
    };

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Você é um analista preditivo de vendas B2B. Analise o histórico de compras do cliente e produza previsões objetivas baseadas em padrões reais (cadência, sazonalidade, share interno). Use SEMPRE a tool predict_purchase. Português do Brasil.",
          },
          {
            role: "user",
            content: `Histórico do cliente:\n${JSON.stringify(context, null, 2)}\n\nGere previsão para os próximos 90 dias.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "predict_purchase",
              description: "Retorna previsão estruturada de próxima compra e risco de churn.",
              parameters: {
                type: "object",
                properties: {
                  predicted_next_purchase_date: { type: "string", description: "ISO date YYYY-MM-DD" },
                  predicted_amount: { type: "number" },
                  confidence: { type: "number", description: "0 a 1" },
                  churn_risk_score: { type: "number", description: "0 a 100" },
                  risk_reasons: { type: "array", items: { type: "string" } },
                  recommended_action: { type: "string" },
                  best_contact_window: { type: "string", enum: ["morning", "afternoon", "evening"] },
                  pattern_insight: { type: "string" },
                },
                required: [
                  "predicted_next_purchase_date",
                  "predicted_amount",
                  "confidence",
                  "churn_risk_score",
                  "risk_reasons",
                  "recommended_action",
                  "best_contact_window",
                  "pattern_insight",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "predict_purchase" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429 || aiResp.status === 402) {
        return new Response(
          JSON.stringify({
            ...summary,
            ai_prediction: null,
            ai_error: aiResp.status === 429 ? "rate_limited" : "credits_required",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error(`AI gateway: ${aiResp.status}`);
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    let prediction: Record<string, unknown> | null = null;
    if (toolCall?.function?.arguments) {
      try {
        prediction = JSON.parse(toolCall.function.arguments);
      } catch (_) {
        prediction = null;
      }
    }

    return new Response(
      JSON.stringify({ ...summary, ai_prediction: prediction }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("purchase-intelligence-forecast error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
