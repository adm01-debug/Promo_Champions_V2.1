import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
          const days = Math.max(0.1, (exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24));

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
      const completedSales = (sales || []).filter(s => s.status === 'completed');
      const dealDurations = completedSales.map(s => {
        const created = new Date(s.created_at);
        const updated = new Date(s.updated_at);
        return Math.max(1, Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
      });

      const overallAverage = dealDurations.length > 0
        ? Math.round(dealDurations.reduce((sum, d) => sum + d, 0) / dealDurations.length)
        : 0;

      const totalAvgDays = stages.length > 0
        ? stages.reduce((sum, s) => sum + s.avgDays, 0)
        : overallAverage;

      const bottlenecks = stages.filter(s => s.bottleneck).map(s => s.stage);

      const fastestStage = stages.length > 0
        ? stages.reduce((min, s) => s.avgDays < min.avgDays ? s : min).stage
        : 'N/A';

      const slowestStage = stages.length > 0
        ? stages.reduce((max, s) => s.avgDays > max.avgDays ? s : max).stage
        : 'N/A';

      return {
        stages,
        totalAvgDays,
        fastestStage,
        slowestStage,
        overallAverage,
        stageVelocities: stages,
        bottlenecks,
      };
    },
    staleTime: 1000 * 60 * 60,
  });
};
