import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  client_id: string;
  user_id: string;
  created_at: string;
  notes?: string;
}

export const useActivities = () => {
  return useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async (): Promise<Activity[]> => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Activity[];
    }
  });
};
