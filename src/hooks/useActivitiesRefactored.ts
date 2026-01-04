import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

export function useActivities() {
  return useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async (): Promise<Activity[]> => {
      const { data, error } = await supabase.from('activities').select('*');
      if (error) throw error;
      return data ?? [];
    }
  });
}
