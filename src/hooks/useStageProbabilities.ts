import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/constants';
import { fetchStageProbabilities } from '@/lib/stageProbabilities';

/**
 * Probabilidade por estágio/status de venda (fração 0-1) vinda da fonte única
 * public.stage_probabilities. Retorna Record<stage, probability>.
 */
export function useStageProbabilities() {
  return useQuery<Record<string, number>>({
    queryKey: ['stage-probabilities'],
    queryFn: fetchStageProbabilities,
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
