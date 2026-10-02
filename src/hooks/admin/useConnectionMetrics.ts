/**
 * Métricas operacionais dos painéis de Conexões/Observabilidade admin:
 * estatísticas de cron jobs, alertas de cron, série de rollbacks do banco.
 * Admin-only: as RPCs validam via has_role().
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CronRun {
  jobid: number;
  jobname: string | null;
  status: string;
  return_message: string | null;
  start_time: string;
  end_time: string | null;
  duration_ms: number | null;
}

export interface CronAlertMetrics {
  last_alert_at: string | null;
  window_24h: {
    alerts_total: number;
    alerts_stalled: number;
    alerts_failed: number;
    jobs_affected: number;
    raw_failures: number | null;
    dedupe_saved: number | null;
  };
  window_7d: {
    alerts_total: number;
    alerts_stalled: number;
    jobs_affected: number;
  };
  generated_at: string;
}

export interface CronAlertBreakdownRow {
  jobname: string;
  alerts: number;
  stalled: number;
  failed: number;
}

export interface RollbackPoint {
  captured_at: string;
  xact_commit: number;
  xact_rollback: number;
  deadlocks: number;
  rollbacks_per_min: number;
  commits_per_min: number;
  rollback_ratio_pct: number;
}

export function useCronJobStats(limit = 50) {
  return useQuery({
    queryKey: ['admin', 'cron-job-stats', limit],
    queryFn: async (): Promise<CronRun[]> => {
      const { data, error } = await supabase.rpc('admin_get_cron_job_stats', {
        _limit: limit,
      });
      if (error) throw error;
      return (data ?? []) as CronRun[];
    },
    staleTime: 30_000,
  });
}

export function useCronAlertMetrics() {
  return useQuery({
    queryKey: ['admin', 'cron-alert-metrics'],
    queryFn: async (): Promise<CronAlertMetrics> => {
      const { data, error } = await supabase.rpc('fn_admin_cron_alert_metrics');
      if (error) throw error;
      return data as never;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useCronAlertBreakdown() {
  return useQuery({
    queryKey: ['admin', 'cron-alert-breakdown'],
    queryFn: async (): Promise<CronAlertBreakdownRow[]> => {
      const { data, error } = await supabase.rpc(
        'fn_admin_cron_alert_breakdown' as never
      );
      if (error) throw error;
      return (data ?? []) as CronAlertBreakdownRow[];
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useRollbackRateSeries(hours = 24) {
  return useQuery({
    queryKey: ['admin', 'db-rollback-rate', hours],
    queryFn: async (): Promise<RollbackPoint[]> => {
      const { data, error } = await supabase.rpc('admin_get_rollback_rate_series', {
        _hours: hours,
      });
      if (error) throw error;
      return (data ?? []) as RollbackPoint[];
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}
