import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/constants';
import { goalsService } from '@/services/goalsService';
import { CommercialGoal } from '@/types';

export const useGoals = (salespersonId?: string) => {
  return useQuery<CommercialGoal[]>({
    queryKey: ['goals', salespersonId],
    queryFn: () => goalsService.getGoals(salespersonId),
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
