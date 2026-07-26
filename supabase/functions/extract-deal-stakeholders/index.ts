import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders(req) } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";

interface ExtractedStakeholder {
  name: string;
  role_title?: string;
  dmu_role:
    | 'decision_maker'
    | 'economic_buyer'
    | 'champion'
    | 'influencer'
    | 'user'
    | 'blocker'
    | 'unknown';
  influence_level: 'low' | 'medium' | 'high';
  sentiment: 'positive' | 'neutral' | 'negative';
  signals?: string[];
}

Deno.serve(withRequestId("extract-deal-stakeholders", async (req, _ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { recording_id, sale_id: bodySaleId, manual_text } = body;

    let saleId = bodySaleId;
    let transcriptText = manual_text || '';

    if (recording_id) {
      const { data: rec } = await supabase
        .from('call_recordings')
        .select('id, sale_id, transcript, diarization, salesperson_id')
        .eq('id', recording_id)
        .single();
      if (!rec) {
        return new Response(JSON.stringify({ error: 'Recording not found' }), {
          status: 404,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        });
      }
      saleId = rec.sale_id;
      transcriptText = rec.transcript || JSON.stringify(rec.diarization || []);
    }

    if (!saleId || !transcriptText) {
      return new Response(JSON.stringify({ error: 'sale_id and content required' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const { data: sale } = await supabase
      .from('sales')
      .select('id, salesperson_id, client_name')
      .eq('id', saleId)
      .single();

    if (!sale) {
      return new Response(JSON.stringify({ error: 'Sale not found' }), {
        status: 404,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Resolve owner_id (auth.uid of salesperson)
    const { data: sp } = await supabase
      .from('salespeople')
      .select('user_id')
      .eq('id', sale.salesperson_id)
      .maybeSingle();
    const ownerId = sp?.user_id || user.id;

    // Call Lovable AI with tool calling
    const aiResp = await fetchWithTimeout('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista em mapear o Decision Making Unit (DMU) em vendas B2B. Extraia stakeholders mencionados no conteúdo, classificando seu papel no comitê de compra.',
          },
          {
            role: 'user',
            content: `Cliente: ${sale.client_name}\n\nConteúdo da call/email:\n${transcriptText.substring(0, 8000)}\n\nExtraia todos os stakeholders mencionados (pessoas que aparecem participando da decisão).`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_stakeholders',
              description: 'Retorna a lista de stakeholders identificados',
              parameters: {
                type: 'object',
                properties: {
                  stakeholders: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        role_title: { type: 'string' },
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
                        signals: { type: 'array', items: { type: 'string' } },
                      },
                      required: ['name', 'dmu_role', 'influence_level', 'sentiment'],
                    },
                  },
                },
                required: ['stakeholders'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_stakeholders' } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error('AI error:', aiResp.status, txt);
      if (aiResp.status === 429 || aiResp.status === 402) {
        return new Response(
          JSON.stringify({
            error: aiResp.status === 429 ? 'Rate limited' : 'Credits exhausted',
          }),
          {
            status: aiResp.status,
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
          }
        );
      }
      throw new Error(`AI gateway: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall
      ? JSON.parse(toolCall.function.arguments)
      : { stakeholders: [] };
    const stakeholders: ExtractedStakeholder[] = args.stakeholders || [];

    // Pre-fetch all existing stakeholders for this sale in one query
    const { data: existingRows } = await supabase
      .from('deal_stakeholders')
      .select('id, name, source')
      .eq('sale_id', saleId)
      .limit(500);

    const existingByName = new Map<string, { id: string; source: string }>();
    for (const sh of existingRows ?? []) {
      existingByName.set(sh.name.toLowerCase(), { id: sh.id, source: sh.source });
    }

    const now = new Date().toISOString();
    const insertRows: Array<Record<string, unknown>> = [];
    const updateOps: Array<{ id: string; payload: Record<string, unknown> }> = [];

    for (const s of stakeholders) {
      if (!s.name?.trim()) continue;
      const existing = existingByName.get(s.name.trim().toLowerCase());
      if (existing?.source === 'manual') continue; // preserve manual

      const payload = {
        sale_id: saleId,
        owner_id: ownerId,
        name: s.name.trim(),
        role_title: s.role_title || null,
        dmu_role: s.dmu_role,
        influence_level: s.influence_level,
        sentiment: s.sentiment,
        signals: s.signals || [],
        source: 'ai_extracted',
        last_interaction_at: now,
      };

      if (existing) {
        updateOps.push({ id: existing.id, payload });
      } else {
        insertRows.push(payload);
      }
    }

    // Batch all writes in parallel
    const [insertRes] = await Promise.all([
      insertRows.length > 0
        ? supabase.from('deal_stakeholders').insert(insertRows).select()
        : Promise.resolve({ data: [] as Record<string, unknown>[], error: null }),
      ...updateOps.map(op =>
        supabase.from('deal_stakeholders').update(op.payload).eq('id', op.id)
      ),
    ]);

    const upserted: Record<string, unknown>[] = [];
    if (insertRes.data) upserted.push(...insertRes.data);
    for (const op of updateOps) {
      upserted.push({ id: op.id, ...op.payload });
    }

    // Auto-chain: recalc coverage
    await fetchWithTimeout(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/calculate-committee-coverage`,
      {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_id: saleId }),
      }
    ).catch(e => console.error('Coverage recalc failed:', e));

    return new Response(
      JSON.stringify({ success: true, stakeholders: upserted, count: upserted.length }),
      {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('extract-deal-stakeholders error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  }
}));
