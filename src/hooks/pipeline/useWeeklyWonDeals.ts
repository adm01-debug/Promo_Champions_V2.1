import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { WON_SALE_STATUSES } from '@/constants';

/** Janela (em dias) usada pelo indicador de vendas ganhas do pipeline. */
export const WEEKLY_WON_DEALS_WINDOW_DAYS = 7;

/**
 * Conta as vendas ganhas (status de ganho, não excluídas) fechadas nos
 * últimos 7 dias. Usa `closed_at`, carimbado pelo trigger
 * `trg_sales_stamp_closed_at` na transição para ganho. RLS define o escopo.
 */
export function useWeeklyWonDeals() {
  return useQuery<number>({
    // Prefixo ['sales'] é invalidado ao mover deal no pipeline (usePipeline/useMultiplePipelines).
    queryKey: ['sales', 'weekly-won-deals'],
    queryFn: async () => {
      const since = subDays(new Date(), WEEKLY_WON_DEALS_WINDOW_DAYS).toISOString();
      const { count, error } = await supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .in('status', [...WON_SALE_STATUSES])
        .is('deleted_at', null)
        .gte('closed_at', since);
      if (error) throw error;
      return count ?? 0;
    },
  });
}
