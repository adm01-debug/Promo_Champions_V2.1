import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Cadence {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
}

export const useCadences = () => {
  return useQuery<Cadence[]>({
    queryKey: ['cadences'],
    queryFn: async (): Promise<Cadence[]> => {
      const { data, error } = await supabase
        .from('cadences')
        .select('*')
        .eq('active', true);
      
      if (error) throw error;
      return (data || []) as Cadence[];
    }
  });
};
