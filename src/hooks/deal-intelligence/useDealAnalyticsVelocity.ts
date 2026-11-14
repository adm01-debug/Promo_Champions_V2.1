import { useQuery } from '@tanstack/react-query';
import { isOpenSaleStatus, isWonSaleStatus } from '@/constants';
import { supabase } from '@/integrations/supabase/client';
import { chunkedIn, type PostgrestLike } from '@/lib/supabase/chunkedIn';

interface StageVelocity {
  stage: string;
  avgDays: number;
  totalDeals: number;
  bottleneck: boolean;
  change?: number;
}

interface DealVelocityData {
  stages: StageVelocity[];
  totalAvgDays: number;
  totalChange?: number;
  fastestStage: string;
  slowestStage: string;
  overallAverage: number;
  stageVelocities: StageVelocity[];
  bottlenecks: string[];
  bySalesperson: SalespersonVelocity[];
}

export interface SalespersonVelocity {
  salespersonId: string;
  avgDays: number;
  wonDeals: number;
  openDeals: number;
}

interface VelocitySaleRow {
  status: string | null;
  created_at: string;
  updated_at: string;
  salesperson_id: string | null;
}

/** Dias entre criação e última atualização de um deal ganho (mínimo 1). */
const wonDealDurationDays = (s: VelocitySaleRow): number =>
  Math.max(
    1,
    Math.ceil(
      (new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

/**
 * Velocidade média (dias até ganhar) por vendedor, a partir das vendas do período.
 * Só entram vendedores com ao menos 1 deal ganho; ordenado do mais rápido ao mais lento.
 */
export function computeSalespersonVelocity(
  sales: VelocitySaleRow[]
): SalespersonVelocity[] {
  const map = new Map<string, { durations: number[]; openDeals: number }>();
  sales.forEach(s => {
    if (!s.salesperson_id) return;
    const entry = map.get(s.salesperson_id) ?? { durations: [], openDeals: 0 };
    if (isWonSaleStatus(s.status)) entry.durations.push(wonDealDurationDays(s));
    else if (isOpenSaleStatus(s.status)) entry.openDeals += 1;
    map.set(s.salesperson_id, entry);
  });

  return Array.from(map.entries())
    .filter(([, e]) => e.durations.length > 0)
    .map(([salespersonId, e]) => ({
      salespersonId,
      avgDays:
        Math.round((e.durations.reduce((a, b) => a + b, 0) / e.durations.length) * 10) /
        10,
      wonDeals: e.durations.length,
      openDeals: e.openDeals,
    }))
    .sort((a, b) => a.avgDays - b.avgDays);
}

/**
 * Hook for measuring deal velocity and identifying bottlenecks
 * Uses sales + deal_stage_history tables
 */
export const useDealVelocity = (salespersonId?: string, timeframe: number = 90) => {
  return useQuery<DealVelocityData>({
    queryKey: ['deal-velocity', salespersonId, timeframe],
    queryFn: async (): Promise<DealVelocityData> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      // Get sales
      let salesQuery = supabase
        .from('sales')
        .select('id, status, created_at, updated_at, salesperson_id')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (salespersonId) {
        salesQuery = salesQuery.eq('salesperson_id', salespersonId);
      }

      const { data: sales, error } = await salesQuery;
      if (error) throw error;

      const saleIds = (sales || []).map(s => s.id);

      // Get stage history
      type StageRow = {
        sale_id: string | null;
        stage: string;
        entered_at: string;
        exited_at: string | null;
      };
      const stageHistory =
        saleIds.length > 0
          ? await chunkedIn<StageRow>(
              saleIds,
              chunk =>
                supabase // eslint-disable-line no-restricted-syntax
                  .from('deal_stage_history')
                  .select('sale_id, stage, entered_at, exited_at')
                  .in('sale_id', chunk as string[]) as unknown as PostgrestLike<StageRow>,
              { parallel: true, label: 'deal-velocity.stage-history' }
            )
          : [];

      // Calculate velocities per stage
      const stageMap = new Map<string, number[]>();

      (stageHistory || []).forEach((history: StageRow) => {
        if (history.exited_at) {
          const entered = new Date(history.entered_at);
          const exited = new Date(history.exited_at);
          const days = Math.max(
            0.1,
            (exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (!stageMap.has(history.stage)) {
            stageMap.set(history.stage, []);
          }
          stageMap.get(history.stage)!.push(days);
        }
      });

      const stages: StageVelocity[] = Array.from(stageMap.entries())
        .map(([stage, days]) => {
          const avgDays = days.reduce((a, b) => a + b, 0) / days.length;
          return {
            stage,
            avgDays: Math.round(avgDays * 10) / 10,
            totalDeals: days.length,
            bottleneck: avgDays > 14,
          };
        })
        .sort((a, b) => b.avgDays - a.avgDays);

      // Calculate overall velocity from completed sales
      const completedSales = (sales || []).filter(s => isWonSaleStatus(s.status));
      const dealDurations = completedSales.map(wonDealDurationDays);

      const overallAverage =
        dealDurations.length > 0
          ? Math.round(
              dealDurations.reduce((sum, d) => sum + d, 0) / dealDurations.length
            )
          : 0;

      const totalAvgDays =
        stages.length > 0
          ? stages.reduce((sum, s) => sum + s.avgDays, 0)
          : overallAverage;

      const bottlenecks = stages.filter(s => s.bottleneck).map(s => s.stage);

      const fastestStage =
        stages.length > 0
          ? stages.reduce((min, s) => (s.avgDays < min.avgDays ? s : min)).stage
          : 'N/A';

      const slowestStage =
        stages.length > 0
          ? stages.reduce((max, s) => (s.avgDays > max.avgDays ? s : max)).stage
          : 'N/A';

      return {
        stages,
        totalAvgDays,
        fastestStage,
        slowestStage,
        overallAverage,
        stageVelocities: stages,
        bottlenecks,
        bySalesperson: computeSalespersonVelocity(sales || []),
      };
    },
    staleTime: 1000 * 60 * 60,
  });
};
