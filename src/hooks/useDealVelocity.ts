import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StageVelocity {
  stage: string;
  averageDays: number;
  minDays: number;
  maxDays: number;
  dealsCount: number;
}

interface DealVelocityData {
  overallAverage: number;
  stageVelocities: StageVelocity[];
  bottlenecks: string[];
  fastestDeals: Array<{ id: string; days: number }>;
  slowestDeals: Array<{ id: string; days: number }>;
}

/**
 * Hook for measuring deal velocity and identifying bottlenecks
 * Uses sales + deal_stage_history tables (not 'deals')
 */
export const useDealVelocity = (timeframe: number = 90) => {
  return useQuery<DealVelocityData>({
    queryKey: ['deal-velocity', timeframe],
    queryFn: async (): Promise<DealVelocityData> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      // Get sales with stage history
      const { data: sales, error } = await supabase
        .from('sales')
        .select('id, status, created_at, updated_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const saleIds = (sales || []).map(s => s.id);

      // Get stage history for these sales
      const { data: stageHistory } = await supabase
        .from('deal_stage_history')
        .select('sale_id, stage, entered_at, exited_at')
        .in('sale_id', saleIds.length > 0 ? saleIds : ['none']);

      // Calculate velocities per stage
      const stageMap = new Map<string, number[]>();

      (stageHistory || []).forEach((history) => {
        if (history.exited_at) {
          const entered = new Date(history.entered_at);
          const exited = new Date(history.exited_at);
          const days = Math.max(1, Math.ceil(
            (exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)
          ));

          if (!stageMap.has(history.stage)) {
            stageMap.set(history.stage, []);
          }
          stageMap.get(history.stage)!.push(days);
        }
      });

      const stageVelocities: StageVelocity[] = Array.from(stageMap.entries())
        .map(([stage, days]) => ({
          stage,
          averageDays: Math.round(days.reduce((a, b) => a + b, 0) / days.length),
          minDays: Math.min(...days),
          maxDays: Math.max(...days),
          dealsCount: days.length,
        }))
        .sort((a, b) => b.averageDays - a.averageDays);

      // Identify bottlenecks (stages with >14 days average)
      const bottlenecks = stageVelocities
        .filter(sv => sv.averageDays > 14)
        .map(sv => sv.stage);

      // Calculate overall velocity from completed sales
      const completedSales = (sales || []).filter(s => s.status === 'completed');
      const dealDurations = completedSales.map(s => {
        const created = new Date(s.created_at);
        const updated = new Date(s.updated_at);
        return {
          id: s.id,
          days: Math.max(1, Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))),
        };
      });

      const overallAverage = dealDurations.length > 0
        ? Math.round(dealDurations.reduce((sum, d) => sum + d.days, 0) / dealDurations.length)
        : 0;

      dealDurations.sort((a, b) => a.days - b.days);

      return {
        overallAverage,
        stageVelocities,
        bottlenecks,
        fastestDeals: dealDurations.slice(0, 5),
        slowestDeals: dealDurations.slice(-5).reverse(),
      };
    },
    staleTime: 1000 * 60 * 60,
  });
};
