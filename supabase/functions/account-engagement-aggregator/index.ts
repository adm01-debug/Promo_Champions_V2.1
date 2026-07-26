import { getCorsHeaders(req), getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";



const SENIORITY_WEIGHT: Record<string, number> = {
  c_level: 1.5, vp: 1.3, director: 1.15, manager: 1.0, ic: 0.8,
};

Deno.serve(withRequestId('account-engagement-aggregator', async (req, _ctx) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(req) });

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
        status: 400, headers: { getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const tierCounts: Record<string, number> = { tier1: 0, tier2: 0, tier3: 0 };

    // Batch-fetch ALL account_contacts for all accounts (was N individual queries)
    const allContacts = await chunkedIn<{ account_id: string; sale_id: string | null; seniority: string | null; buying_role: string | null }>(
      ids,
      (chunk) => supabase.from("account_contacts").select("account_id, sale_id, seniority, buying_role").in("account_id", chunk),
      { parallel: true, label: "account-engagement-aggregator.contacts" },
    );

    // Collect all unique sale_ids then batch-fetch all engagement scores in one call
    const allSaleIds = [...new Set(allContacts.map((c) => c.sale_id).filter(Boolean) as string[])];
    const allScores = allSaleIds.length > 0
      ? await chunkedIn<{ sale_id: string; score: number; tier: string }>(
          allSaleIds,
          (chunk) => supabase.from("email_engagement_scores").select("sale_id, score, tier").in("sale_id", chunk),
          { parallel: true, label: "account-engagement-aggregator.scores" },
        )
      : [];

    // Build lookup maps in memory
    const contactsByAccount = new Map<string, Array<{ sale_id: string | null; seniority: string | null; buying_role: string | null }>>();
    for (const c of allContacts) {
      const bucket = contactsByAccount.get(c.account_id) ?? [];
      bucket.push(c);
      contactsByAccount.set(c.account_id, bucket);
    }
    const scoreMap = new Map(allScores.map((s) => [s.sale_id, s]));

    // Compute all metrics in memory — zero DB calls
    const nowIso = new Date().toISOString();
    const updateRows: Array<{
      id: string; account_score: number; coverage: number;
      engaged_contacts: number; champion_count: number; decision_maker_count: number; last_aggregated_at: string;
    }> = [];

    for (const accountId of ids) {
      const list = contactsByAccount.get(accountId) ?? [];
      let weightedSum = 0, weightTotal = 0, engaged = 0, championCount = 0, dmCount = 0;

      for (const c of list) {
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
      updateRows.push({ id: accountId, account_score: accountScore, coverage, engaged_contacts: engaged, champion_count: championCount, decision_maker_count: dmCount, last_aggregated_at: nowIso });
    }

    // Single batch upsert for all accounts (was N individual updates)
    let updated = 0;
    if (updateRows.length > 0) {
      const { error } = await supabase.from("accounts").upsert(updateRows, { onConflict: "id" });
      if (error) console.error("account-engagement-aggregator upsert error:", error);
      else updated = updateRows.length;
    }

    return new Response(JSON.stringify({ ok: true, updated, by_tier: tierCounts }), {
      headers: { getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error('account-engagement-aggregator error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
}));
