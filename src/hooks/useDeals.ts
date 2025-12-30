import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import { useQuery } from '@tanstack/react-query';

// Deal interface matching sales table structure
export interface DealRecord {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  category: string;
  salesperson_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

interface UseDealsOptions {
  status?: string;
  userId?: string;
}

export const useDeals = (filters?: UseDealsOptions) => {
  return useQuery<DealRecord[]>({
    queryKey: ['deals', filters],
    queryFn: async (): Promise<DealRecord[]> => {
      let query = supabase.from('sales').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.userId) {
        query = query.eq('salesperson_id', filters.userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []) as DealRecord[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
