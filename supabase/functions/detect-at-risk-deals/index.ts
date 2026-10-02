import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { fetchWithTimeout } from '../_shared/fetch-with-timeout.ts';
import { LOVABLE_AI_CHAT_COMPLETIONS_URL } from '../_shared/ai-gateway.ts';
import { getUserClient, UnauthorizedError } from '../_shared/auth-client.ts';

Deno.serve(
  withRequestId('detect-at-risk-deals', async (req, _ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { dealId } = await req.json();

      if (!dealId) {
        return new Response(JSON.stringify({ error: 'dealId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

      // Análise read-only de um deal: o client do usuário aplica RLS, então o
      // chamador só analisa deals que ele pode ver.
      const supabase = (await getUserClient(req)).client;

      // Fetch deal data
      const { data: deal, error: dealError } = await supabase
        .from('sales')
        .select(
          `
        *,
        salespeople (name, role)
      `
        )
        .eq('id', dealId)
        .single();

      if (dealError || !deal) {
        console.error('Deal not found:', dealError);
        return new Response(JSON.stringify({ error: 'Deal not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch activities for this deal
      const { data: activities } = await supabase
        .from('activities')
        .select('id, created_at, activity_type, outcome')
        .eq('sale_id', dealId)
        .order('created_at', { ascending: false })
        .limit(500);

      // Fetch deal stage history
      const { data: stageHistory } = await supabase
        .from('deal_stage_history')
        .select('stage, entered_at, exited_at')
        .eq('sale_id', dealId)
        .order('entered_at', { ascending: true })
        .limit(100);

      // Calculate metrics
      const now = new Date();
      const createdAt = new Date(deal.created_at);
      const updatedAt = new Date(deal.updated_at);
      const daysSinceCreation = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysSinceLastUpdate = Math.floor(
        (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const lastActivity = activities?.[0];
      const hoursSinceLastActivity = lastActivity
        ? Math.floor(
            (now.getTime() - new Date(lastActivity.created_at).getTime()) /
              (1000 * 60 * 60)
          )
        : daysSinceCreation * 24;

      // Activity distribution
      const activityTypes =
        activities?.reduce((acc: Record<string, number>, a) => {
          acc[a.activity_type] = (acc[a.activity_type] || 0) + 1;
          return acc;
        }, {}) || {};

      const context = {
        deal: {
          clientName: deal.client_name,
          productName: deal.product_name,
          amount: deal.amount,
          status: deal.status,
          category: deal.category,
          source: deal.source,
          daysSinceCreation,
          daysSinceLastUpdate,
        },
        salesperson: deal.salespeople,
        activities: {
          total: activities?.length || 0,
          hoursSinceLastActivity,
          distribution: activityTypes,
          lastOutcome: lastActivity?.outcome,
        },
        stageHistory: stageHistory?.map(h => ({
          stage: h.stage,
          daysInStage: h.exited_at
            ? Math.floor(
                (new Date(h.exited_at).getTime() - new Date(h.entered_at).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : Math.floor(
                (now.getTime() - new Date(h.entered_at).getTime()) / (1000 * 60 * 60 * 24)
              ),
        })),
      };

      const systemPrompt = `Você é um especialista em análise de vendas B2B. Analise o deal abaixo e identifique riscos de perda.
    
Considere:
- Tempo sem atividade (mais de 48h é preocupante)
- Tempo no mesmo estágio (mais de 7 dias sem progresso)
- Volume de atividades vs valor do deal
- Padrão de outcomes das atividades
- Velocidade de progressão no funil

Responda em JSON com exatamente esta estrutura:
{
  "riskLevel": "low" | "medium" | "high" | "critical",
  "analysis": "Análise detalhada da situação do deal em 2-3 frases",
  "mainRisks": ["risco 1", "risco 2", ...],
  "recommendations": ["ação recomendada 1", "ação recomendada 2", ...]
}`;

      const userPrompt = `Analise este deal em risco:
${JSON.stringify(context, null, 2)}`;

      // Call AI for analysis
      const aiResponse = await fetchWithTimeout(LOVABLE_AI_CHAT_COMPLETIONS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI API error:', aiResponse.status, errorText);

        if (aiResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        if (aiResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
            {
              status: 402,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;

      let result;
      try {
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (_error) {
        console.error('Failed to parse AI response:', content);
        // Fallback response
        result = {
          riskLevel: hoursSinceLastActivity > 72 ? 'high' : 'medium',
          analysis: `Deal com ${activities?.length || 0} atividades. Última interação há ${hoursSinceLastActivity} horas.`,
          mainRisks: hoursSinceLastActivity > 48 ? ['Tempo elevado sem contato'] : [],
          recommendations: [
            'Agendar follow-up imediato',
            'Verificar interesse do cliente',
          ],
        };
      }

      console.info('AI analysis result:', result);

      return new Response(
        JSON.stringify({
          dealId,
          ...result,
          context: {
            hoursSinceLastActivity,
            daysSinceLastUpdate,
            activityCount: activities?.length || 0,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.error('Error in detect-at-risk-deals:', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  })
);
