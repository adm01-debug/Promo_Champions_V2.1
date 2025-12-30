import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface Goal {
  id: string;
  salesperson_id: string;
  month: string;
  goal_amount: number;
  created_at: string;
}

export const useGoals = (salespersonId?: string) => {
  return useQuery<Goal[]>({
    queryKey: ['goals', salespersonId],
    queryFn: async (): Promise<Goal[]> => {
      let query = supabase
        .from('sales_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (salespersonId) {
        query = query.eq('salesperson_id', salespersonId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Goal[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
