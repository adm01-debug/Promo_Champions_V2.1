import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/constants';


export const useLeadScoring = (clientId?: string) => {
  return useQuery({
    queryKey: ['leadScoring', clientId],
    queryFn: async () => {
      return { score: 0, category: 'cold' };
    }
  ,
    staleTime: CACHE_TIMES.STALE_TIME
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
