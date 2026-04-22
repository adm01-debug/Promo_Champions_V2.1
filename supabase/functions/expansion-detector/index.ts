import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

interface Playbook {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown> | null;
  expansion_type: string;
  recommended_action: string | null;
  is_active: boolean;
}

interface Account {
  id: string;
  tier: string;
  account_score: number;
  annual_revenue: number | null;
  owner_id: string | null;
}

function evalAccount(pb: Playbook, acc: Account, usage?: { adoption_score?: number }): { match: boolean; confidence: number; estValue: number } {
  const cfg = pb.trigger_config ?? {};
  let match = false;
  let confidence = 60;
  switch (pb.trigger_type) {
    case "tier": {
      const tiers = (cfg.tiers as string[]) ?? [];
      match = tiers.includes(acc.tier);
      confidence = match ? 75 : 0;
      break;
    }
    case "health_score": {
      const min = (cfg.min_score as number) ?? 70;
      match = acc.account_score >= min;
      confidence = Math.min(95, 50 + Math.floor((acc.account_score - min) / 2));
      break;
    }
    case "usage_threshold": {
      const min = (cfg.min_adoption as number) ?? 60;
      const a = usage?.adoption_score ?? 0;
      match = a >= min;
      confidence = Math.min(95, 50 + Math.floor((a - min) / 2));
      break;
    }
    default:
      match = false;
  }
  const baseValue = (acc.annual_revenue ?? 0) * 0.2;
  return { match, confidence, estValue: Math.round(baseValue) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: pbs } = await supabase.from("expansion_playbooks").select("*").eq("is_active", true);
    const playbooks = (pbs ?? []) as Playbook[];
    if (playbooks.length === 0) {
      return new Response(JSON.stringify({ ok: true, playbooks: 0, opportunities_created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: accs } = await supabase.from("accounts").select("id, tier, account_score, annual_revenue, owner_id");
    const accounts = (accs ?? []) as Account[];

    const { data: usage } = await supabase.from("product_usage_summary").select("account_id, adoption_score");
    const usageMap = new Map((usage ?? []).map((u) => [u.account_id as string, { adoption_score: Number(u.adoption_score ?? 0) }]));

    let created = 0;
    let skipped = 0;
    for (const pb of playbooks) {
      for (const acc of accounts) {
        const r = evalAccount(pb, acc, usageMap.get(acc.id));
        if (!r.match) continue;

        // Dedup: já existe oportunidade ativa deste playbook para esta conta?
        const { data: existing } = await supabase
          .from("expansion_opportunities")
          .select("id")
          .eq("account_id", acc.id)
          .eq("playbook_id", pb.id)
          .in("status", ["identified", "qualified", "proposed"])
          .limit(1);
        if (existing && existing.length > 0) { skipped++; continue; }

        const { error } = await supabase.from("expansion_opportunities").insert({
          account_id: acc.id,
          playbook_id: pb.id,
          type: pb.expansion_type,
          estimated_value: r.estValue,
          status: "identified",
          confidence_score: r.confidence,
          owner_salesperson_id: acc.owner_id,
          notes: pb.recommended_action ?? `Gerado automaticamente pelo playbook "${pb.name}"`,
        });
        if (!error) created++;
      }
    }

    return new Response(JSON.stringify({ ok: true, playbooks: playbooks.length, accounts: accounts.length, opportunities_created: created, skipped_existing: skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
