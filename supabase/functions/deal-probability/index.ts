import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from "../_shared/request-id.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";
import {
  computeDealProbability,
  type DealProbabilityInput,
  type StageHistoryEntry,
} from "../_shared/deal-probability-calc.ts";
import { getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";

Deno.serve(withRequestId("deal-probability", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Cálculo read-only sobre deals: o client do usuário aplica RLS, então o
    // chamador só recebe probabilidades dos deals que ele pode ver.
    const supabase = (await getUserClient(req)).client;

    const { dealIds } = await req.json();

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return new Response(JSON.stringify({ error: 'dealIds array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch deals (chunked to avoid PostgREST URL overflow on large arrays)
    const deals = await chunkedIn<Record<string, unknown>>(
      dealIds,
      (chunk) => supabase.from('sales').select('id, status, amount, category').in('id', chunk),
      { label: 'sales fetch' },
    );

    // Fetch historical win/loss data for context
    await chunkedIn<Record<string, unknown>>(
      dealIds,
      (chunk) => supabase.from('deal_outcomes').select('outcome, sale_id').in('sale_id', chunk),
      { label: 'deal_outcomes fetch' },
    );

    // Fetch stage history for velocity analysis
    const stageHistory = await chunkedIn<StageHistoryEntry & { sale_id: string }>(
      dealIds,
      (chunk) =>
        supabase
          .from('deal_stage_history')
          .select('sale_id, entered_at, exited_at')
          .in('sale_id', chunk)
          .order('entered_at', { ascending: false }),
      { label: 'deal_stage_history fetch' },
    );



    // Build O(1) lookup map for stage history
    const stageHistoryByDealId = new Map<string, typeof stageHistory>();
    for (const h of stageHistory ?? []) {
      const saleId = h.sale_id as string;
      const bucket = stageHistoryByDealId.get(saleId) ?? [];
      bucket.push(h);
      stageHistoryByDealId.set(saleId, bucket);
    }

    // Calculate probability for each deal
    const probabilities: Record<string, { probability: number; factors: string[] }> = {};

    for (const raw of deals || []) {
      const deal = raw as unknown as DealProbabilityInput;
      const dealHistory = stageHistoryByDealId.get(deal.id) ?? [];
      probabilities[deal.id] = computeDealProbability(deal, dealHistory);
    }

    console.info(
      'Calculated probabilities for',
      Object.keys(probabilities).length,
      'deals'
    );

    return new Response(JSON.stringify({ probabilities }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.error('Error calculating deal probabilities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
