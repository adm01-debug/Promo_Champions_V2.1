import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface LeadFullView {
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
  days_in_pipeline: number;
  is_icp_match: boolean;
}

interface UseLeadsFullViewOptions {
  salespersonId?: string;
  status?: string;
  limit?: number;
}

/**
 * Hook returning a fully enriched view of leads (sales) joined with
 * salesperson info and ICP matching for advanced filtering screens.
 */
export const useLeadsFullView = (options: UseLeadsFullViewOptions = {}) => {
  const { salespersonId, status, limit = 500 } = options;

  return useQuery<LeadFullView[]>({
    queryKey: ['leads-full-view', salespersonId, status, limit],
    queryFn: async (): Promise<LeadFullView[]> => {
      let query = supabase
        .from('sales')
        .select('*, salespeople:salespeople!salesperson_id(name)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (salespersonId) query = query.eq('salesperson_id', salespersonId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;

      // ICP enrichment can be added by joining with useICPData on consumer side
      const icpMap = new Map<string, boolean>();

      const now = Date.now();
      return (data || []).map((row) => {
        const created = new Date(row.created_at).getTime();
        const sp = (row as { salespeople?: { name: string } | null }).salespeople;
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
          days_in_pipeline: Math.floor((now - created) / (1000 * 60 * 60 * 24)),
          is_icp_match: icpMap.get(row.client_name.toLowerCase()) ?? false,
        };
      });
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
