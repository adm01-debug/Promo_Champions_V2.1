import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MetricData } from '@/types';
import { CACHE_TIMES } from '@/constants';


export const useMetrics = (userId?: string) => {
  return useQuery<MetricData[]>({
    queryKey: ['metrics', userId],
    queryFn: async (): Promise<MetricData[]> => {
      // Implementação de métricas
      return [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
