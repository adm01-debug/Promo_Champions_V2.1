import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePipeline() {
  return useQuery({
    queryKey: ['pipeline'],
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase.from('deals').select('*');
      if (error) throw error;
      return data ?? [];
    }
  });
}
