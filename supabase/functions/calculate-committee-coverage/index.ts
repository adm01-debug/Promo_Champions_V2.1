import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { sale_id } = await req.json();
    if (!sale_id) {
      return new Response(JSON.stringify({ error: "sale_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sale } = await supabase
      .from("sales")
      .select("id, salesperson_id")
      .eq("id", sale_id)
      .single();
    if (!sale) {
      return new Response(JSON.stringify({ error: "Sale not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sp } = await supabase
      .from("salespeople")
      .select("user_id")
      .eq("id", sale.salesperson_id)
      .maybeSingle();
    const ownerId = sp?.user_id;
    if (!ownerId) {
      return new Response(JSON.stringify({ error: "Owner not found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: stakeholders } = await supabase
      .from("deal_stakeholders")
      .select("dmu_role, influence_level, sentiment")
      .eq("sale_id", sale_id);

    const list = stakeholders || [];
    const roles = new Set(list.map((s) => s.dmu_role));

    let score = 0;
    const gaps: string[] = [];
    const risks: string[] = [];

    if (roles.has("decision_maker")) score += 30; else gaps.push("decision_maker");
    if (roles.has("economic_buyer")) score += 20; else gaps.push("economic_buyer");
    if (roles.has("champion")) score += 25; else gaps.push("champion");
    if (roles.has("influencer")) score += 10; else gaps.push("influencer");

    const blockers = list.filter((s) => s.dmu_role === "blocker");
    const blockerNeg = blockers.filter((s) => s.sentiment === "negative" && s.influence_level === "high");
    if (blockerNeg.length === 0) score += 15;
    else risks.push(`${blockerNeg.length} blocker(s) com alta influência e sentimento negativo`);

    if (list.length === 1) risks.push("Single-threaded: apenas 1 contato no comitê");
    if (list.length === 0) risks.push("Nenhum stakeholder mapeado");

    score = Math.max(0, Math.min(100, score));

    let tier: "weak" | "partial" | "strong" | "complete";
    if (score >= 90) tier = "complete";
    else if (score >= 65) tier = "strong";
    else if (score >= 35) tier = "partial";
    else tier = "weak";

    const { data: coverage, error: upsertErr } = await supabase
      .from("deal_committee_coverage")
      .upsert({
        sale_id,
        owner_id: ownerId,
        coverage_score: score,
        tier,
        gaps,
        risks,
        stakeholder_count: list.length,
        calculated_at: new Date().toISOString(),
      }, { onConflict: "sale_id" })
      .select()
      .single();

    if (upsertErr) throw upsertErr;

    return new Response(JSON.stringify({ success: true, coverage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("calculate-committee-coverage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
