import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { validateWebhookPayload, WebhookContracts } from "../_shared/webhook-validator.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";

interface ScoringFactors {
  dealValue: number;
  stageProgress: number;
  timeInPipeline: number;
  category: number;
  recentActivity: number;
}

Deno.serve(withRequestId("lead-scoring", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Contract validation
    const validation = validateWebhookPayload(WebhookContracts.leadScoring, rawBody, "1.0.0");
    if (!validation.success) {
      console.error(`[Contract Violation] Lead scoring failed validation: ${validation.error}`);
      return new Response(
        JSON.stringify({ error: validation.error, contract_version: validation.contract_version }),
        { status: validation.statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { dealIds } = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // PostgREST `?id=in.(...)` has a URL length limit (~8KB gateway cap);
    // chunk dealIds so we never build an oversize URL.
    const DB_CHUNK = 100;
    const chunks: string[][] = [];
    for (let i = 0; i < dealIds.length; i += DB_CHUNK) chunks.push(dealIds.slice(i, i + DB_CHUNK));

    const deals: Record<string, unknown>[] = [];
    const stageHistory: Record<string, unknown>[] = [];
    const tasksSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const tasks: Record<string, unknown>[] = [];

    for (const chunk of chunks) {
      const [dealsRes, historyRes, tasksRes] = await Promise.all([
        supabase.from('sales').select('id, amount, status, category').in('id', chunk),
        supabase.from('deal_stage_history').select('sale_id, entered_at').in('sale_id', chunk).order('entered_at', { ascending: false }).limit(2000),
        supabase.from('tasks').select('sale_id').in('sale_id', chunk).gte('created_at', tasksSince).limit(2000),
      ]);

      if (dealsRes.error) {
        console.error('Error fetching deals chunk:', JSON.stringify(dealsRes.error));
        throw new Error(`sales fetch failed: ${dealsRes.error.message ?? 'unknown'}`);
      }
      if (historyRes.error) {
        console.error('Error fetching stage history chunk:', JSON.stringify(historyRes.error));
        throw new Error(`deal_stage_history fetch failed: ${historyRes.error.message ?? 'unknown'}`);
      }
      if (tasksRes.error) {
        console.error('Error fetching tasks chunk:', JSON.stringify(tasksRes.error));
      }

      if (dealsRes.data) deals.push(...dealsRes.data);
      if (historyRes.data) stageHistory.push(...historyRes.data);
      if (tasksRes.data) tasks.push(...tasksRes.data);
    }



    const scores: Record<string, { score: number; factors: ScoringFactors; labels: Record<string, string> }> = {};

    const stageValues: Record<string, number> = {
      'lead': 10,
      'qualificado': 30,
      'proposta': 50,
      'negociacao': 70,
      'fechado': 100
    };

    const categoryMultipliers: Record<string, number> = {
      'enterprise': 1.3,
      'subscription': 1.1,
      'one-time': 0.9,
      'trial': 0.7
    };

    for (const deal of deals || []) {
      const factors: ScoringFactors = {
        dealValue: 0,
        stageProgress: 0,
        timeInPipeline: 0,
        category: 0,
        recentActivity: 0
      };

      const labels: Record<string, string> = {};

      // 1. Deal Value Score (0-25 points)
      const dealAmount = Number(deal.amount) || 0;
      if (dealAmount >= 50000) {
        factors.dealValue = 25;
        labels.dealValue = 'Valor alto (>50k)';
      } else if (dealAmount >= 20000) {
        factors.dealValue = 20;
        labels.dealValue = 'Valor médio-alto (20-50k)';
      } else if (dealAmount >= 10000) {
        factors.dealValue = 15;
        labels.dealValue = 'Valor médio (10-20k)';
      } else if (dealAmount >= 5000) {
        factors.dealValue = 10;
        labels.dealValue = 'Valor baixo-médio (5-10k)';
      } else {
        factors.dealValue = 5;
        labels.dealValue = 'Valor baixo (<5k)';
      }

      // 2. Stage Progress Score (0-25 points)
      const stageScore = stageValues[deal.status] || 10;
      factors.stageProgress = Math.round(stageScore * 0.25);
      labels.stageProgress = `Etapa: ${deal.status}`;

      // 3. Time in Pipeline Score (0-20 points) - fresher is better
      const dealHistory = stageHistory?.filter(h => h.sale_id === deal.id) || [];
      const firstEntry = dealHistory[dealHistory.length - 1];
      if (firstEntry) {
        const daysInPipeline = Math.floor((Date.now() - new Date(firstEntry.entered_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysInPipeline <= 7) {
          factors.timeInPipeline = 20;
          labels.timeInPipeline = 'Lead recente (≤7 dias)';
        } else if (daysInPipeline <= 14) {
          factors.timeInPipeline = 15;
          labels.timeInPipeline = 'Lead ativo (8-14 dias)';
        } else if (daysInPipeline <= 30) {
          factors.timeInPipeline = 10;
          labels.timeInPipeline = 'Lead em andamento (15-30 dias)';
        } else if (daysInPipeline <= 60) {
          factors.timeInPipeline = 5;
          labels.timeInPipeline = 'Lead antigo (31-60 dias)';
        } else {
          factors.timeInPipeline = 0;
          labels.timeInPipeline = 'Lead estagnado (>60 dias)';
        }
      } else {
        factors.timeInPipeline = 15;
        labels.timeInPipeline = 'Sem histórico de etapas';
      }

      // 4. Category Score (0-15 points)
      const categoryMult = categoryMultipliers[deal.category] || 1;
      factors.category = Math.round(15 * categoryMult / 1.3);
      labels.category = `Categoria: ${deal.category}`;

      // 5. Recent Activity Score (0-15 points)
      const dealTasks = tasks?.filter(t => t.sale_id === deal.id) || [];
      const recentTasksCount = dealTasks.length;
      if (recentTasksCount >= 5) {
        factors.recentActivity = 15;
        labels.recentActivity = 'Alta atividade (5+ tarefas)';
      } else if (recentTasksCount >= 3) {
        factors.recentActivity = 12;
        labels.recentActivity = 'Boa atividade (3-4 tarefas)';
      } else if (recentTasksCount >= 1) {
        factors.recentActivity = 8;
        labels.recentActivity = 'Alguma atividade (1-2 tarefas)';
      } else {
        factors.recentActivity = 3;
        labels.recentActivity = 'Sem atividade recente';
      }

      // Calculate total score
      const totalScore = factors.dealValue + factors.stageProgress + factors.timeInPipeline + factors.category + factors.recentActivity;

      scores[deal.id] = {
        score: Math.min(100, totalScore),
        factors,
        labels
      };
    }

    // Bulk upsert scores in a single round-trip (avoids N sequential writes / timeouts)
    const nowIso = new Date().toISOString();
    const upsertRows = Object.entries(scores).map(([sale_id, s]) => ({
      sale_id,
      score: s.score,
      factors: { ...s.factors, labels: s.labels },
      calculated_at: nowIso,
    }));

    if (upsertRows.length > 0) {
      const { error: upsertError } = await supabase
        .from('lead_scores')
        .upsert(upsertRows, { onConflict: 'sale_id' });

      if (upsertError) {
        console.error('Bulk upsert error:', JSON.stringify(upsertError));
      }
    }

    console.info(`Calculated scores for ${Object.keys(scores).length} deals`);

    return new Response(
      JSON.stringify({ scores }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : String(error);
    console.error('Error in lead-scoring function:', message, error);
    return new Response(
      JSON.stringify({ error: message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}));

