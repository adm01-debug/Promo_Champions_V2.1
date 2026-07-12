// Forecast Narrative — gera explicação em PT-BR do forecast atual usando Lovable AI Gateway.
// Auth: requer JWT do usuário. Rate-limit: 20 req/min por usuário.
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { enforceRateLimit } from '../_shared/rate-limit.ts';

interface Factor { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }
interface ForecastRow {
  period_type: string;
  period_start: string;
  period_end: string;
  commit_amount: number;
  best_case_amount: number;
  upside_amount: number;
  weighted_pipeline: number;
  goal_amount: number;
  gap_to_goal: number;
  confidence_score: number;
  deals_count: number;
  factors: Factor[] | null;
}

const BRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v ?? 0);

Deno.serve(withRequestId('forecast-narrative', async (req, _ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header required' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await authClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rl = await checkRateLimit(`forecast-narrative:${userData.user.id}`, { max: 20, windowSec: 60 });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded', retry_after_sec: rl.retryAfter }), {
      status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter) },
    });
  }

  let body: { forecast_id?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const forecastId = body?.forecast_id;
  if (!forecastId || typeof forecastId !== 'string') {
    return new Response(JSON.stringify({ error: 'forecast_id (uuid) required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: forecast, error: fErr } = await authClient
    .from('revenue_forecasts')
    .select('period_type,period_start,period_end,commit_amount,best_case_amount,upside_amount,weighted_pipeline,goal_amount,gap_to_goal,confidence_score,deals_count,factors')
    .eq('id', forecastId)
    .maybeSingle<ForecastRow>();

  if (fErr) {
    return new Response(JSON.stringify({ error: 'Failed to load forecast', detail: fErr.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!forecast) {
    return new Response(JSON.stringify({ error: 'Forecast not found or not authorized' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!lovableApiKey) {
    return new Response(JSON.stringify({ error: 'AI service not configured' }), {
      status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const factorsText = (forecast.factors ?? [])
    .map((f) => `- [${f.impact.toUpperCase()}] ${f.label}: ${f.detail}`)
    .join('\n') || '(sem fatores registrados)';

  const gapDirection = forecast.gap_to_goal <= 0 ? 'ACIMA da meta' : 'ABAIXO da meta';
  const gapAbs = Math.abs(forecast.gap_to_goal);

  const systemPrompt = `Você é um analista sênior de RevOps. Escreva SEMPRE em português brasileiro, tom executivo, direto ao ponto, máximo 4 parágrafos curtos. Nunca invente números — use APENAS os fornecidos. Estruture: (1) veredito, (2) drivers positivos, (3) riscos/gaps, (4) recomendação acionável. Sem markdown, sem títulos, sem bullets — texto corrido separado por quebras de linha duplas.`;

  const userPrompt = `Forecast ${forecast.period_type} (${forecast.period_start} → ${forecast.period_end})
Meta: ${BRL(forecast.goal_amount)}
Commit: ${BRL(forecast.commit_amount)} | Best Case: ${BRL(forecast.best_case_amount)} | Upside: ${BRL(forecast.upside_amount)}
Pipeline ponderado: ${BRL(forecast.weighted_pipeline)} em ${forecast.deals_count} deals
Confiança do modelo: ${Math.round(forecast.confidence_score * 100)}%
Situação: ${BRL(gapAbs)} ${gapDirection}

Fatores identificados pelo motor:
${factorsText}

Gere a narrativa executiva.`;

  const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (aiRes.status === 429) {
    await aiRes.text();
    return new Response(JSON.stringify({ error: 'AI rate limit — tente novamente em instantes' }), {
      status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (aiRes.status === 402) {
    await aiRes.text();
    return new Response(JSON.stringify({ error: 'Créditos IA insuficientes na workspace' }), {
      status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!aiRes.ok) {
    const errText = await aiRes.text();
    console.error('[forecast-narrative] AI error', aiRes.status, errText);
    return new Response(JSON.stringify({ error: 'AI provider error', status: aiRes.status }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const aiJson = await aiRes.json();
  const narrative: string = aiJson?.choices?.[0]?.message?.content?.trim() ?? '';
  if (!narrative) {
    return new Response(JSON.stringify({ error: 'AI returned empty narrative' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Persist so we don't spend credits re-generating the same view
  await authClient.from('revenue_forecasts').update({ ai_summary: narrative }).eq('id', forecastId);

  return new Response(JSON.stringify({ narrative, generated_at: new Date().toISOString() }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}));
