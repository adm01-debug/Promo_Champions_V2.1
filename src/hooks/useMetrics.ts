import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MetricData } from '@/types';

export const useMetrics = (userId?: string) => {
  return useQuery<MetricData[]>({
    queryKey: ['metrics', userId],
    queryFn: async (): Promise<MetricData[]> => {
      // Implementação de métricas
      return [];
    }
  ,
    staleTime: 5 * 60 * 1000
    gcTime: 10 * 60 * 1000,
  });
};
