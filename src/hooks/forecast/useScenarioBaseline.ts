import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/supabase/fetchAllRows';
import {
  LOST_SALE_STATUSES,
  WON_SALE_STATUSES,
  isLostSaleStatus,
  isWonSaleStatus,
} from '@/constants';

/** Janela da base do simulador: o card projeta receita trimestral. */
export const SCENARIO_BASELINE_DAYS = 90;

export interface ScenarioBaselineRow {
  amount: number | string | null;
  status: string | null;
  salesperson_id: string | null;
  created_at: string;
  closed_at: string | null;
}

export interface ScenarioBaseline {
  /** Soma de `sales.amount` com status ganho na janela. */
  wonRevenue: number;
  wonCount: number;
  lostCount: number;
  /** Ganhas / (ganhas + perdidas) em %, ou null sem negócio fechado. */
  winRate: number | null;
  /** Vendedores distintos com ao menos uma venda ganha na janela. */
  sellersWithWins: number;
  /** Receita ganha média por vendedor com venda na janela, ou null. */
  revenuePerSeller: number | null;
}

/**
 * Agrega a base real do simulador. A data de referência é `closed_at`
 * (fechamento) e cai para `created_at` em vendas legadas sem fechamento.
 */
export function computeScenarioBaseline(
  rows: ScenarioBaselineRow[],
  start: Date
): ScenarioBaseline {
  let wonRevenue = 0;
  let wonCount = 0;
  let lostCount = 0;
  const sellers = new Set<string>();

  for (const row of rows) {
    const refDate = new Date(row.closed_at ?? row.created_at);
    if (Number.isNaN(refDate.getTime()) || refDate < start) continue;
    if (isWonSaleStatus(row.status)) {
      wonRevenue += Number(row.amount) || 0;
      wonCount += 1;
      if (row.salesperson_id) sellers.add(row.salesperson_id);
    } else if (isLostSaleStatus(row.status)) {
      lostCount += 1;
    }
  }

  const closed = wonCount + lostCount;
  return {
    wonRevenue,
    wonCount,
    lostCount,
    winRate: closed > 0 ? (wonCount / closed) * 100 : null,
    sellersWithWins: sellers.size,
    revenuePerSeller: sellers.size > 0 ? wonRevenue / sellers.size : null,
  };
}

/**
 * Base real do Simulador de Cenários: receita ganha, win-rate e vendedores
 * com venda nos últimos 90 dias (respeita a RLS de `sales`).
 */
export function useScenarioBaseline() {
  return useQuery<ScenarioBaseline>({
    queryKey: ['scenario-baseline', SCENARIO_BASELINE_DAYS],
    queryFn: async () => {
      const start = subDays(new Date(), SCENARIO_BASELINE_DAYS);
      const startIso = start.toISOString();
      const rows = await fetchAllRows<ScenarioBaselineRow>(
        (from, to) =>
          supabase
            .from('sales')
            .select('amount, status, salesperson_id, created_at, closed_at')
            .in('status', [...WON_SALE_STATUSES, ...LOST_SALE_STATUSES])
            .is('deleted_at', null)
            .or(`closed_at.gte.${startIso},created_at.gte.${startIso}`)
            .order('id')
            .range(from, to),
        { label: 'useScenarioBaseline:sales' }
      );
      return computeScenarioBaseline(rows, start);
    },
    staleTime: 5 * 60_000,
  });
}
