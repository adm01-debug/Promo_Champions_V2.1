import {useQuery} from '@tanstack/react-query';
import { CACHE_TIMES } from '@/constants';

export const useWinLossAnalysis = () => {
  return useQuery({
    queryKey: ['winLoss'],
    queryFn: async () => {
      return { won: 0, lost: 0 };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};