import { corsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";

const SYSTEM_PROMPT = `Você é um analista B2B sênior. Extraia stakeholders mencionados na transcrição de uma call de vendas.
Retorne APENAS via tool call. Para cada pessoa identificada com nome próprio, classifique:
- dmu_role: decision_maker | economic_buyer | champion | influencer | user | blocker | unknown
- influence_level: low | medium | high
- sentiment: positive | neutral | negative
- evidence_quote: trecho curto literal da fala que sustenta a classificação`;

interface Stakeholder {
  name: string;
  job_title?: string;
  dmu_role: string;
  influence_level: string;
  sentiment: string;
  evidence_quote: string;
  confidence: number;
}

Deno.serve(withRequestId("extract-committee-from-call", async (req, _ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { recording_id } = await req.json();
    if (!recording_id || typeof recording_id !== 'string') {
      return new Response(JSON.stringify({ error: 'recording_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: rec, error: recErr } = await supabase
      .from('call_recordings')
      .select('id, sale_id, transcript, salesperson_id')
      .eq('id', recording_id)
      .maybeSingle();
    if (recErr || !rec) {
      return new Response(JSON.stringify({ error: 'recording not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!rec.sale_id) {
      return new Response(JSON.stringify({ error: 'recording has no sale_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!rec.transcript) {
      return new Response(JSON.stringify({ error: 'recording has no transcript' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResp = await fetchWithTimeout('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Transcrição:\n${String(rec.transcript).slice(0, 30000)}`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_stakeholders',
              description: 'Lista de stakeholders identificados',
              parameters: {
                type: 'object',
                properties: {
                  stakeholders: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        job_title: { type: 'string' },
                        dmu_role: {
                          type: 'string',
                          enum: [
                            'decision_maker',
                            'economic_buyer',
                            'champion',
                            'influencer',
                            'user',
                            'blocker',
                            'unknown',
                          ],
                        },
                        influence_level: {
                          type: 'string',
                          enum: ['low', 'medium', 'high'],
                        },
                        sentiment: {
                          type: 'string',
                          enum: ['positive', 'neutral', 'negative'],
                        },
                        evidence_quote: { type: 'string' },
                        confidence: { type: 'number' },
                      },
                      required: [
                        'name',
                        'dmu_role',
                        'influence_level',
                        'sentiment',
                        'evidence_quote',
                        'confidence',
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['stakeholders'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_stakeholders' } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error('AI error', aiResp.status, t);
      const status = aiResp.status === 429 || aiResp.status === 402 ? aiResp.status : 500;
      return new Response(
        JSON.stringify({ error: 'AI gateway error', detail: t.slice(0, 500) }),
        {
          status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall
      ? JSON.parse(toolCall.function.arguments)
      : { stakeholders: [] };
    const stakeholders: Stakeholder[] = Array.isArray(args.stakeholders)
      ? args.stakeholders
      : [];

    const avgConfidence = stakeholders.length
      ? stakeholders.reduce((s, x) => s + (Number(x.confidence) || 0), 0) /
        stakeholders.length
      : 0;

    // Resolve owner_id (required by deal_stakeholders)
    let ownerId = rec.salesperson_id as string | null;
    if (!ownerId) {
      const { data: sale } = await supabase
        .from('sales')
        .select('salesperson_id')
        .eq('id', rec.sale_id)
        .maybeSingle();
      ownerId =
        (sale as { salesperson_id?: string | null } | null)?.salesperson_id ?? null;
    }

    // Pre-fetch all existing stakeholders for this sale — eliminates per-stakeholder N+1
    const { data: existingRows } = await supabase
      .from('deal_stakeholders')
      .select('id, name')
      .eq('sale_id', rec.sale_id)
      .limit(500);

    const existingByName = new Map<string, string>(); // lowercase name → id
    for (const sh of existingRows ?? []) {
      existingByName.set(sh.name.toLowerCase(), sh.id);
    }

    const insertRows: Array<Record<string, unknown>> = [];
    const updateOps: Array<Promise<unknown>> = [];

    for (const st of stakeholders) {
      if (!st.name?.trim()) continue;
      const existingId = existingByName.get(st.name.trim().toLowerCase());

      const payload: Record<string, unknown> = {
        sale_id: rec.sale_id,
        name: st.name.trim(),
        role_title: st.job_title ?? null,
        dmu_role: st.dmu_role,
        influence_level: st.influence_level,
        sentiment: st.sentiment,
        source: 'call',
        evidence_quote: st.evidence_quote,
        confidence: Number(st.confidence) || 0,
      };
      if (ownerId) payload.owner_id = ownerId;

      if (existingId) {
        updateOps.push(supabase.from('deal_stakeholders').update(payload).eq('id', existingId));
      } else {
        insertRows.push(payload);
      }
    }

    await Promise.all([
      insertRows.length > 0 ? supabase.from('deal_stakeholders').insert(insertRows) : Promise.resolve(),
      ...updateOps,
    ]);

    const createdCount = insertRows.length;
    const updatedCount = updateOps.length;

    await supabase.from('committee_extraction_runs').insert({
      recording_id: rec.id,
      sale_id: rec.sale_id,
      extracted_count: stakeholders.length,
      created_count: createdCount,
      updated_count: updatedCount,
      confidence: avgConfidence,
      raw_output: { stakeholders },
    });

    // Trigger coverage recalc (best-effort)
    try {
      await supabase.functions.invoke('calculate-committee-coverage', {
        body: { sale_id: rec.sale_id },
      });
    } catch (e) {
      console.warn('coverage recalc failed', e);
    }

    return new Response(
      JSON.stringify({
        extracted: stakeholders.length,
        created: createdCount,
        updated: updatedCount,
        confidence: avgConfidence,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('extract-committee error', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}));
