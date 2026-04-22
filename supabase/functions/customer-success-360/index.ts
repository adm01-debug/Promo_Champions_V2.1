import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const [
      accountsRes,
      ticketsRes,
      renewalsRes,
      usageRes,
      onboardingRes,
      expansionRes,
      surveysRes,
      qbrRes,
    ] = await Promise.all([
      supabase.from("accounts").select("id, name, tier, health_status, account_score, annual_revenue").order("annual_revenue", { ascending: false, nullsFirst: false }).limit(100),
      supabase.from("support_tickets").select("id, account_id, subject, status, priority, sentiment, created_at, resolved_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("renewals").select("id, account_id, contract_value, renewal_date, status, owner_salesperson_id, auto_renew").order("renewal_date", { ascending: true }).limit(200),
      supabase.from("product_usage_summary").select("account_id, dau, wau, mau, last_login_at, top_features, adoption_score").limit(500),
      supabase.from("onboarding_journeys").select("id, account_id, status, current_step, total_steps, started_at, completed_at, owner_salesperson_id").order("created_at", { ascending: false }).limit(200),
      supabase.from("expansion_opportunities").select("id, account_id, type, estimated_value, status, confidence_score, owner_salesperson_id, created_at").order("estimated_value", { ascending: false }).limit(200),
      supabase.from("csat_ces_surveys").select("id, account_id, survey_type, score, comment, sent_at, responded_at").order("sent_at", { ascending: false }).limit(500),
      supabase.from("qbr_schedule").select("id, account_id, frequency, next_qbr_at, last_qbr_at, owner_salesperson_id, is_active").eq("is_active", true).order("next_qbr_at", { ascending: true }).limit(200),
    ]);

    const accounts = accountsRes.data ?? [];
    const tickets = ticketsRes.data ?? [];
    const renewals = renewalsRes.data ?? [];
    const usage = usageRes.data ?? [];
    const onboarding = onboardingRes.data ?? [];
    const expansion = expansionRes.data ?? [];
    const surveys = surveysRes.data ?? [];
    const qbrs = qbrRes.data ?? [];

    const now = Date.now();
    const openTickets = tickets.filter((t) => t.status === "open" || t.status === "pending");
    const urgentTickets = openTickets.filter((t) => t.priority === "urgent");

    const renewals90 = renewals.filter((r) => {
      if (!r.renewal_date) return false;
      const days = Math.floor((new Date(r.renewal_date).getTime() - now) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 90 && r.status === "upcoming";
    });
    const renewals30 = renewals90.filter((r) => {
      const days = Math.floor((new Date(r.renewal_date).getTime() - now) / (1000 * 60 * 60 * 24));
      return days <= 30;
    });
    const atRiskRenewals = renewals.filter((r) => r.status === "at_risk");
    const renewalsAtRiskValue = atRiskRenewals.reduce((s, r) => s + Number(r.contract_value ?? 0), 0);

    const csatResponded = surveys.filter((s) => s.survey_type === "csat" && s.score !== null);
    const cesResponded = surveys.filter((s) => s.survey_type === "ces" && s.score !== null);
    const avgCSAT = csatResponded.length > 0 ? csatResponded.reduce((s, x) => s + (x.score ?? 0), 0) / csatResponded.length : 0;
    const avgCES = cesResponded.length > 0 ? cesResponded.reduce((s, x) => s + (x.score ?? 0), 0) / cesResponded.length : 0;

    const onboardingActive = onboarding.filter((o) => o.status === "in_progress" || o.status === "stalled");
    const onboardingStalled = onboarding.filter((o) => o.status === "stalled");
    const onboardingCompleted = onboarding.filter((o) => o.status === "completed");

    const expansionPipelineValue = expansion
      .filter((e) => e.status === "identified" || e.status === "qualified" || e.status === "proposed")
      .reduce((s, e) => s + Number(e.estimated_value ?? 0), 0);

    const accountHealthMap = new Map<string, number>();
    for (const acc of accounts) {
      const accTickets = openTickets.filter((t) => t.account_id === acc.id).length;
      const accUsage = usage.find((u) => u.account_id === acc.id)?.adoption_score ?? 50;
      const accRenewal = renewals.find((r) => r.account_id === acc.id);
      let renewalFactor = 70;
      if (accRenewal) {
        if (accRenewal.status === "at_risk") renewalFactor = 30;
        else if (accRenewal.status === "churned") renewalFactor = 0;
        else {
          const days = Math.floor((new Date(accRenewal.renewal_date).getTime() - now) / (1000 * 60 * 60 * 24));
          renewalFactor = days < 30 ? 50 : days < 60 ? 65 : 80;
        }
      }
      const ticketFactor = Math.max(0, 100 - accTickets * 8);
      const score = Math.round(ticketFactor * 0.25 + accUsage * 0.35 + renewalFactor * 0.4);
      accountHealthMap.set(acc.id, score);
    }
    const accountsWithHealth = accounts.map((a) => ({
      ...a,
      health_v2: accountHealthMap.get(a.id) ?? 50,
      open_tickets: openTickets.filter((t) => t.account_id === a.id).length,
      adoption_score: usage.find((u) => u.account_id === a.id)?.adoption_score ?? null,
      next_renewal: renewals.find((r) => r.account_id === a.id)?.renewal_date ?? null,
    }));

    const upcomingQBRs = qbrs.filter((q) => q.next_qbr_at && new Date(q.next_qbr_at).getTime() <= now + 30 * 86400000).length;

    const summary = {
      total_accounts: accounts.length,
      avg_health_v2: accountsWithHealth.length > 0 ? Math.round(accountsWithHealth.reduce((s, a) => s + a.health_v2, 0) / accountsWithHealth.length) : 0,
      open_tickets: openTickets.length,
      urgent_tickets: urgentTickets.length,
      renewals_90d: renewals90.length,
      renewals_30d: renewals30.length,
      renewals_at_risk: atRiskRenewals.length,
      renewals_at_risk_value: renewalsAtRiskValue,
      avg_csat: Math.round(avgCSAT * 10) / 10,
      avg_ces: Math.round(avgCES * 10) / 10,
      onboarding_active: onboardingActive.length,
      onboarding_stalled: onboardingStalled.length,
      onboarding_completed: onboardingCompleted.length,
      expansion_opportunities: expansion.length,
      expansion_pipeline_value: expansionPipelineValue,
      upcoming_qbrs_30d: upcomingQBRs,
    };

    return new Response(
      JSON.stringify({
        summary,
        accounts: accountsWithHealth,
        tickets: openTickets.slice(0, 50),
        renewals: renewals.slice(0, 50),
        usage,
        onboarding,
        expansion,
        surveys: surveys.slice(0, 100),
        qbrs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
