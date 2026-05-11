import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

interface HealthFactor {
  label: string;
  status: "good" | "warning" | "bad";
  value: string;
}

interface AccountHealth {
  account_id: string;
  account_name: string;
  tier: string;
  health_status: string;
  health_score: number;
  churn_risk: "low" | "medium" | "high" | "critical";
  expansion_potential: number;
  days_since_last_activity: number;
  total_revenue: number;
  recommended_action: string;
  health_factors?: HealthFactor[];
  engagement_radar?: {
    usage: number;
    sentiment: number;
    support: number;
    financial: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: accounts } = await supabase
      .from("accounts")
      .select("id, name, tier, health_status, account_score, annual_revenue, updated_at")
      .order("annual_revenue", { ascending: false, nullsFirst: false })
      .limit(100);

    if (!accounts) {
      return new Response(JSON.stringify({ accounts: [], summary: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    const enriched: AccountHealth[] = await Promise.all(
      accounts.map(async (acc) => {
        const { data: lastActivity } = await supabase
          .from("account_activities")
          .select("occurred_at")
          .eq("account_id", acc.id)
          .order("occurred_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const lastDate = lastActivity?.occurred_at ? new Date(lastActivity.occurred_at).getTime() : new Date(acc.updated_at).getTime();
        const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

        const score = acc.account_score ?? 50;
        let churnRisk: AccountHealth["churn_risk"] = "low";
        if (daysSince > 90 || score < 30) churnRisk = "critical";
        else if (daysSince > 60 || score < 50) churnRisk = "high";
        else if (daysSince > 30 || score < 70) churnRisk = "medium";

        const expansionPotential = Math.max(0, Math.min(100, score - daysSince + (acc.tier === "enterprise" ? 20 : 0)));

        let action = "Manter cadência regular";
        if (churnRisk === "critical") action = "🚨 Reunião executiva urgente — risco de churn";
        else if (churnRisk === "high") action = "📞 Call de retenção esta semana";
        else if (expansionPotential > 70) action = "💎 Apresentar proposta de expansão (upsell)";
        else if (daysSince > 14) action = "✉️ Reengajar com novidades/conteúdo";

        return {
          account_id: acc.id,
          account_name: acc.name,
          tier: acc.tier,
          health_status: acc.health_status,
          health_score: score,
          churn_risk: churnRisk,
          expansion_potential: expansionPotential,
          days_since_last_activity: daysSince,
          total_revenue: acc.annual_revenue ?? 0,
          recommended_action: action,
        };
      })
    );

    const summary = {
      total_accounts: enriched.length,
      at_risk: enriched.filter((a) => a.churn_risk === "high" || a.churn_risk === "critical").length,
      critical: enriched.filter((a) => a.churn_risk === "critical").length,
      expansion_ready: enriched.filter((a) => a.expansion_potential > 70).length,
      total_revenue_at_risk: enriched
        .filter((a) => a.churn_risk === "high" || a.churn_risk === "critical")
        .reduce((sum, a) => sum + a.total_revenue, 0),
      avg_health_score: Math.round(enriched.reduce((s, a) => s + a.health_score, 0) / Math.max(enriched.length, 1)),
    };

    return new Response(JSON.stringify({ accounts: enriched, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
