import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import {
  normalizeDeliveryRow,
  type CampaignDeliveryStatRow,
} from '@/hooks/email/campaignDeliveryHelpers';

/**
 * Estatísticas de latência e vazão de entrega por campanha, calculadas no banco
 * via RPC `get_campaign_delivery_stats` (SECURITY DEFINER, escopo dono/admin).
 */
export function useCampaignDeliveryStats(days = 30) {
  return useQuery<CampaignDeliveryStatRow[]>({
    queryKey: ['campaign-delivery-stats', days],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_campaign_delivery_stats' as never,
        { _days: days } as never,
      );
      if (error) throw new Error(error.message);
      return ((data ?? []) as Partial<CampaignDeliveryStatRow>[]).map(normalizeDeliveryRow);
    },
  });
}
