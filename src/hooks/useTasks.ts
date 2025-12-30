import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';
import { CACHE_TIMES } from '@/constants';


export const useTasks = (userId?: string) => {
  return useQuery<Task[]>({
    queryKey: ['tasks', userId],
    queryFn: async (): Promise<Task[]> => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('assigned_to', userId);
      }

      return fetchWithErrorHandling(query);
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME, // 10 minutos de cache
  });
};
