import type { Deal } from '@/types';
import { CACHE_TIMES } from '@/constants';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface UseDealsOptions {
  status?: string;
  userId?: string;
}

export const useDeals = (filters?: UseDealsOptions) => {
  return useQuery<Deal[]>({
    queryKey: ['deals', filters],
    queryFn: async (): Promise<Deal[]> => {
      let query = supabase.from('sales').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.userId) {
        query = query.eq('salesperson_id', filters.userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map sales to deals format
      return (data || []).map(sale => ({
        id: sale.id,
        title: sale.product_name,
        client_name: sale.client_name,
        amount: sale.amount,
        status: sale.status,
        category: sale.category,
        created_at: sale.created_at,
        updated_at: sale.updated_at,
        salesperson_id: sale.salesperson_id,
        product_name: sale.product_name,
      })) as Deal[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
