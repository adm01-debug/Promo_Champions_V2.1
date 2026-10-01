/**
 * Web vitals agregados por rota + device via fn_admin_web_vitals_p75()
 * (P75 vs budget: LCP > 2.5s, CLS > 0.1, INP > 200ms).
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WebVitalRow {
  day: string;
  route: string;
  device_type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  metric_name: string;
  samples: number;
  p50: number | null;
  p75: number | null;
  p95: number | null;
  budget_p75: number | null;
}

export function useWebVitalsP75() {
  return useQuery({
    queryKey: ['admin', 'web-vitals-p75'],
    queryFn: async (): Promise<WebVitalRow[]> => {
      const { data, error } = await supabase.rpc('fn_admin_web_vitals_p75' as never);
      if (error) throw error;
      return (data ?? []) as WebVitalRow[];
    },
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}
