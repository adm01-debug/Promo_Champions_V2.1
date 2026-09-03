import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { getUserClient, getServiceClient, UnauthorizedError } from "../_shared/auth-client.ts";

Deno.serve(withRequestId("enrich-lead", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // ── Authentication ────────────────────────────────────────────────────
  // Require a valid user JWT. The authenticated user's RLS context is used
  // to scope the clients update — preventing IDOR writes to arbitrary lead IDs.
  let callerUserId: string;
  try {
    const ctx = await getUserClient(req);
    callerUserId = ctx.userId;
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: " + e.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    throw e;
  }

  try {
    const { leadId, companyName, contactEmail } = await req.json()

    if (!leadId || typeof leadId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'leadId is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Simular enriquecimento de empresa (Company Intelligence)
    const companyEnrichment = {
      company_name: companyName || 'Unknown Company',
      domain: contactEmail ? contactEmail.split('@')[1] : null,
      headcount_range: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001+"][Math.floor(Math.random() * 6)],
      estimated_annual_revenue: `$${Math.floor(Math.random() * 100)}M`,
      funding_stage: ["Seed", "Series A", "Series B", "Series C", "IPO"][Math.floor(Math.random() * 5)],
      total_funding: `$${Math.floor(Math.random() * 50)}M`,
      tech_stack: ["React", "Salesforce", "AWS", "HubSpot", "Slack", "PostgreSQL", "Next.js"].filter(() => Math.random() > 0.5),
      industry: ["Technology", "Retail", "Manufacturing", "Finance", "Healthcare"][Math.floor(Math.random() * 5)],
      hq_location: "São Paulo, Brazil",
      linkedin_url: `https://linkedin.com/company/${companyName?.toLowerCase().replace(/\s/g, '-') || 'prospect'}`,
      last_enriched_at: new Date().toISOString()
    }

    // 2. Simular inteligência de pessoa (People Intelligence)
    const personEnrichment = {
      email: contactEmail,
      full_name: "Lead Name",
      current_title: "CEO",
      linkedin_url: `https://linkedin.com/in/${contactEmail?.split('@')[0] || 'profile'}`,
      last_verified_at: new Date().toISOString()
    }

    // Service client needed for enriched_company_intelligence and buying_signals
    // tables that RLS may not allow the user to write directly.
    const supabase = getServiceClient("enrichment writes to company/person intelligence tables and buying_signals");

    // ── Verify caller can access this lead before enriching it ────────
    // Read the client row using service client but check salesperson ownership.
    // This ensures the caller can only enrich leads they're associated with.
    const { data: leadRow, error: leadReadErr } = await supabase
      .from('clients')
      .select('id, salesperson_id, created_by')
      .eq('id', leadId)
      .maybeSingle();

    if (leadReadErr || !leadRow) {
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Access check: caller must be the assigned salesperson or creator.
    // Admin/manager bypass via RLS is NOT applied here to keep it conservative.
    if (
      leadRow.salesperson_id !== callerUserId &&
      leadRow.created_by !== callerUserId
    ) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: you do not have access to this lead' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inserir ou atualizar inteligência de empresa
    const { data: companyData, error: companyError } = await supabase
      .from('enriched_company_intelligence')
      .upsert(companyEnrichment, { onConflict: 'company_name' })
      .select('id')
      .single()

    if (companyError) throw companyError

    // Inserir ou atualizar inteligência de pessoa
    const { error: personError } = await supabase
      .from('person_intelligence')
      .upsert(personEnrichment, { onConflict: 'email' })

    if (personError) throw personError

    // Atualizar o lead original
    const { error: leadUpdateError } = await supabase
      .from('clients')
      .update({
        email_verified: true,
        phone_verified: Math.random() > 0.3,
        last_enrichment_id: companyData.id
      })
      .eq('id', leadId)

    if (leadUpdateError) throw leadUpdateError

    // Gerar um sinal de compra aleatório (Buying Signal)
    if (Math.random() > 0.5) {
      await supabase.from('buying_signals').insert({
        company_id: companyData.id,
        signal_type: ['hiring', 'funding', 'news', 'expansion'][Math.floor(Math.random() * 4)],
        signal_description: "Detectado novo sinal de crescimento no mercado.",
        significance_score: Math.floor(Math.random() * 100)
      })
    }

    return new Response(JSON.stringify({ success: true, company: companyEnrichment, person: personEnrichment }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}))
