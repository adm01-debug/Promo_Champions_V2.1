import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import {
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
  validateWebhookPayload,
  WebhookContracts,
} from '../_shared/webhook-validator.ts';

Deno.serve(withRequestId('ai-copilot', async (req, _ctx) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // Require authentication — this function uses SERVICE_ROLE_KEY to read sensitive salesperson data
  const authHeader = req.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header required' }), {
      status: 401,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser();
  if (authError || !authData?.user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  try {
    const rawBody = await req.json();

    // Contract validation
    const validation = validateWebhookPayload(
      WebhookContracts.aiCopilot,
      rawBody,
      '1.0.0'
    );
    if (!validation.success) {
      console.error(
        `[Contract Violation] AI Copilot failed validation: ${validation.error}`
      );
      return new Response(
        JSON.stringify({
          error: validation.error,
          contract_version: validation.contract_version,
        }),
        {
          status: validation.statusCode,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        }
      );
    }

    const { context, salespersonId, action } = validation.data;
    const forecastId = (validation.data as { forecast_id?: string }).forecast_id;
    const recordingId = (validation.data as { recording_id?: string }).recording_id;

    // ────────────────────────────────────────────────────────────────
    // SKILLS ROUTER — delega para edge functions especialistas
    // ────────────────────────────────────────────────────────────────
    if (action === 'forecast_narrative') {
      if (!forecastId) {
        return new Response(
          JSON.stringify({ error: 'forecast_id (uuid) obrigatório para skill forecast_narrative' }),
          { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
        );
      }
      const skillResp = await fetchWithTimeout(`${supabaseUrl}/functions/v1/forecast-narrative`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({ forecast_id: forecastId }),
      });
      const skillBody = await skillResp.text();
      return new Response(skillBody, {
        status: skillResp.status,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    if (action === 'coaching_plan') {
      if (!recordingId) {
        return new Response(
          JSON.stringify({ error: 'recording_id (uuid) obrigatório para skill coaching_plan' }),
          { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
        );
      }
      const skillResp = await fetchWithTimeout(`${supabaseUrl}/functions/v1/generate-coaching-actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({ recording_id: recordingId }),
      });
      const skillBody = await skillResp.text();
      return new Response(skillBody, {
        status: skillResp.status,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }
    // ────────────────────────────────────────────────────────────────

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let contextData = '';

    // Fetch relevant data based on current page context
    if (salespersonId) {
      const { data: salesperson } = await supabase
        .from('salespeople')
        .select('name, role, xp, level, commission_rate')
        .eq('id', salespersonId)
        .single();

      if (salesperson) {
        contextData += `Vendedor: ${salesperson.name} (${salesperson.role}), Nível ${salesperson.level}, XP: ${salesperson.xp}\n`;
      }

      // Get today's pending tasks
      const { data: tasks, count: taskCount } = await supabase
        .from('tasks')
        .select('title, priority, due_date', { count: 'exact' })
        .eq('assigned_to', salespersonId)
        .eq('is_completed', false)
        .order('due_date', { ascending: true })
        .limit(5);

      if (taskCount && taskCount > 0) {
        contextData += `Tarefas pendentes: ${taskCount}. Próximas: ${tasks?.map(t => `${t.title} (${t.priority})`).join(', ')}\n`;
      }

      // Get recent activities count
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { count: activityCount } = await supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('salesperson_id', salespersonId)
        .gte('created_at', weekAgo);

      contextData += `Atividades na semana: ${activityCount || 0}\n`;

      // Get open deals
      const { data: deals, count: dealCount } = await supabase
        .from('sales')
        .select('title, value, status', { count: 'exact' })
        .eq('salesperson_id', salespersonId)
        .in('status', ['open', 'lead', 'qualified', 'proposal', 'negotiation'])
        .order('value', { ascending: false })
        .limit(3);

      if (dealCount && dealCount > 0) {
        contextData += `Deals abertos: ${dealCount}. Top: ${deals?.map(d => `${d.title} (R$${d.value})`).join(', ')}\n`;
      }
    }

    const systemPrompt = `Você é o Copilot do PROMO CHAMPIONS, um assistente de vendas ultra-conciso e proativo.
Sua função é dar micro-sugestões contextuais baseadas na tela atual e nos dados do vendedor.
REGRAS:
- Máximo 2-3 frases curtas
- Seja direto e acionável
- Use emojis sparingly (1-2 max)
- Foque em produtividade e próximos passos
- Fale em português brasileiro
- Não repita informações óbvias da tela

Dados do vendedor:
${contextData}

Tela atual: ${context.page}
${context.extra ? `Contexto extra: ${context.extra}` : ''}`;

    let userMessage = '';

    if (action === 'page_suggestion') {
      userMessage = `Dê uma micro-sugestão proativa para a tela "${context.page}". O que o vendedor deveria fazer agora?`;
    } else if (action === 'smart_tip') {
      userMessage = `Baseado nos dados, dê uma dica rápida de performance para o vendedor.`;
    } else if (action === 'auto_fill') {
      userMessage = `Sugira preenchimento inteligente para: ${context.extra}`;
    } else if (action === 'quick_answer') {
      userMessage = context.question || 'Dê uma dica rápida.';
    } else {
      userMessage = context.question || 'O que devo fazer agora?';
    }

    const response = await fetchWithTimeout('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit atingido. Tente novamente em breve.' }),
          {
            status: 429,
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes.', suggestion: '' }),
          {
            status: 200,
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
          }
        );
      }
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      // Graceful fallback for 403 (AI disabled) and other 5xx — avoid blank screens
      if (response.status === 403 || response.status >= 500) {
        return new Response(
          JSON.stringify({
            suggestion: '',
            disabled: response.status === 403,
            fallback: true,
          }),
          { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('ai-copilot error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  }
}));
