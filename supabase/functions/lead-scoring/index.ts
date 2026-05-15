import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { validateArray, collectErrors, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ScoringFactors {
  dealValue: number;
  stageProgress: number;
  timeInPipeline: number;
  category: number;
  recentActivity: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealIds } = await req.json();
    
    const errors = collectErrors([
      validateArray(dealIds, "dealIds", { required: true, maxLength: 500 }),
    ]);

    if (errors.length > 0) {
      return validationErrorResponse(errors, corsHeaders);
    }

    if (!Array.isArray(dealIds) || dealIds.length === 0) {
      return validationErrorResponse([{ field: "dealIds", message: "O array dealIds não pode estar vazio" }], corsHeaders);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch deals data
    const { data: deals, error: dealsError } = await supabase
      .from('sales')
      .select('*')
      .in('id', dealIds);

    if (dealsError) {
      console.error('Error fetching deals:', dealsError);
      throw dealsError;
    }

    // Fetch stage history for time analysis
    const { data: stageHistory, error: historyError } = await supabase
      .from('deal_stage_history')
      .select('*')
      .in('sale_id', dealIds)
      .order('entered_at', { ascending: false });

    if (historyError) {
      console.error('Error fetching stage history:', historyError);
      throw historyError;
    }

    // Fetch tasks for activity analysis
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('sale_id', dealIds)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
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

      // Upsert score to database
      const { error: upsertError } = await supabase
        .from('lead_scores')
        .upsert({
          sale_id: deal.id,
          score: Math.min(100, totalScore),
          factors: { ...factors, labels },
          calculated_at: new Date().toISOString()
        }, { onConflict: 'sale_id' });

      if (upsertError) {
        console.error('Error upserting score:', upsertError);
      }
    }

    console.info(`Calculated scores for ${Object.keys(scores).length} deals`);

    return new Response(
      JSON.stringify({ scores }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lead-scoring function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
