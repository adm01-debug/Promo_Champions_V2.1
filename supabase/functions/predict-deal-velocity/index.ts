import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface PredictBody {
  sale_id?: string;
  batch?: boolean;
  limit?: number;
}

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function tierFromConfidence(score: number): "low" | "medium" | "high" {
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function statusFromRatio(ratio: number, daysInStage: number): "ahead" | "on_track" | "slow" | "stalled" {
  if (daysInStage > 30 && ratio > 2) return "stalled";
  if (ratio > 1.5) return "slow";
  if (ratio < 0.7) return "ahead";
  return "on_track";
}

async function getBaseline(stage: string, ownerId?: string | null) {
  const { data } = await admin
    .from("stage_velocity_baselines")
    .select("avg_days, median_days, p75_days, sample_size")
    .eq("stage", stage)
    .eq("owner_id", ownerId ?? "00000000-0000-0000-0000-000000000000")
    .maybeSingle();
  if (data && data.sample_size >= 3) return data;
  const { data: global } = await admin
    .from("stage_velocity_baselines")
    .select("avg_days, median_days, p75_days, sample_size")
    .eq("stage", stage)
    .is("owner_id", null)
    .maybeSingle();
  return global ?? { avg_days: 14, median_days: 10, p75_days: 21, sample_size: 0 };
}

async function predictForSale(saleId: string) {
  const { data: sale, error } = await admin
    .from("sales")
    .select("id, status, stage, amount, salesperson_id, created_at, updated_at")
    .eq("id", saleId)
    .maybeSingle();
  if (error || !sale) throw new Error("Sale not found");
  if (sale.status === "completed" || sale.status === "lost") {
    return { skipped: true, reason: "deal closed" };
  }

  const stage = sale.stage ?? "unknown";
  const baseline = await getBaseline(stage, sale.salesperson_id);
  const expectedDays = Number(baseline.median_days || baseline.avg_days || 14);

  const { data: stageHistory } = await admin
    .from("deal_stage_history")
    .select("entered_at, exited_at, stage")
    .eq("sale_id", saleId)
    .order("entered_at", { ascending: false })
    .limit(1);
  const enteredAt = stageHistory?.[0]?.entered_at ?? sale.updated_at ?? sale.created_at;
  const daysInStage = Math.max(
    0,
    Math.floor((Date.now() - new Date(enteredAt).getTime()) / 86400000),
  );

  const { data: health } = await admin
    .from("deal_health_scores")
    .select("health_score, tier")
    .eq("sale_id", saleId)
    .maybeSingle();

  const { data: coverage } = await admin
    .from("deal_committee_coverage")
    .select("coverage_score, tier")
    .eq("sale_id", saleId)
    .maybeSingle();

  const ratio = expectedDays > 0 ? daysInStage / expectedDays : 1;
  const remaining = Math.max(1, Math.round(expectedDays - daysInStage));

  // Heuristic baseline
  let predictedDays = Math.max(remaining, 3);
  let confidence = 50;
  const drivers: string[] = [];
  const brakes: string[] = [];

  if (health?.health_score) {
    if (health.health_score >= 70) { confidence += 15; drivers.push(`Saúde alta (${health.health_score})`); }
    else if (health.health_score < 40) { confidence -= 15; brakes.push(`Saúde baixa (${health.health_score})`); predictedDays = Math.round(predictedDays * 1.5); }
  }
  if (coverage?.coverage_score) {
    if (coverage.coverage_score >= 70) { confidence += 10; drivers.push(`Comitê forte (${coverage.coverage_score})`); }
    else if (coverage.coverage_score < 40) { confidence -= 10; brakes.push(`Comitê fraco (${coverage.coverage_score})`); predictedDays = Math.round(predictedDays * 1.3); }
  }
  if (ratio > 2) { brakes.push(`Parado há ${daysInStage}d (esperado ${expectedDays.toFixed(0)}d)`); predictedDays = Math.round(predictedDays * 1.4); confidence -= 10; }
  if (ratio < 0.5) { drivers.push("Avançando rápido no estágio"); confidence += 5; }

  // Try AI refinement (best-effort)
  if (LOVABLE_API_KEY) {
    try {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Você é um analista de previsão de vendas B2B. Estime dias até fechamento (won/lost) com base nos dados." },
            { role: "user", content: JSON.stringify({ stage, amount: sale.amount, daysInStage, expectedDays, baseline, health, coverage }) },
          ],
          tools: [{
            type: "function",
            function: {
              name: "set_prediction",
              description: "Define a previsão",
              parameters: {
                type: "object",
                properties: {
                  predicted_days_remaining: { type: "integer", minimum: 1, maximum: 365 },
                  confidence_score: { type: "integer", minimum: 0, maximum: 100 },
                  factors: {
                    type: "object",
                    properties: {
                      drivers: { type: "array", items: { type: "string" } },
                      brakes: { type: "array", items: { type: "string" } },
                    },
                    required: ["drivers", "brakes"],
                  },
                },
                required: ["predicted_days_remaining", "confidence_score", "factors"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "set_prediction" } },
        }),
      });
      if (aiResp.ok) {
        const aiJson = await aiResp.json();
        const args = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
        if (args) {
          const parsed = JSON.parse(args);
          predictedDays = parsed.predicted_days_remaining ?? predictedDays;
          confidence = parsed.confidence_score ?? confidence;
          if (parsed.factors?.drivers) drivers.push(...parsed.factors.drivers);
          if (parsed.factors?.brakes) brakes.push(...parsed.factors.brakes);
        }
      }
    } catch (e) {
      console.warn("AI refinement failed, using heuristic", e);
    }
  }

  confidence = Math.max(0, Math.min(100, confidence));
  const closeDate = new Date(Date.now() + predictedDays * 86400000).toISOString().slice(0, 10);

  const { data: ownerRow } = await admin
    .from("salespeople")
    .select("auth_user_id")
    .eq("id", sale.salesperson_id)
    .maybeSingle();

  const payload = {
    sale_id: saleId,
    owner_id: ownerRow?.auth_user_id ?? null,
    predicted_close_date: closeDate,
    predicted_days_remaining: predictedDays,
    confidence_score: confidence,
    confidence_tier: tierFromConfidence(confidence),
    velocity_status: statusFromRatio(ratio, daysInStage),
    current_stage: stage,
    days_in_stage: daysInStage,
    expected_days_in_stage: expectedDays,
    stage_velocity_ratio: Number(ratio.toFixed(2)),
    factors: { drivers: [...new Set(drivers)], brakes: [...new Set(brakes)] },
    model_version: "v1",
    calculated_at: new Date().toISOString(),
  };

  const { error: upErr } = await admin
    .from("deal_velocity_predictions")
    .upsert(payload, { onConflict: "sale_id" });
  if (upErr) throw upErr;
  return payload;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body: PredictBody = await req.json().catch(() => ({}));
    if (body.batch) {
      const limit = Math.min(body.limit ?? 25, 50);
      const { data: sales } = await admin
        .from("sales")
        .select("id")
        .not("status", "in", '("completed","lost")')
        .order("updated_at", { ascending: false })
        .limit(limit);
      const results: any[] = [];
      for (const s of sales ?? []) {
        try { results.push(await predictForSale(s.id)); }
        catch (e) { results.push({ sale_id: s.id, error: String(e) }); }
      }
      return new Response(JSON.stringify({ count: results.length, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body.sale_id) {
      return new Response(JSON.stringify({ error: "sale_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const result = await predictForSale(body.sale_id);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict-deal-velocity error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
