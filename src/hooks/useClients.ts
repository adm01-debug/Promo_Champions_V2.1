import type { Client } from '@/types';
import { CACHE_TIMES } from '@/constants';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface UseClientsOptions {
  segment?: string;
}

export const useClients = (filters?: UseClientsOptions) => {
  return useQuery<Client[]>({
    queryKey: ['clients', filters],
    queryFn: async (): Promise<Client[]> => {
      let query = supabase.from('clients').select('*');
      
      if (filters?.segment) {
        query = query.eq('segment', filters.segment);
      }
      
      return fetchWithErrorHandling<Client[]>(query);
    },
    staleTime: CACHE_TIMES.STALE_TIME, // 5 minutos
    gcTime: CACHE_TIMES.GC_TIME, // 10 minutos de cache
  });
};
