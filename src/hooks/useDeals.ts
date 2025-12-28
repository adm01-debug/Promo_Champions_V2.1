import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deal } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';

export const useDeals = (filters?: { status?: string; userId?: string }) => {
  return useQuery<Deal[]>({
    queryKey: ['deals', filters],
    queryFn: async (): Promise<Deal[]> => {
      let query = supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.userId) {
        query = query.eq('assigned_to', filters.userId);
      }
      
      return fetchWithErrorHandling(query);
    }
  });
};
