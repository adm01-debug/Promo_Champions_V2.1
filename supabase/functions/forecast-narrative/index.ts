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

Deno.serve(withRequestId('forecast-narrative', async (req, ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    ctx.log('warn', 'auth_missing');
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
    ctx.log('warn', 'auth_invalid', { error: userErr?.message });
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const userId = userData.user.id;

  const rlBlock = enforceRateLimit(req, { name: 'forecast-narrative', limit: 20, windowSeconds: 60 });
  if (rlBlock) {
    ctx.log('warn', 'rate_limited', { userId });
    return rlBlock;
  }

  let body: { forecast_id?: string };
  try { body = await req.json(); } catch {
    ctx.log('warn', 'invalid_json', { userId });
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const forecastId = body?.forecast_id;
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!forecastId || typeof forecastId !== 'string' || !uuidRe.test(forecastId)) {
    ctx.log('warn', 'validation_failed', { userId, field: 'forecast_id' });
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

  // Semantic cache: hash forecast payload (rounded) → dedupe identical requests within 6h
  const cacheKeyPayload = JSON.stringify({
    t: 'forecast-narrative',
    id: forecastId,
    p: forecast.period_type,
    c: Math.round(forecast.commit_amount),
    b: Math.round(forecast.best_case_amount),
    u: Math.round(forecast.upside_amount),
    w: Math.round(forecast.weighted_pipeline),
    g: Math.round(forecast.goal_amount),
    d: forecast.deals_count,
    cf: Math.round(forecast.confidence_score * 100),
    f: (forecast.factors ?? []).map((x) => `${x.impact}:${x.label}`).join('|'),
  });
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(cacheKeyPayload));
  const payloadHash = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  const cacheKey = `forecast-narrative:${forecastId}:${payloadHash.slice(0, 16)}`;

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const serviceClient = createClient(supabaseUrl, serviceKey);

  const { data: cached } = await serviceClient
    .from('ai_narrative_cache')
    .select('narrative, hit_count')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (cached?.narrative) {
    ctx.log('info', 'cache_hit', { userId, forecastId, cacheKey });
    await serviceClient
      .from('ai_narrative_cache')
      .update({ hit_count: (cached.hit_count ?? 0) + 1 })
      .eq('cache_key', cacheKey);
    return new Response(
      JSON.stringify({ narrative: cached.narrative, cached: true, generated_at: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
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

  const model = 'google/gemini-2.5-flash';
  const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (aiRes.status === 429) {
    await aiRes.text();
    ctx.log('warn', 'ai_rate_limited', { userId, forecastId });
    return new Response(JSON.stringify({ error: 'AI rate limit — tente novamente em instantes' }), {
      status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (aiRes.status === 402) {
    await aiRes.text();
    ctx.log('error', 'ai_payment_required', { userId, forecastId });
    return new Response(JSON.stringify({ error: 'Créditos IA insuficientes na workspace' }), {
      status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!aiRes.ok) {
    const errText = await aiRes.text();
    ctx.log('error', 'ai_error', { userId, forecastId, status: aiRes.status, detail: errText.slice(0, 300) });
    return new Response(JSON.stringify({ error: 'AI provider error', status: aiRes.status }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const aiJson = await aiRes.json();
  const narrative: string = aiJson?.choices?.[0]?.message?.content?.trim() ?? '';
  const usage = aiJson?.usage ?? {};
  if (!narrative) {
    ctx.log('error', 'ai_empty_narrative', { userId, forecastId });
    return new Response(JSON.stringify({ error: 'AI returned empty narrative' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }


  const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
  await serviceClient.from('ai_narrative_cache').upsert(
    {
      cache_key: cacheKey,
      narrative_type: 'forecast-narrative',
      payload_hash: payloadHash,
      narrative,
      model,
      tokens_input: usage.prompt_tokens ?? null,
      tokens_output: usage.completion_tokens ?? null,
      hit_count: 0,
      expires_at: expiresAt,
    },
    { onConflict: 'cache_key' },
  );
  await authClient.from('revenue_forecasts').update({ ai_summary: narrative }).eq('id', forecastId);

  return new Response(
    JSON.stringify({ narrative, cached: false, generated_at: new Date().toISOString() }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}));
