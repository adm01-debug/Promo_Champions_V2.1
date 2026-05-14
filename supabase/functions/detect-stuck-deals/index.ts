import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



const RECOMMENDATIONS: Record<string, string> = {
  lead: "Qualifique rapidamente: defina BANT e marque uma discovery call.",
  prospecting: "Faça follow-up multicanal e identifique a dor principal.",
  qualified: "Apresente solução personalizada e mapeie comitê de compra.",
  proposal: "Confirme objeções pendentes e proponha próxima reunião com decisor.",
  negotiation: "Faça concessões mensuráveis e estabeleça prazo de fechamento.",
  contract: "Acompanhe assinatura e remova bloqueios jurídicos/financeiros.",
};

const DEFAULT_RECOMMENDATION = "Reengaje o stakeholder principal e defina próxima etapa concreta com data.";

function classify(hours: number, p75: number, p90: number): "watch" | "stuck" | "critical" {
  if (p90 > 0 && hours >= p90 * 1.25) return "critical";
  if (p75 > 0 && hours >= p75) return "stuck";
  return "watch";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: baselines, error: blErr } = await supabase
      .from("stage_velocity_baselines")
      .select("stage, p75_hours, p90_hours")
      .eq("segment", "all");
    if (blErr) throw blErr;

    const baselineMap = new Map<string, { p75: number; p90: number }>();
    for (const b of baselines || []) {
      baselineMap.set(b.stage, { p75: Number(b.p75_hours), p90: Number(b.p90_hours) });
    }

    const { data: openTransitions, error: trErr } = await supabase
      .from("deal_stage_transitions")
      .select("sale_id, to_stage, entered_at")
      .is("exited_at", null);
    if (trErr) throw trErr;

    const now = Date.now();
    const upserts: Array<Record<string, unknown>> = [];

    for (const t of openTransitions || []) {
      const hoursInStage = (now - new Date(t.entered_at).getTime()) / 3_600_000;
      const bl = baselineMap.get(t.to_stage) || { p75: 0, p90: 0 };
      const severity = classify(hoursInStage, bl.p75, bl.p90);
      if (severity === "watch" && bl.p75 === 0) continue;

      upserts.push({
        sale_id: t.sale_id,
        current_stage: t.to_stage,
        hours_in_stage: Number(hoursInStage.toFixed(1)),
        baseline_p75: bl.p75,
        baseline_p90: bl.p90,
        severity,
        recommendation: RECOMMENDATIONS[t.to_stage.toLowerCase()] || DEFAULT_RECOMMENDATION,
        detected_at: new Date().toISOString(),
      });
    }

    if (upserts.length) {
      const { error: upErr } = await supabase
        .from("deal_velocity_alerts")
        .upsert(upserts, { onConflict: "sale_id" });
      if (upErr) throw upErr;
    }

    return new Response(JSON.stringify({ ok: true, alerts: upserts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-stuck-deals error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
