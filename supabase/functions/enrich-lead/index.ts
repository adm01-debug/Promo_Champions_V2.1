import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { leadId, companyName, contactEmail } = await req.json()

    // Simulate enrichment logic
    // In a real scenario, this would call Clearbit, Apollo, Hunter, etc.
    const enrichedData = {
      linkedin_url: `https://linkedin.com/company/${companyName?.toLowerCase().replace(/\s/g, '-') || 'prospect'}`,
      company_size: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001+"][Math.floor(Math.random() * 6)],
      estimated_revenue: `$${Math.floor(Math.random() * 100)}M`,
      industry: ["Technology", "Retail", "Manufacturing", "Finance", "Healthcare"][Math.floor(Math.random() * 5)],
      tech_stack: ["React", "Salesforce", "AWS", "HubSpot", "Slack"].filter(() => Math.random() > 0.5),
      enriched_at: new Date().toISOString()
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase.rpc('enrich_lead_data', {
      lead_id: leadId,
      new_data: enrichedData
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data: enrichedData }), {
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
