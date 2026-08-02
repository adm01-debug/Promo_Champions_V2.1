import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Recuperação agregada por campanha de e-mail em massa. */
export interface CampaignRecoveryRate {
  job_id: string;
  prompt: string | null;
  created_at: string;
  failed_total: number;
  recovered_count: number;
  still_failing: number;
  recovery_rate: number;
  avg_recovery_minutes: number;
}

/** Recuperação agregada por tipo de falha. */
export interface FailureTypeRecoveryRate {
  failure_type: string;
  failed_total: number;
  recovered_count: number;
  still_failing: number;
  recovery_rate: number;
  avg_recovery_minutes: number;
}

/** Coerção defensiva: PostgREST devolve numéricos como string em alguns casos. */
function num(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Taxa de recuperação por campanha (status antes/depois do reenvio),
 * calculada no banco via RPC `get_campaign_recovery_rates` (SECURITY DEFINER,
 * escopo dono da campanha ou admin).
 */
export function useCampaignRecoveryRates(days = 90) {
  return useQuery<CampaignRecoveryRate[]>({
    queryKey: ['campaign-recovery-rates', days],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_campaign_recovery_rates' as never,
        { _days: days } as never,
      );
      if (error) throw new Error(error.message);
      return ((data ?? []) as CampaignRecoveryRate[]).map((row) => ({
        ...row,
        failed_total: num(row.failed_total),
        recovered_count: num(row.recovered_count),
        still_failing: num(row.still_failing),
        recovery_rate: num(row.recovery_rate),
        avg_recovery_minutes: num(row.avg_recovery_minutes),
      }));
    },
  });
}

/** Taxa de recuperação por tipo de falha via RPC `get_recovery_by_failure_type`. */
export function useRecoveryByFailureType(days = 90) {
  return useQuery<FailureTypeRecoveryRate[]>({
    queryKey: ['recovery-by-failure-type', days],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_recovery_by_failure_type' as never,
        { _days: days } as never,
      );
      if (error) throw new Error(error.message);
      return ((data ?? []) as FailureTypeRecoveryRate[]).map((row) => ({
        ...row,
        failed_total: num(row.failed_total),
        recovered_count: num(row.recovered_count),
        still_failing: num(row.still_failing),
        recovery_rate: num(row.recovery_rate),
        avg_recovery_minutes: num(row.avg_recovery_minutes),
      }));
    },
  });
}
