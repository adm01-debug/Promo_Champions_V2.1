import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';

export const useClients = (filters?: { segment?: string }) => {
  return useQuery<Client[]>({
    queryKey: ['clients', filters],
    queryFn: async (): Promise<Client[]> => {
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.segment) {
        query = query.eq('segment', filters.segment);
      }
      
      return fetchWithErrorHandling(query);
    }
  });
};
