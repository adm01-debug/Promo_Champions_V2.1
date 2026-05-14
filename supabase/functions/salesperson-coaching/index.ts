import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";



serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { salespersonId } = await req.json();

    if (!salespersonId) {
      return new Response(
        JSON.stringify({ error: 'salespersonId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch salesperson info
    const { data: salesperson } = await supabase
      .from('salespeople')
      .select('*')
      .eq('id', salespersonId)
      .single();

    if (!salesperson) {
      return new Response(
        JSON.stringify({ error: 'Salesperson not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch win/loss data for this salesperson (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: outcomes } = await supabase
      .from('deal_outcomes')
      .select(`
        *,
        sales:sale_id (product_name, amount, client_name)
      `)
      .eq('salesperson_id', salespersonId)
      .gte('created_at', ninetyDaysAgo.toISOString());

    // Fetch team average for comparison
    const { data: teamOutcomes } = await supabase
      .from('deal_outcomes')
      .select('outcome, reason')
      .gte('created_at', ninetyDaysAgo.toISOString());

    // Calculate metrics
    const wins = outcomes?.filter(o => o.outcome === 'won') || [];
    const losses = outcomes?.filter(o => o.outcome === 'lost') || [];
    const totalDeals = wins.length + losses.length;
    const winRate = totalDeals > 0 ? (wins.length / totalDeals) * 100 : 0;

    // Count loss reasons
    const lossReasons: Record<string, number> = {};
    losses.forEach(l => {
      lossReasons[l.reason] = (lossReasons[l.reason] || 0) + 1;
    });

    // Count win reasons
    const winReasons: Record<string, number> = {};
    wins.forEach(w => {
      winReasons[w.reason] = (winReasons[w.reason] || 0) + 1;
    });

    // Team metrics
    const teamWins = teamOutcomes?.filter(o => o.outcome === 'won') || [];
    const teamTotal = teamOutcomes?.length || 1;
    const teamWinRate = (teamWins.length / teamTotal) * 100;

    // Team loss reasons
    const teamLossReasons: Record<string, number> = {};
    teamOutcomes?.filter(o => o.outcome === 'lost').forEach(l => {
      teamLossReasons[l.reason] = (teamLossReasons[l.reason] || 0) + 1;
    });

    // Prepare context for AI
    const context = {
      salesperson: salesperson.name,
      period: 'últimos 90 dias',
      totalDeals,
      wins: wins.length,
      losses: losses.length,
      winRate: winRate.toFixed(1),
      teamWinRate: teamWinRate.toFixed(1),
      topLossReasons: Object.entries(lossReasons)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([reason, count]) => ({ reason, count, percentage: ((count / losses.length) * 100).toFixed(1) })),
      topWinReasons: Object.entries(winReasons)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([reason, count]) => ({ reason, count, percentage: ((count / wins.length) * 100).toFixed(1) })),
      comparisonToTeam: winRate - teamWinRate,
      avgDealValue: wins.length > 0 
        ? wins.reduce((sum, w) => sum + (Number((w.sales as any)?.amount) || 0), 0) / wins.length 
        : 0
    };

    console.info('Coaching context:', JSON.stringify(context, null, 2));

    // Call AI for coaching insights
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Você é um coach de vendas experiente especializado em times de SDR e Closers. 
Analise os dados de performance do vendedor e forneça coaching personalizado.

REGRAS:
- Seja direto e acionável
- Foque em 3-4 pontos principais
- Use dados específicos para embasar suas sugestões
- Inclua pelo menos 1 elogio se houver pontos positivos
- Sugira ações concretas que podem ser implementadas imediatamente
- Responda SEMPRE em português brasileiro`;

    const userPrompt = `Analise os dados de ${context.salesperson} e forneça coaching personalizado:

MÉTRICAS (${context.period}):
- Total de negociações: ${context.totalDeals}
- Vitórias: ${context.wins} | Derrotas: ${context.losses}
- Taxa de conversão: ${context.winRate}%
- Taxa média da equipe: ${context.teamWinRate}%
- Diferença vs equipe: ${context.comparisonToTeam > 0 ? '+' : ''}${context.comparisonToTeam.toFixed(1)}%
- Ticket médio em vitórias: R$ ${context.avgDealValue.toFixed(2)}

PRINCIPAIS MOTIVOS DE PERDA:
${context.topLossReasons.map(r => `- ${r.reason}: ${r.count}x (${r.percentage}%)`).join('\n') || 'Nenhum dado disponível'}

PRINCIPAIS MOTIVOS DE VITÓRIA:
${context.topWinReasons.map(r => `- ${r.reason}: ${r.count}x (${r.percentage}%)`).join('\n') || 'Nenhum dado disponível'}

Forneça coaching estruturado com: pontos fortes, áreas de melhoria e ações recomendadas.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_coaching',
              description: 'Fornecer coaching estruturado para o vendedor',
              parameters: {
                type: 'object',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'Resumo geral da performance em 1-2 frases'
                  },
                  strengths: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        description: { type: 'string' }
                      },
                      required: ['title', 'description']
                    },
                    description: 'Pontos fortes identificados (1-3 itens)'
                  },
                  improvements: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        priority: { type: 'string', enum: ['alta', 'média', 'baixa'] }
                      },
                      required: ['title', 'description', 'priority']
                    },
                    description: 'Áreas de melhoria (2-4 itens)'
                  },
                  actions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        action: { type: 'string' },
                        timeline: { type: 'string' },
                        expectedImpact: { type: 'string' }
                      },
                      required: ['action', 'timeline', 'expectedImpact']
                    },
                    description: 'Ações recomendadas específicas (2-4 itens)'
                  }
                },
                required: ['summary', 'strengths', 'improvements', 'actions']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_coaching' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response structure');
    }

    const coaching = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        salesperson: {
          id: salesperson.id,
          name: salesperson.name,
          avatar_url: salesperson.avatar_url
        },
        metrics: {
          totalDeals: context.totalDeals,
          wins: context.wins,
          losses: context.losses,
          winRate: parseFloat(context.winRate),
          teamWinRate: parseFloat(context.teamWinRate),
          comparisonToTeam: context.comparisonToTeam,
          avgDealValue: context.avgDealValue,
          topLossReasons: context.topLossReasons,
          topWinReasons: context.topWinReasons
        },
        coaching,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Coaching error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate coaching';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
