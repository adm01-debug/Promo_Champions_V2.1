import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Deal } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';
import { CACHE_TIMES } from '@/constants';


interface UseDealsOptions {
  status?: string;
  userId?: string;
}

export const useDeals = (filters?: UseDealsOptions) => {
  return useQuery<Deal[]>({
    queryKey: ['deals', filters],
    queryFn: async (): Promise<Deal[]> => {
      let query = supabase.from('deals').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      return fetchWithErrorHandling<Deal[]>(query);
    },
    staleTime: CACHE_TIMES.STALE_TIME, // 5 minutos
    gcTime: CACHE_TIMES.GC_TIME, // 10 minutos de cache
  });
};
