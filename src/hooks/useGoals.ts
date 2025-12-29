import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Goal } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';

export const useGoals = (userId?: string) => {
  return useQuery<Goal[]>({
    queryKey: ['goals', userId],
    queryFn: async (): Promise<Goal[]> => {
      let query = supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      return fetchWithErrorHandling(query);
    }
  ,
    staleTime: 5 * 60 * 1000
    gcTime: 10 * 60 * 1000, // 10 minutos de cache
  });
};
