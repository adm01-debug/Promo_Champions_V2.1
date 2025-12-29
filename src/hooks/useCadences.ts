import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cadence } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';
import { CACHE_TIMES } from '@/constants';


export const useCadences = () => {
  return useQuery<Cadence[]>({
    queryKey: ['cadences'],
    queryFn: async (): Promise<Cadence[]> => {
      const query = supabase.from('cadences').select('*, steps(*)');
      return fetchWithErrorHandling(query);
    }
  ,
    staleTime: CACHE_TIMES.STALE_TIME
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
