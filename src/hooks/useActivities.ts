import type { Activity } from '@/types';
import { CACHE_TIMES } from '@/constants';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface UseActivitiesOptions {
  userId?: string;
  clientId?: string;
}

export const useActivities = (filters?: UseActivitiesOptions) => {
  return useQuery<Activity[]>({
    queryKey: ['activities', filters],
    queryFn: async (): Promise<Activity[]> => {
      let query = supabase.from('activities').select('*');
      
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      
      return fetchWithErrorHandling<Activity[]>(query);
    },
    staleTime: CACHE_TIMES.STALE_TIME, // 5 minutos
    gcTime: CACHE_TIMES.GC_TIME, // 10 minutos de cache
  });
};
