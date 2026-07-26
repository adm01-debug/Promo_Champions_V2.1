// Generate Coaching Actions — analisa transcript de uma call e cria 3 ações no coaching_actions.
// Modo síncrono (POST manual) OU chamado assincronamente por trigger via pg_net.
// Auth: se Authorization header presente, valida; senão exige X-Cron-Secret == COACHING_CRON_SECRET.
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders(req) } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";

interface AiAction {
  category: 'opening' | 'discovery' | 'objection' | 'closing' | 'talk_ratio' | 'pace' | 'empathy' | 'other';
  severity: 'info' | 'warning' | 'critical';
  tip: string;
  quote?: string;
  timestamp_sec?: number;
}

const VALID_CATEGORIES = ['opening','discovery','objection','closing','talk_ratio','pace','empathy','other'];
const VALID_SEVERITIES = ['info','warning','critical'];

Deno.serve(withRequestId('generate-coaching-actions', async (req, _ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: getCorsHeaders(req) });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  if (!lovableKey) {
    return new Response(JSON.stringify({ error: 'AI not configured' }), {
      status: 503, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Auth: user JWT OR shared X-Cron-Secret matching public._internal_secrets['coaching_cron_secret']
  const authHeader = req.headers.get('Authorization');
  const providedSecret = req.headers.get('X-Cron-Secret');
  let isCron = false;

  if (!authHeader) {
    const { data: sec } = await admin
      .from('_internal_secrets')
      .select('value')
      .eq('key', 'coaching_cron_secret')
      .maybeSingle();

    // Constant-time comparison: compare length first, then each byte.
    // Prevents timing attacks that could reveal secret length via response time.
    function timingSafeEqual(a: string, b: string): boolean {
      if (a.length !== b.length) return false;
      let diff = 0;
      for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
      return diff === 0;
    }

    if (!sec?.value || !providedSecret || !timingSafeEqual(sec.value, providedSecret)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }
    isCron = true;
  } else {
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }
  }

  let body: { recording_id?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
  const recordingId = body?.recording_id;
  if (!recordingId || typeof recordingId !== 'string') {
    return new Response(JSON.stringify({ error: 'recording_id (uuid) required' }), {
      status: 400, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  // admin client already initialized above

  // Load recording
  const { data: rec, error: recErr } = await admin
    .from('call_recordings')
    .select('id, salesperson_id, transcript, summary, title, status')
    .eq('id', recordingId)
    .maybeSingle();

  if (recErr || !rec) {
    return new Response(JSON.stringify({ error: 'Recording not found', detail: recErr?.message }), {
      status: 404, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
  if (!rec.salesperson_id) {
    return new Response(JSON.stringify({ error: 'Recording has no salesperson_id' }), {
      status: 422, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
  const content = rec.transcript || rec.summary;
  if (!content || content.trim().length < 40) {
    return new Response(JSON.stringify({ error: 'Recording has no transcript/summary to analyze' }), {
      status: 422, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  // Idempotency: skip if AI already produced actions for this recording
  const { count: existingCount } = await admin
    .from('coaching_actions')
    .select('id', { count: 'exact', head: true })
    .eq('recording_id', recordingId)
    .eq('created_by_ai', true);

  if ((existingCount ?? 0) > 0) {
    return new Response(JSON.stringify({ ok: true, skipped: 'already_generated', existing: existingCount }), {
      status: 200, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  // Cap transcript to keep tokens/latency sane
  const excerpt = content.length > 8000 ? content.slice(0, 8000) + '\n...[truncado]' : content;

  const systemPrompt = `Você é um coach sênior de vendas B2B. Analise a transcrição da call e retorne EXATAMENTE 3 pontos de melhoria acionáveis, cada um em PT-BR, tom respeitoso e prático. Retorne APENAS JSON válido no formato: {"actions":[{"category":"...","severity":"...","tip":"...","quote":"..."}]}. Categorias válidas: opening, discovery, objection, closing, talk_ratio, pace, empathy, other. Severidades: info, warning, critical. "tip" ≤ 220 chars, "quote" é opcional (citação curta da transcrição, ≤ 180 chars). Sem markdown, sem explicações fora do JSON.`;

  const userPrompt = `Título: ${rec.title ?? '(sem título)'}\n\nTranscrição/resumo:\n${excerpt}\n\nGere as 3 ações agora.`;

  const aiRes = await fetchWithTimeout('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${lovableKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (aiRes.status === 429) {
    await aiRes.text();
    return new Response(JSON.stringify({ error: 'AI rate limit' }), {
      status: 429, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
  if (aiRes.status === 402) {
    await aiRes.text();
    return new Response(JSON.stringify({ error: 'Créditos IA insuficientes' }), {
      status: 402, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
  if (!aiRes.ok) {
    const t = await aiRes.text();
    console.error('[generate-coaching-actions] AI error', aiRes.status, t);
    return new Response(JSON.stringify({ error: 'AI error', status: aiRes.status }), {
      status: 502, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  const aiJson = await aiRes.json();
  const raw: string = aiJson?.choices?.[0]?.message?.content?.trim() ?? '{}';
  let parsed: { actions?: unknown };
  try { parsed = JSON.parse(raw); } catch {
    return new Response(JSON.stringify({ error: 'AI returned invalid JSON', raw }), {
      status: 502, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  const rawActions = Array.isArray(parsed.actions) ? parsed.actions : [];
  const actions: AiAction[] = rawActions
    .filter((a): a is Record<string, unknown> => !!a && typeof a === 'object')
    .map((a) => ({
      category: VALID_CATEGORIES.includes(String(a.category)) ? (a.category as AiAction['category']) : 'other',
      severity: VALID_SEVERITIES.includes(String(a.severity)) ? (a.severity as AiAction['severity']) : 'info',
      tip: String(a.tip ?? '').trim().slice(0, 220),
      quote: a.quote ? String(a.quote).trim().slice(0, 180) : undefined,
      timestamp_sec: typeof a.timestamp_sec === 'number' ? Math.max(0, Math.floor(a.timestamp_sec)) : undefined,
    }))
    .filter((a) => a.tip.length > 0)
    .slice(0, 3);

  if (actions.length === 0) {
    return new Response(JSON.stringify({ error: 'AI returned no valid actions' }), {
      status: 502, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  const rows = actions.map((a) => ({
    recording_id: recordingId,
    salesperson_id: rec.salesperson_id,
    tip: a.tip,
    category: a.category,
    severity: a.severity,
    quote: a.quote ?? null,
    timestamp_sec: a.timestamp_sec ?? null,
    status: 'pending' as const,
    created_by_ai: true,
  }));

  const { data: inserted, error: insErr } = await admin
    .from('coaching_actions')
    .insert(rows)
    .select('id, category, severity, tip');

  if (insErr) {
    console.error('[generate-coaching-actions] insert failed', insErr);
    return new Response(JSON.stringify({ error: 'Failed to persist actions', detail: insErr.message }), {
      status: 500, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, source: isCron ? 'cron' : 'user', actions: inserted }), {
    status: 200, headers: { getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}));
