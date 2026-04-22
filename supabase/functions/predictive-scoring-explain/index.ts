import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface Driver {
  factor: string;
  label: string;
  value: number;
  baseline: number;
  contribution: number;
  contribution_pct: number;
  direction: "positive" | "negative";
}

interface Recommendation {
  action: string;
  expected_lift: number;
  priority: "high" | "medium" | "low";
}

const FACTOR_LABELS: Record<string, string> = {
  dealValue: "Valor do deal",
  stageProgress: "Progresso na etapa",
  timeInPipeline: "Tempo no pipeline",
  category: "Categoria do deal",
  recentActivity: "Atividade recente",
};

function buildRecommendations(drivers: Driver[], score: number): Recommendation[] {
  const recs: Recommendation[] = [];
  const negatives = drivers.filter((d) => d.direction === "negative").slice(0, 3);

  for (const d of negatives) {
    if (d.factor === "timeInPipeline") {
      recs.push({
        action: "Agendar follow-up imediato — deal está estagnado no funil.",
        expected_lift: 8,
        priority: "high",
      });
    } else if (d.factor === "recentActivity") {
      recs.push({
        action: "Registrar nova interação (ligação, e-mail ou reunião) nos próximos 2 dias.",
        expected_lift: 7,
        priority: "high",
      });
    } else if (d.factor === "stageProgress") {
      recs.push({
        action: "Avançar o deal para a próxima etapa do funil com checklist de qualificação.",
        expected_lift: 10,
        priority: "high",
      });
    } else if (d.factor === "dealValue") {
      recs.push({
        action: "Revisar escopo e propor upsell de produtos complementares.",
        expected_lift: 5,
        priority: "medium",
      });
    } else if (d.factor === "category") {
      recs.push({
        action: "Reposicionar o deal em categoria com maior conversão histórica.",
        expected_lift: 4,
        priority: "low",
      });
    }
  }

  if (recs.length === 0) {
    recs.push({
      action: score >= 70
        ? "Manter cadência atual — deal saudável. Foco em fechar com proposta personalizada."
        : "Reavaliar fit do cliente com ICP e qualificação BANT antes de investir mais tempo.",
      expected_lift: 3,
      priority: "medium",
    });
  }

  return recs.slice(0, 3);
}

async function generateNarrative(
  score: number,
  baseline: number,
  topDrivers: Driver[],
  recommendations: Recommendation[],
): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  const fallback = `Score ${score} (${score >= baseline ? "+" : ""}${(score - baseline).toFixed(0)} pts vs média da carteira de ${baseline.toFixed(0)}). Principal alavanca: ${topDrivers[0]?.label ?? "n/d"}. Próximo passo: ${recommendations[0]?.action ?? "manter cadência"}.`;

  if (!apiKey) return fallback;

  try {
    const prompt = `Score do deal: ${score}/100. Baseline da carteira: ${baseline.toFixed(0)}.
Top drivers: ${topDrivers.map((d) => `${d.label} (${d.direction === "positive" ? "+" : "-"}${d.contribution_pct.toFixed(0)}%)`).join(", ")}.
Recomendação principal: ${recommendations[0]?.action ?? "n/d"}.

Em 2-3 frases curtas em português do Brasil, explique o porquê desse score e qual a próxima ação prioritária. Tom direto, profissional, sem jargão.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um analista de vendas B2B. Responda apenas com a explicação solicitada, em PT-BR, sem preâmbulos." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      console.warn("AI gateway returned", resp.status);
      return fallback;
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content?.trim() || fallback;
  } catch (e) {
    console.error("Narrative generation failed:", e);
    return fallback;
  }
}

async function explainOne(
  supabase: ReturnType<typeof createClient>,
  saleId: string,
): Promise<{ sale_id: string; score: number; ok: boolean; error?: string }> {
  const { data: ls, error: lsErr } = await supabase
    .from("lead_scores")
    .select("score, factors, sale_id")
    .eq("sale_id", saleId)
    .maybeSingle();

  if (lsErr || !ls) return { sale_id: saleId, score: 0, ok: false, error: "lead_score not found" };

  const { data: sale } = await supabase
    .from("sales")
    .select("salesperson_id")
    .eq("id", saleId)
    .maybeSingle();

  // Baseline = average score of salesperson's portfolio
  let baseline = 50;
  if (sale?.salesperson_id) {
    const { data: portfolio } = await supabase
      .from("lead_scores")
      .select("score, factors, sales!inner(salesperson_id)")
      .eq("sales.salesperson_id", sale.salesperson_id);
    if (portfolio && portfolio.length > 0) {
      baseline = portfolio.reduce((s: number, r: any) => s + (r.score || 0), 0) / portfolio.length;
    }
  }

  // Compute baseline per factor
  const factors = (ls.factors || {}) as Record<string, any>;
  const baselineFactors: Record<string, number> = {
    dealValue: 12,
    stageProgress: 12,
    timeInPipeline: 12,
    category: 11,
    recentActivity: 9,
  };

  const drivers: Driver[] = [];
  for (const [key, label] of Object.entries(FACTOR_LABELS)) {
    const value = Number(factors[key] ?? 0);
    const base = baselineFactors[key] ?? 0;
    const contribution = value - base;
    drivers.push({
      factor: key,
      label,
      value,
      baseline: base,
      contribution,
      contribution_pct: 0,
      direction: contribution >= 0 ? "positive" : "negative",
    });
  }

  const totalAbs = drivers.reduce((s, d) => s + Math.abs(d.contribution), 0) || 1;
  drivers.forEach((d) => {
    d.contribution_pct = Math.round((Math.abs(d.contribution) / totalAbs) * 100);
  });
  drivers.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const topDrivers = drivers.slice(0, 5);

  const recommendations = buildRecommendations(drivers, ls.score);
  const narrative = await generateNarrative(ls.score, baseline, topDrivers, recommendations);

  const { error: upErr } = await supabase
    .from("lead_score_explanations")
    .upsert(
      {
        sale_id: saleId,
        score: ls.score,
        baseline_score: baseline,
        top_drivers: topDrivers,
        recommendations,
        narrative,
        model_version: "v1",
        calculated_at: new Date().toISOString(),
      },
      { onConflict: "sale_id" },
    );

  if (upErr) return { sale_id: saleId, score: ls.score, ok: false, error: upErr.message };
  return { sale_id: saleId, score: ls.score, ok: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const ids: string[] = body.sale_id ? [body.sale_id] : Array.isArray(body.sale_ids) ? body.sale_ids : [];

    if (ids.length === 0 || ids.length > 50) {
      return new Response(JSON.stringify({ error: "Provide sale_id or sale_ids (1-50)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const results: Array<{ sale_id: string; score: number; ok: boolean; error?: string }> = [];
    for (const id of ids) {
      results.push(await explainOne(supabase, id));
    }

    return new Response(JSON.stringify({ results, count: results.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predictive-scoring-explain error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
