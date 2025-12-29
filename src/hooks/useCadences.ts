import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cadence } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';

export const useCadences = () => {
  return useQuery<Cadence[]>({
    queryKey: ['cadences'],
    queryFn: async (): Promise<Cadence[]> => {
      const query = supabase.from('cadences').select('*, steps(*)');
      return fetchWithErrorHandling(query);
    }
  ,
    staleTime: 5 * 60 * 1000
    gcTime: 10 * 60 * 1000,
  });
};
