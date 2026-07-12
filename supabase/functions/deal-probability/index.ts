import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';
import { withRequestId } from "../_shared/request-id.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";


// Base probabilities by stage
const stageProbabilities: Record<string, number> = {
  pending: 10, // Lead
  in_progress: 25, // Qualificado
  proposal: 50, // Proposta
  negotiation: 75, // Negociação
  completed: 100, // Fechado
};

Deno.serve(withRequestId("deal-probability", async (req, _ctx) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { dealIds } = await req.json();

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return new Response(JSON.stringify({ error: 'dealIds array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch deals (chunked to avoid PostgREST URL overflow on large arrays)
    const deals = await chunkedIn<Record<string, unknown>>(
      dealIds,
      (chunk) => supabase.from('sales').select('*').in('id', chunk),
      { label: 'sales fetch' },
    );

    // Fetch historical win/loss data for context
    await chunkedIn<Record<string, unknown>>(
      dealIds,
      (chunk) => supabase.from('deal_outcomes').select('outcome, sale_id').in('sale_id', chunk),
      { label: 'deal_outcomes fetch' },
    );

    // Fetch stage history for velocity analysis
    const stageHistory = await chunkedIn<Record<string, unknown>>(
      dealIds,
      (chunk) =>
        supabase
          .from('deal_stage_history')
          .select('*')
          .in('sale_id', chunk)
          .order('entered_at', { ascending: false }),
      { label: 'deal_stage_history fetch' },
    );



    // Calculate probability for each deal
    const probabilities: Record<string, { probability: number; factors: string[] }> = {};

    for (const raw of deals || []) {
      const deal = raw as { id: string; status: string; amount: number; category: string };

      const factors: string[] = [];
      let probability = stageProbabilities[deal.status] || 10;

      // Factor 1: Time in current stage (deals stuck too long have lower probability)
      const dealHistory = (stageHistory || []).filter(h => h.sale_id === deal.id);
      const currentStageEntry = dealHistory.find(h => !h.exited_at);

      if (currentStageEntry) {
        const daysInStage = Math.floor(
          (Date.now() - new Date(currentStageEntry.entered_at).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysInStage > 14) {
          probability -= 15;
          factors.push('Estagnado há mais de 14 dias');
        } else if (daysInStage > 7) {
          probability -= 5;
          factors.push('7+ dias na etapa atual');
        } else if (daysInStage <= 3) {
          probability += 5;
          factors.push('Deal recente/ativo');
        }
      }

      // Factor 2: Deal value (very high value deals might need more nurturing)
      if (deal.amount > 50000) {
        probability -= 5;
        factors.push('Deal de alto valor');
      } else if (deal.amount > 10000) {
        factors.push('Valor médio-alto');
      } else if (deal.amount < 5000) {
        probability += 5;
        factors.push('Ticket acessível');
      }

      // Factor 3: Category analysis
      if (deal.category === 'subscription') {
        probability += 5;
        factors.push('Modelo recorrente');
      } else if (deal.category === 'one-time') {
        factors.push('Venda única');
      }

      // Factor 4: Stage progression velocity
      if (dealHistory.length > 2) {
        const avgDaysPerStage =
          dealHistory.reduce((acc, h) => {
            if (h.exited_at) {
              const days =
                (new Date(h.exited_at).getTime() - new Date(h.entered_at).getTime()) /
                (1000 * 60 * 60 * 24);
              return acc + days;
            }
            return acc;
          }, 0) /
          (dealHistory.length - 1);

        if (avgDaysPerStage < 5) {
          probability += 10;
          factors.push('Progressão rápida');
        } else if (avgDaysPerStage > 10) {
          probability -= 5;
          factors.push('Ciclo longo');
        }
      }

      // Clamp probability between 5 and 95
      probability = Math.max(5, Math.min(95, probability));

      probabilities[deal.id] = {
        probability: Math.round(probability),
        factors: factors.length > 0 ? factors : ['Análise padrão'],
      };
    }

    console.info(
      'Calculated probabilities for',
      Object.keys(probabilities).length,
      'deals'
    );

    return new Response(JSON.stringify({ probabilities }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error calculating deal probabilities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
