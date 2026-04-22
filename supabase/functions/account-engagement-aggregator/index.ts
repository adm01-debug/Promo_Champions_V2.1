import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENIORITY_WEIGHT: Record<string, number> = {
  c_level: 1.5, vp: 1.3, director: 1.15, manager: 1.0, ic: 0.8,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const { account_ids, recompute_all } = body as { account_ids?: string[]; recompute_all?: boolean };

    let ids: string[] = [];
    if (Array.isArray(account_ids) && account_ids.length > 0) {
      ids = account_ids.slice(0, 500);
    } else if (recompute_all) {
      const { data } = await supabase.from("accounts").select("id").limit(500);
      ids = (data ?? []).map((r: { id: string }) => r.id);
    } else {
      return new Response(JSON.stringify({ error: "Provide account_ids or recompute_all" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updated = 0;
    const tierCounts: Record<string, number> = { tier1: 0, tier2: 0, tier3: 0 };

    for (const accountId of ids) {
      const { data: contacts } = await supabase
        .from("account_contacts")
        .select("sale_id, seniority, buying_role")
        .eq("account_id", accountId);

      const list = contacts ?? [];
      const saleIds = list.map((c: { sale_id: string | null }) => c.sale_id).filter(Boolean) as string[];

      let scores: { sale_id: string; score: number; tier: string }[] = [];
      if (saleIds.length > 0) {
        const { data } = await supabase
          .from("email_engagement_scores")
          .select("sale_id, score, tier")
          .in("sale_id", saleIds);
        scores = (data ?? []) as typeof scores;
      }

      const scoreMap = new Map(scores.map((s) => [s.sale_id, s]));
      let weightedSum = 0;
      let weightTotal = 0;
      let engaged = 0;
      let championCount = 0;
      let dmCount = 0;

      for (const c of list as Array<{ sale_id: string | null; seniority: string | null; buying_role: string | null }>) {
        const w = SENIORITY_WEIGHT[c.seniority ?? "ic"] ?? 1.0;
        if (c.buying_role === "champion") championCount++;
        if (c.buying_role === "decision_maker") dmCount++;
        const sc = c.sale_id ? scoreMap.get(c.sale_id) : null;
        if (sc) {
          weightedSum += sc.score * w;
          weightTotal += w;
          if (["warm", "hot", "champion"].includes(sc.tier)) engaged++;
        }
      }

      const accountScore = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;
      const coverage = list.length > 0 ? Math.round((engaged / list.length) * 1000) / 10 : 0;
      const tier = accountScore >= 70 ? "tier1" : accountScore >= 40 ? "tier2" : "tier3";
      tierCounts[tier]++;

      await supabase.from("accounts").update({
        account_score: accountScore,
        coverage,
        engaged_contacts: engaged,
        champion_count: championCount,
        decision_maker_count: dmCount,
        last_aggregated_at: new Date().toISOString(),
      }).eq("id", accountId);
      updated++;
    }

    return new Response(JSON.stringify({ ok: true, updated, by_tier: tierCounts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
