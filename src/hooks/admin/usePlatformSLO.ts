/**
 * SLOs consolidados da plataforma (últimos 30 dias) via fn_admin_platform_slo().
 * Admin-only: a RPC valida via has_role().
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SLORow {
  day: string;
  webhook_success_ratio: number | null;
  webhook_success_target: number;
  webhook_sent_ok: number;
  webhook_failed: number;
  v4_callback_success_ratio: number | null;
  v4_callback_success_target: number;
  v4_callback_ok: number;
  v4_callback_failed: number;
  circuit_stability_ratio: number | null;
  circuit_stability_target: number;
  circuits_opened: number;
  circuit_events_total: number;
  error_free_ratio: number | null;
  error_free_target: number;
  critical_error_count: number;
  total_log_count: number;
}

export function usePlatformSLO() {
  return useQuery({
    queryKey: ['admin', 'platform-slo'],
    queryFn: async (): Promise<SLORow[]> => {
      const { data, error } = await supabase.rpc('fn_admin_platform_slo' as never);
      if (error) throw error;
      return (data ?? []) as SLORow[];
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
