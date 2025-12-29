import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pipeline } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';

export const usePipeline = () => {
  return useQuery<Pipeline[]>({
    queryKey: ['pipeline'],
    queryFn: async (): Promise<Pipeline[]> => {
      const query = supabase.from('pipelines').select('*, stages(*)');
      return fetchWithErrorHandling(query);
    }
  ,
    staleTime: 5 * 60 * 1000
  });
};
