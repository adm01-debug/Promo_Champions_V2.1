import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { salespersonId } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch salesperson data
    const { data: salesperson } = await supabase
      .from('salespeople')
      .select('*')
      .eq('id', salespersonId)
      .single();

    // Fetch salesperson's deals in pipeline (not completed)
    const { data: deals } = await supabase
      .from('sales')
      .select('*')
      .eq('salesperson_id', salespersonId)
      .neq('status', 'completed')
      .order('updated_at', { ascending: true })
      .limit(20);

    // Fetch pending tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('salesperson_id', salespersonId)
      .neq('status', 'completed')
      .neq('status', 'cancelled')
      .order('due_date', { ascending: true })
      .limit(10);

    // Fetch recent win/loss outcomes
    const { data: outcomes } = await supabase
      .from('deal_outcomes')
      .select('*')
      .eq('salesperson_id', salespersonId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch sales goals
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const { data: goal } = await supabase
      .from('sales_goals')
      .select('*')
      .eq('salesperson_id', salespersonId)
      .eq('month', currentMonth)
      .maybeSingle();

    // Calculate current month sales
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlySales } = await supabase
      .from('sales')
      .select('amount')
      .eq('salesperson_id', salespersonId)
      .eq('status', 'completed')
      .gte('updated_at', startOfMonth.toISOString());

    const totalSales = monthlySales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
    const goalProgress = goal ? (totalSales / Number(goal.goal_amount)) * 100 : 0;

    // Build context for AI
    const context = {
      salesperson: salesperson?.name || 'Vendedor',
      goalProgress: goalProgress.toFixed(1),
      totalDeals: deals?.length || 0,
      pendingTasks: tasks?.length || 0,
      deals: deals?.map(d => ({
        client: d.client_name,
        product: d.product_name,
        value: d.amount,
        status: d.status,
        daysSinceUpdate: Math.floor((Date.now() - new Date(d.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      })) || [],
      recentOutcomes: outcomes?.map(o => ({
        outcome: o.outcome,
        reason: o.reason
      })) || [],
      upcomingTasks: tasks?.slice(0, 5).map(t => ({
        title: t.title,
        type: t.task_type,
        priority: t.priority,
        dueDate: t.due_date
      })) || []
    };

    const systemPrompt = `Você é um especialista em vendas B2B e coaching de vendedores. Analise os dados do vendedor e sugira as 3 melhores próximas ações para maximizar resultados.

REGRAS:
- Seja específico e acionável
- Priorize deals com maior valor ou mais estagnados
- Considere o progresso da meta
- Sugira ações que podem ser feitas HOJE
- Use português brasileiro
- Cada sugestão deve ter título curto, descrição detalhada e prioridade (alta/média/baixa)

Responda APENAS em JSON válido no formato:
{
  "suggestions": [
    {
      "title": "Título curto da ação",
      "description": "Descrição detalhada do que fazer e por quê",
      "priority": "high|medium|low",
      "dealClient": "Nome do cliente se aplicável ou null",
      "actionType": "call|meeting|email|follow_up|proposal|other"
    }
  ],
  "insight": "Uma frase de insight sobre a situação geral do vendedor"
}`;

    const userPrompt = `Dados do vendedor ${context.salesperson}:

PROGRESSO DA META: ${context.goalProgress}% da meta mensal atingida
DEALS NO PIPELINE: ${context.totalDeals} oportunidades ativas
TAREFAS PENDENTES: ${context.pendingTasks}

DEALS ATIVOS:
${context.deals.map(d => `- ${d.client}: ${d.product} (R$ ${Number(d.value).toLocaleString('pt-BR')}) - Status: ${d.status} - ${d.daysSinceUpdate} dias sem atualização`).join('\n')}

RESULTADOS RECENTES:
${context.recentOutcomes.map(o => `- ${o.outcome === 'won' ? 'GANHO' : 'PERDIDO'}: ${o.reason}`).join('\n') || 'Nenhum resultado recente'}

PRÓXIMAS TAREFAS:
${context.upcomingTasks.map(t => `- [${t.priority}] ${t.title} (${t.type}) - ${t.dueDate}`).join('\n') || 'Nenhuma tarefa agendada'}

Sugira as 3 melhores próximas ações para este vendedor.`;

    console.log('Calling Lovable AI for next best actions...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || '';
    
    console.log('AI Response:', content);

    // Parse JSON from response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      result = JSON.parse(jsonMatch[1].trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      result = {
        suggestions: [
          {
            title: 'Revisar pipeline',
            description: 'Analise seus deals ativos e identifique oportunidades de avanço.',
            priority: 'medium',
            dealClient: null,
            actionType: 'other'
          }
        ],
        insight: 'Continue trabalhando seus deals para atingir a meta.'
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in next-best-action:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
