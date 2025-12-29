import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Activity } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';

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
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos de cache
  });
};
