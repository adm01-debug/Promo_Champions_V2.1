import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { leadId, companyName, contactEmail } = await req.json()

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
