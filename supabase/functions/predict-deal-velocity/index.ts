import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { validateUUID, collectErrors, validationErrorResponse } from '../_shared/validation.ts';
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";

interface PredictBody {
  sale_id?: string;
  batch?: boolean;
  limit?: number;
}

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function tierFromConfidence(score: number): 'low' | 'medium' | 'high' {
  if (score >= 75) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

function statusFromRatio(
  ratio: number,
  daysInStage: number
): 'ahead' | 'on_track' | 'slow' | 'stalled' {
  if (daysInStage > 30 && ratio > 2) return 'stalled';
  if (ratio > 1.5) return 'slow';
  if (ratio < 0.7) return 'ahead';
  return 'on_track';
}

async function getBaseline(stage: string, ownerId?: string | null) {
  const { data } = await admin
    .from('stage_velocity_baselines')
    .select('avg_days, median_days, p75_days, sample_size')
    .eq('stage', stage)
    .eq('owner_id', ownerId ?? '00000000-0000-0000-0000-000000000000')
    .maybeSingle();
  if (data && data.sample_size >= 3) return data;
  const { data: global } = await admin
    .from('stage_velocity_baselines')
    .select('avg_days, median_days, p75_days, sample_size')
    .eq('stage', stage)
    .is('owner_id', null)
    .maybeSingle();
  return global ?? { avg_days: 14, median_days: 10, p75_days: 21, sample_size: 0 };
}

async function aiRefine(
  stage: string, amount: number | null, daysInStage: number,
  expectedDays: number, baseline: Record<string, unknown>,
  health: { health_score?: number; tier?: string } | null,
  coverage: { coverage_score?: number; tier?: string } | null,
): Promise<{ predictedDays?: number; confidence?: number; drivers?: string[]; brakes?: string[] }> {
  if (!LOVABLE_API_KEY) return {};
  try {
    const aiResp = await fetchWithTimeout('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um analista de previsão de vendas B2B. Estime dias até fechamento (won/lost) com base nos dados.' },
          { role: 'user', content: JSON.stringify({ stage, amount, daysInStage, expectedDays, baseline, health, coverage }) },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'set_prediction',
            description: 'Define a previsão',
            parameters: {
              type: 'object',
              properties: {
                predicted_days_remaining: { type: 'integer', minimum: 1, maximum: 365 },
                confidence_score: { type: 'integer', minimum: 0, maximum: 100 },
                factors: {
                  type: 'object',
                  properties: {
                    drivers: { type: 'array', items: { type: 'string' } },
                    brakes: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['drivers', 'brakes'],
                },
              },
              required: ['predicted_days_remaining', 'confidence_score', 'factors'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'set_prediction' } },
      }),
    });
    if (!aiResp.ok) return {};
    const aiJson = await aiResp.json();
    const args = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return {};
    const parsed = JSON.parse(args);
    return {
      predictedDays: parsed.predicted_days_remaining,
      confidence: parsed.confidence_score,
      drivers: parsed.factors?.drivers,
      brakes: parsed.factors?.brakes,
    };
  } catch (e) {
    console.warn('AI refinement failed, using heuristic', e);
    return {};
  }
}

async function predictForSale(saleId: string) {
  const { data: sale, error } = await admin
    .from('sales')
    .select('id, status, stage, amount, salesperson_id, created_at, updated_at')
    .eq('id', saleId)
    .maybeSingle();
  if (error || !sale) throw new Error('Sale not found');
  if (sale.status === 'completed' || sale.status === 'lost') {
    return { skipped: true, reason: 'deal closed' };
  }

  const stage = sale.stage ?? 'unknown';
  const baseline = await getBaseline(stage, sale.salesperson_id);
  const expectedDays = Number(baseline.median_days || baseline.avg_days || 14);

  const { data: stageHistory } = await admin
    .from('deal_stage_history')
    .select('entered_at, exited_at, stage')
    .eq('sale_id', saleId)
    .order('entered_at', { ascending: false })
    .limit(1);
  const enteredAt = stageHistory?.[0]?.entered_at ?? sale.updated_at ?? sale.created_at;
  const daysInStage = Math.max(0, Math.floor((Date.now() - new Date(enteredAt).getTime()) / 86400000));

  const { data: health } = await admin
    .from('deal_health_scores')
    .select('health_score, tier')
    .eq('sale_id', saleId)
    .maybeSingle();

  const { data: coverage } = await admin
    .from('deal_committee_coverage')
    .select('coverage_score, tier')
    .eq('sale_id', saleId)
    .maybeSingle();

  const ratio = expectedDays > 0 ? daysInStage / expectedDays : 1;
  const remaining = Math.max(1, Math.round(expectedDays - daysInStage));

  let predictedDays = Math.max(remaining, 3);
  let confidence = 50;
  const drivers: string[] = [];
  const brakes: string[] = [];

  if (health?.health_score) {
    if (health.health_score >= 70) { confidence += 15; drivers.push(`Saúde alta (${health.health_score})`); }
    else if (health.health_score < 40) { confidence -= 15; brakes.push(`Saúde baixa (${health.health_score})`); predictedDays = Math.round(predictedDays * 1.5); }
  }
  if (coverage?.coverage_score) {
    if (coverage.coverage_score >= 70) { confidence += 10; drivers.push(`Comitê forte (${coverage.coverage_score})`); }
    else if (coverage.coverage_score < 40) { confidence -= 10; brakes.push(`Comitê fraco (${coverage.coverage_score})`); predictedDays = Math.round(predictedDays * 1.3); }
  }
  if (ratio > 2) { brakes.push(`Parado há ${daysInStage}d (esperado ${expectedDays.toFixed(0)}d)`); predictedDays = Math.round(predictedDays * 1.4); confidence -= 10; }
  if (ratio < 0.5) { drivers.push('Avançando rápido no estágio'); confidence += 5; }

  const aiResult = await aiRefine(stage, sale.amount, daysInStage, expectedDays, baseline, health, coverage);
  if (aiResult.predictedDays) predictedDays = aiResult.predictedDays;
  if (aiResult.confidence !== undefined) confidence = aiResult.confidence;
  if (aiResult.drivers) drivers.push(...aiResult.drivers);
  if (aiResult.brakes) brakes.push(...aiResult.brakes);

  confidence = Math.max(0, Math.min(100, confidence));
  const closeDate = new Date(Date.now() + predictedDays * 86400000).toISOString().slice(0, 10);

  const { data: ownerRow } = await admin
    .from('salespeople')
    .select('auth_user_id')
    .eq('id', sale.salesperson_id)
    .maybeSingle();

  const payload = {
    sale_id: saleId,
    owner_id: ownerRow?.auth_user_id ?? null,
    predicted_close_date: closeDate,
    predicted_days_remaining: predictedDays,
    confidence_score: confidence,
    confidence_tier: tierFromConfidence(confidence),
    velocity_status: statusFromRatio(ratio, daysInStage),
    current_stage: stage,
    days_in_stage: daysInStage,
    expected_days_in_stage: expectedDays,
    stage_velocity_ratio: Number(ratio.toFixed(2)),
    factors: { drivers: [...new Set(drivers)], brakes: [...new Set(brakes)] },
    model_version: 'v1',
    calculated_at: new Date().toISOString(),
  };

  const { error: upErr } = await admin
    .from('deal_velocity_predictions')
    .upsert(payload, { onConflict: 'sale_id' });
  if (upErr) throw upErr;
  return payload;
}

type SaleRow = { id: string; status: string; stage: string | null; amount: number | null; salesperson_id: string | null; created_at: string; updated_at: string };
type BaselineRow = { stage: string; owner_id?: string | null; avg_days: number; median_days: number; p75_days: number; sample_size: number };

async function batchPredict(limit: number): Promise<Response> {
  const { data: salesData } = await admin
    .from('sales')
    .select('id, status, stage, amount, salesperson_id, created_at, updated_at')
    .not('status', 'in', '("completed","lost")')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (!salesData?.length) {
    return new Response(JSON.stringify({ count: 0, results: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const sales = salesData as SaleRow[];
  const saleIds = sales.map(s => s.id);
  const uniqueStages = [...new Set(sales.map(s => s.stage ?? 'unknown'))];
  const uniqueOwners = [...new Set(sales.map(s => s.salesperson_id).filter(Boolean) as string[])];

  // Parallel pre-fetch of all supplementary data
  const [
    historyData,
    healthData,
    coverageData,
    ownerBaselineData,
    globalBaselineData,
    salespeopleData,
  ] = await Promise.all([
    chunkedIn<{ sale_id: string; entered_at: string }>(
      saleIds,
      (chunk) => admin.from('deal_stage_history').select('sale_id, entered_at').in('sale_id', chunk).order('entered_at', { ascending: false }),
      { parallel: true, label: 'predict-deal-velocity.history' },
    ),
    chunkedIn<{ sale_id: string; health_score: number; tier: string }>(
      saleIds,
      (chunk) => admin.from('deal_health_scores').select('sale_id, health_score, tier').in('sale_id', chunk),
      { parallel: true, label: 'predict-deal-velocity.health' },
    ),
    chunkedIn<{ sale_id: string; coverage_score: number; tier: string }>(
      saleIds,
      (chunk) => admin.from('deal_committee_coverage').select('sale_id, coverage_score, tier').in('sale_id', chunk),
      { parallel: true, label: 'predict-deal-velocity.coverage' },
    ),
    uniqueStages.length > 0 && uniqueOwners.length > 0
      ? chunkedIn<BaselineRow>(
          uniqueOwners,
          (chunk) => admin.from('stage_velocity_baselines').select('stage, owner_id, avg_days, median_days, p75_days, sample_size').in('stage', uniqueStages).in('owner_id', chunk),
          { parallel: true, label: 'predict-deal-velocity.owner-baseline' },
        )
      : Promise.resolve([] as BaselineRow[]),
    uniqueStages.length > 0
      ? admin.from('stage_velocity_baselines').select('stage, avg_days, median_days, p75_days, sample_size').in('stage', uniqueStages).is('owner_id', null).then((r) => (r.data ?? []) as BaselineRow[])
      : Promise.resolve([] as BaselineRow[]),
    chunkedIn<{ id: string; auth_user_id: string | null }>(
      uniqueOwners,
      (chunk) => admin.from('salespeople').select('id, auth_user_id').in('id', chunk),
      { parallel: true, label: 'predict-deal-velocity.salespeople' },
    ),
  ]);

  // Build O(1) lookup maps
  const latestHistoryBySaleId = new Map<string, { entered_at: string }>();
  for (const h of (historyData ?? []) as { sale_id: string; entered_at: string }[]) {
    if (!latestHistoryBySaleId.has(h.sale_id)) latestHistoryBySaleId.set(h.sale_id, h);
  }
  const healthMap = new Map((healthData ?? []).map((h: { sale_id: string; health_score: number; tier: string }) => [h.sale_id, h]));
  const coverageMap = new Map((coverageData ?? []).map((c: { sale_id: string; coverage_score: number; tier: string }) => [c.sale_id, c]));
  const ownerBaselineMap = new Map<string, BaselineRow>();
  for (const b of (ownerBaselineData ?? []) as BaselineRow[]) {
    ownerBaselineMap.set(`${b.owner_id}|${b.stage}`, b);
  }
  const globalBaselineMap = new Map<string, BaselineRow>();
  for (const b of (globalBaselineData ?? []) as BaselineRow[]) {
    globalBaselineMap.set(b.stage, b);
  }
  const salespersonMap = new Map((salespeopleData ?? []).map((sp: { id: string; auth_user_id: string | null }) => [sp.id, sp]));

  const fallbackBaseline: BaselineRow = { stage: '', avg_days: 14, median_days: 10, p75_days: 21, sample_size: 0 };

  const results: unknown[] = [];
  const payloads: Record<string, unknown>[] = [];

  for (const sale of sales) {
    if (sale.status === 'completed' || sale.status === 'lost') {
      results.push({ skipped: true, reason: 'deal closed' });
      continue;
    }

    const stage = sale.stage ?? 'unknown';

    // Baseline lookup from maps (no DB call)
    const ownerBaseline = sale.salesperson_id ? ownerBaselineMap.get(`${sale.salesperson_id}|${stage}`) : undefined;
    const baseline = (ownerBaseline && ownerBaseline.sample_size >= 3)
      ? ownerBaseline
      : (globalBaselineMap.get(stage) ?? fallbackBaseline);

    const expectedDays = Number(baseline.median_days || baseline.avg_days || 14);
    const history = latestHistoryBySaleId.get(sale.id);
    const enteredAt = history?.entered_at ?? sale.updated_at ?? sale.created_at;
    const daysInStage = Math.max(0, Math.floor((Date.now() - new Date(enteredAt).getTime()) / 86400000));

    const health = healthMap.get(sale.id) ?? null;
    const coverage = coverageMap.get(sale.id) ?? null;

    const ratio = expectedDays > 0 ? daysInStage / expectedDays : 1;
    const remaining = Math.max(1, Math.round(expectedDays - daysInStage));

    let predictedDays = Math.max(remaining, 3);
    let confidence = 50;
    const drivers: string[] = [];
    const brakes: string[] = [];

    if (health?.health_score) {
      if (health.health_score >= 70) { confidence += 15; drivers.push(`Saúde alta (${health.health_score})`); }
      else if (health.health_score < 40) { confidence -= 15; brakes.push(`Saúde baixa (${health.health_score})`); predictedDays = Math.round(predictedDays * 1.5); }
    }
    if (coverage?.coverage_score) {
      if (coverage.coverage_score >= 70) { confidence += 10; drivers.push(`Comitê forte (${coverage.coverage_score})`); }
      else if (coverage.coverage_score < 40) { confidence -= 10; brakes.push(`Comitê fraco (${coverage.coverage_score})`); predictedDays = Math.round(predictedDays * 1.3); }
    }
    if (ratio > 2) { brakes.push(`Parado há ${daysInStage}d (esperado ${expectedDays.toFixed(0)}d)`); predictedDays = Math.round(predictedDays * 1.4); confidence -= 10; }
    if (ratio < 0.5) { drivers.push('Avançando rápido no estágio'); confidence += 5; }

    // AI refinement (inherently sequential per sale)
    const aiResult = await aiRefine(stage, sale.amount, daysInStage, expectedDays, baseline as Record<string, unknown>, health, coverage);
    if (aiResult.predictedDays) predictedDays = aiResult.predictedDays;
    if (aiResult.confidence !== undefined) confidence = aiResult.confidence;
    if (aiResult.drivers) drivers.push(...aiResult.drivers);
    if (aiResult.brakes) brakes.push(...aiResult.brakes);

    confidence = Math.max(0, Math.min(100, confidence));
    const closeDate = new Date(Date.now() + predictedDays * 86400000).toISOString().slice(0, 10);
    const spRow = sale.salesperson_id ? salespersonMap.get(sale.salesperson_id) : null;

    const payload = {
      sale_id: sale.id,
      owner_id: spRow?.auth_user_id ?? null,
      predicted_close_date: closeDate,
      predicted_days_remaining: predictedDays,
      confidence_score: confidence,
      confidence_tier: tierFromConfidence(confidence),
      velocity_status: statusFromRatio(ratio, daysInStage),
      current_stage: stage,
      days_in_stage: daysInStage,
      expected_days_in_stage: expectedDays,
      stage_velocity_ratio: Number(ratio.toFixed(2)),
      factors: { drivers: [...new Set(drivers)], brakes: [...new Set(brakes)] },
      model_version: 'v1',
      calculated_at: new Date().toISOString(),
    };
    payloads.push(payload);
    results.push(payload);
  }

  // Phase 2: single batch upsert for all predictions
  if (payloads.length > 0) {
    const { error: upErr } = await admin
      .from('deal_velocity_predictions')
      .upsert(payloads, { onConflict: 'sale_id' });
    if (upErr) console.error('deal_velocity_predictions batch upsert error:', upErr);
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(withRequestId('predict-deal-velocity', async (req, _ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const body: PredictBody = await req.json().catch(() => ({}));
    if (body.batch) {
      const limit = Math.min(body.limit ?? 25, 50);
      return await batchPredict(limit);
    }
    const errs = collectErrors([
      validateUUID(body.sale_id, 'sale_id', true),
    ]);
    if (errs.length) return validationErrorResponse(errs, corsHeaders);

    const result = await predictForSale(body.sale_id!);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('predict-deal-velocity error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
