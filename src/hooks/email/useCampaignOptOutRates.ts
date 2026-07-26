import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Linha agregada de taxa de descadastro por campanha de e-mail em massa. */
export interface CampaignOptOutRate {
  job_id: string;
  prompt: string;
  created_at: string;
  sent_count: number;
  opted_out_count: number;
  opt_out_rate: number;
}

/** Limite de risco (%) acima do qual a campanha deve ser revisada. */
export const OPT_OUT_RISK_THRESHOLD = 2;

/**
 * Taxa de descadastro por campanha, calculada no banco via RPC
 * `get_campaign_optout_rates` (SECURITY DEFINER, escopo dono/admin).
 */
export function useCampaignOptOutRates(days = 90) {
  return useQuery<CampaignOptOutRate[]>({
    queryKey: ['campaign-opt-out-rates', days],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_campaign_optout_rates' as never,
        { _days: days } as never,
      );
      if (error) throw new Error(error.message);
      return ((data ?? []) as CampaignOptOutRate[]).map((row) => ({
        ...row,
        sent_count: Number(row.sent_count ?? 0),
        opted_out_count: Number(row.opted_out_count ?? 0),
        opt_out_rate: Number(row.opt_out_rate ?? 0),
      }));
    },
  });
}
