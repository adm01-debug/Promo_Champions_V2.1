import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  aggregateOptOutMetrics,
  type OptOutMetrics,
  type OptOutRecordLite,
} from './emailOptOutMetricsHelpers';

/** Limite defensivo para não trazer páginas gigantes ao cliente. */
const MAX_ROWS = 5000;
const WINDOW_DAYS = 90;

/**
 * Métricas agregadas da lista de supressão nos últimos 90 dias.
 * A agregação é feita por função pura testável (ver emailOptOutMetricsHelpers).
 */
export function useEmailOptOutMetrics() {
  return useQuery<OptOutMetrics>({
    queryKey: ['email-opt-out-metrics', WINDOW_DAYS],
    staleTime: 60_000,
    queryFn: async () => {
      const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from('email_opt_outs')
        .select('created_at, source')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(MAX_ROWS);

      if (error) throw new Error(error.message);
      return aggregateOptOutMetrics((data ?? []) as OptOutRecordLite[]);
    },
  });
}
