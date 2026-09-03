import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';

/** Alerta de saúde de campanha registrado pelo monitor automático. */
export interface CampaignHealthAlert {
  id: string;
  job_id: string;
  alert_type: 'opt_out_rate' | 'stalled' | 'failure_rate';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metrics: Record<string, unknown>;
  created_at: string;
}

/** Últimos alertas automáticos de campanhas (escopo dono/admin via RLS). */
export function useCampaignHealthAlerts(limit = 20) {
  return useQuery<CampaignHealthAlert[]>({
    queryKey: ['campaign-health-alerts', limit],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_health_alerts' as never)
        .select('id, job_id, alert_type, severity, message, metrics, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      // eslint-disable-next-line no-restricted-syntax
      return (data ?? []) as unknown as CampaignHealthAlert[];
    },
  });
}
