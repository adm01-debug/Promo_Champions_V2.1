import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface DealFullView {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  category: string;
  source: string | null;
  salesperson_id: string | null;
  salesperson_name: string | null;
  created_at: string;
  updated_at: string;
  days_in_stage: number;
  current_stage_entered_at: string | null;
  total_stage_changes: number;
  weighted_value: number;
}

interface UseDealsFullViewOptions {
  salespersonId?: string;
  stage?: string;
  limit?: number;
}

const STAGE_PROBABILITY: Record<string, number> = {
  lead: 0.1,
  pending: 0.1,
  qualified: 0.25,
  in_progress: 0.25,
  proposal: 0.5,
  negotiation: 0.75,
  closed: 1.0,
  completed: 1.0,
};

/**
 * Hook returning a fully enriched view of deals with stage history,
 * weighted value, and salesperson details for analytics screens.
 */
export const useDealsFullView = (options: UseDealsFullViewOptions = {}) => {
  const { salespersonId, stage, limit = 500 } = options;

  return useQuery<DealFullView[]>({
    queryKey: ['deals-full-view', salespersonId, stage, limit],
    queryFn: async (): Promise<DealFullView[]> => {
      let query = supabase
        .from('sales')
        .select('*, salespeople:salespeople!salesperson_id(name)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (salespersonId) query = query.eq('salesperson_id', salespersonId);
      if (stage) query = query.eq('status', stage);

      const { data: deals, error } = await query;
      if (error) throw error;

      const dealIds = (deals || []).map((d) => d.id);
      const { data: history } = await supabase
        .from('deal_stage_history')
        .select('sale_id, stage, entered_at, exited_at')
        .in('sale_id', dealIds);

      const historyMap = new Map<string, { entered_at: string; exited_at: string | null }[]>();
      (history || []).forEach((h) => {
        if (!h.sale_id) return;
        const arr = historyMap.get(h.sale_id) ?? [];
        arr.push({ entered_at: h.entered_at, exited_at: h.exited_at });
        historyMap.set(h.sale_id, arr);
      });

      const now = Date.now();
      return (deals || []).map((row) => {
        const sp = (row as { salespeople?: { name: string } | null }).salespeople;
        const dealHistory = historyMap.get(row.id) || [];
        const currentEntry = dealHistory.find((h) => !h.exited_at);
        const currentEnteredAt: string = currentEntry?.entered_at ?? row.updated_at ?? row.created_at;
        const daysInStage = Math.floor(
          (now - new Date(currentEnteredAt).getTime()) / (1000 * 60 * 60 * 24),
        );
        const probability = STAGE_PROBABILITY[row.status] ?? 0.1;

        return {
          id: row.id,
          client_name: row.client_name,
          product_name: row.product_name,
          amount: Number(row.amount),
          status: row.status,
          category: row.category,
          source: row.source,
          salesperson_id: row.salesperson_id,
          salesperson_name: sp?.name ?? null,
          created_at: row.created_at,
          updated_at: row.updated_at,
          days_in_stage: daysInStage,
          current_stage_entered_at: currentEnteredAt,
          total_stage_changes: dealHistory.length,
          weighted_value: Math.round(Number(row.amount) * probability),
        };
      });
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
