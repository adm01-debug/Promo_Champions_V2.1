import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/constants';


export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      return { revenue: 0, deals: 0, conversion: 0 };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
