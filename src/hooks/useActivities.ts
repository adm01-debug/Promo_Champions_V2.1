import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';

export const useActivities = (filters?: { userId?: string; clientId?: string }) => {
  return useQuery<Activity[]>({
    queryKey: ['activities', filters],
    queryFn: async (): Promise<Activity[]> => {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      
      return fetchWithErrorHandling(query);
    }
  });
};
