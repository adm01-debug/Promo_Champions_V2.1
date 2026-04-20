import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WinLossFilterState } from "@/components/win-loss/winLossFiltersHelpers";
import type { WLAnalysisRow } from "./useWinLossData";
import { useWLKpis, type WLKpis } from "./useWinLossAggregations";

/**
 * Busca KPIs da janela equivalente IMEDIATAMENTE anterior (mesma duração).
 * Usado para calcular Δ% nos cards de KPI.
 */
export const usePreviousPeriodKpis = (filters: WinLossFilterState) => {
  return useQuery({
    queryKey: ["wl-prev-period", filters.period, filters.segments, filters.salespersonIds, filters.minAmount, filters.maxAmount],
    queryFn: async (): Promise<WLAnalysisRow[]> => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - filters.period * 2);
      const end = new Date(now);
      end.setDate(end.getDate() - filters.period);

      let q = supabase
        .from("win_loss_analyses")
        .select("id,sale_id,outcome,primary_reason,competitor,lost_stage,cycle_days,amount,segment,analyzed_at")
        .gte("analyzed_at", start.toISOString())
        .lt("analyzed_at", end.toISOString())
        .limit(2000);
      if (filters.segments.length) q = q.in("segment", filters.segments);
      if (filters.minAmount != null) q = q.gte("amount", filters.minAmount);
      if (filters.maxAmount != null) q = q.lte("amount", filters.maxAmount);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as WLAnalysisRow[];
    },
    staleTime: 60_000,
  });
};

export interface KpiDelta {
  winRate: number;
  total: number;
  avgCycleWon: number;
  avgAmountWon: number;
}

/** % delta com sinal (positivo = melhorou). */
export const computeKpiDelta = (current: WLKpis, previous: WLKpis): KpiDelta => {
  const pct = (cur: number, prev: number): number => {
    if (!prev) return cur ? 100 : 0;
    return ((cur - prev) / Math.abs(prev)) * 100;
  };
  return {
    winRate: pct(current.winRate, previous.winRate),
    total: pct(current.total, previous.total),
    avgCycleWon: -pct(current.avgCycleWon, previous.avgCycleWon), // menor é melhor
    avgAmountWon: pct(current.avgAmountWon, previous.avgAmountWon),
  };
};

export const usePreviousKpisComputed = (filters: WinLossFilterState): { kpis: WLKpis; isLoading: boolean } => {
  const { data = [], isLoading } = usePreviousPeriodKpis(filters);
  const kpis = useWLKpis(data);
  return { kpis, isLoading };
};
