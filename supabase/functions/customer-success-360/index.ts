import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";

Deno.serve(withRequestId("customer-success-360", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Autorização: exige usuário autenticado com papel admin/manager (dashboard agrega dados de todas as contas).
    try {
      const caller = await getUserClient(req);
      const { data: allowed, error: roleError } = await caller.client.rpc(
        "is_admin_or_manager" as never,
        { _user_id: caller.userId } as never
      );
      if (roleError) throw roleError;
      if (!allowed) {
        return new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("customer-success-360 authorization failed:", error);
      return new Response(JSON.stringify({ error: "authorization_unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [
      accountsRes,
      ticketsRes,
      renewalsRes,
      usageRes,
      onboardingRes,
      expansionRes,
      surveysRes,
      qbrRes,
      ordersRes,
    ] = await Promise.all([
      supabase.from("accounts").select("id, name, tier, health_status, account_score, annual_revenue, created_at").order("annual_revenue", { ascending: false, nullsFirst: false }).limit(100),
      supabase.from("support_tickets").select("id, account_id, subject, status, priority, sentiment, created_at, resolved_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("renewals").select("id, account_id, contract_value, renewal_date, status, owner_salesperson_id, auto_renew").order("renewal_date", { ascending: true }).limit(200),
      supabase.from("product_usage_summary").select("account_id, dau, wau, mau, last_login_at, top_features, adoption_score").limit(500),
      supabase.from("onboarding_journeys").select("id, account_id, status, current_step, total_steps, started_at, completed_at, owner_salesperson_id").order("created_at", { ascending: false }).limit(200),
      supabase.from("expansion_opportunities").select("id, account_id, type, estimated_value, status, confidence_score, owner_salesperson_id, created_at").order("estimated_value", { ascending: false }).limit(200),
      supabase.from("csat_ces_surveys").select("id, account_id, survey_type, score, comment, sent_at, responded_at").order("sent_at", { ascending: false }).limit(500),
      supabase.from("qbr_schedule").select("id, account_id, frequency, next_qbr_at, last_qbr_at, owner_salesperson_id, is_active").eq("is_active", true).order("next_qbr_at", { ascending: true }).limit(200),
      supabase.from("orders").select("id, user_id, client_id, quote_id, order_number, status, total, created_at, cancellation_reason").order("created_at", { ascending: false }).limit(500),
    ]);

    const accounts = accountsRes.data ?? [];
    const tickets = ticketsRes.data ?? [];
    const renewals = renewalsRes.data ?? [];
    const usage = usageRes.data ?? [];
    const onboarding = onboardingRes.data ?? [];
    const expansion = expansionRes.data ?? [];
    const surveys = surveysRes.data ?? [];
    const qbrs = qbrRes.data ?? [];
    // Resolve o account_id real de cada pedido. A cadeia de chaves do schema
    // é orders.quote_id → quotes.sale_id → sales.account_id; quando o pedido
    // não veio de cotação, cai no fallback orders.client_id → clients cujo
    // name/company casa com accounts.name (mesma regra do trigger
    // auto_link_sale_to_account). user_id NÃO é chave de conta — é o
    // comprador autenticado — e mapeá-lo como conta exibia o cliente errado.
    const rawOrders = ordersRes.data ?? [];
    const quoteIds = [
      ...new Set(rawOrders.map((o) => o.quote_id).filter((v): v is string => !!v)),
    ];
    const orderQuotes = await chunkedIn<{ id: string; sale_id: string | null; client_id: string | null }>(
      quoteIds,
      (chunk) =>
        supabase.from("quotes").select("id, sale_id, client_id").in("id", chunk),
      { maxConcurrency: 4, label: "cs360-quotes" },
    );
    const quoteById = new Map(orderQuotes.map((q) => [q.id, q]));
    const saleIds = [
      ...new Set(orderQuotes.map((q) => q.sale_id).filter((v): v is string => !!v)),
    ];
    const orderSales = await chunkedIn<{ id: string; account_id: string | null }>(
      saleIds,
      (chunk) => supabase.from("sales").select("id, account_id").in("id", chunk),
      { maxConcurrency: 4, label: "cs360-sales" },
    );
    const accountIdBySaleId = new Map(
      orderSales.map((s) => [s.id, s.account_id] as const),
    );
    const clientIds = [
      ...new Set(
        [...rawOrders.map((o) => o.client_id), ...orderQuotes.map((q) => q.client_id)]
          .filter((v): v is string => !!v),
      ),
    ];
    const orderClients = await chunkedIn<{ id: string; name: string; company: string | null }>(
      clientIds,
      (chunk) => supabase.from("clients").select("id, name, company").in("id", chunk),
      { maxConcurrency: 4, label: "cs360-clients" },
    );
    const clientById = new Map(orderClients.map((c) => [c.id, c]));
    // O mapa de fallback por nome NÃO usa a lista `accounts` (limitada ao
    // top-100 por receita): uma conta fora do top-100 com nome correspondente
    // continuaria resolvendo para null. Busca separada, sem limite.
    const { data: allAccountNames } = await supabase
      .from("accounts")
      .select("id, name");
    const accountIdByName = new Map(
      (allAccountNames ?? []).map(
        (a: { id: string; name: string }) =>
          [a.name.trim().toLowerCase(), a.id] as const,
      ),
    );
    const orders = rawOrders.map((o) => {
      const quote = o.quote_id ? quoteById.get(o.quote_id) : undefined;
      const client = clientById.get(o.client_id ?? quote?.client_id ?? "");
      const accountId =
        (quote?.sale_id ? accountIdBySaleId.get(quote.sale_id) : undefined) ??
        (client
          ? accountIdByName.get(client.company?.trim().toLowerCase() ?? "") ??
            accountIdByName.get(client.name.trim().toLowerCase())
          : undefined) ??
        null;
      return { ...o, account_id: accountId, client_name: client?.name ?? null };
    });

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
        orders,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("customer-success-360 error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
