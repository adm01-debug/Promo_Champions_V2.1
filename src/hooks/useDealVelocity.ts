import {useQuery} from '@tanstack/react-query';
import { CACHE_TIMES } from '@/constants';

export const useDealVelocity = () => {
  return useQuery({
    queryKey: ['velocity'],
    queryFn: async () => {
      return 0;
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};