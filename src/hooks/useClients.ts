import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Client } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';

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
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
