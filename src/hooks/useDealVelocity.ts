// @ts-nocheck
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
 * Calculates average time per stage and overall closing time
 */
export const useDealVelocity = (timeframe: number = 90) => {
  return useQuery<DealVelocityData>({
    queryKey: ['deal-velocity', timeframe],
    queryFn: async (): Promise<DealVelocityData> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      // Get all closed deals with stage history
      const { data: deals, error } = await supabase
        .from('deals')
        .select(`
          id,
          title,
          created_at,
          closed_at,
          status,
          pipeline_stage_histories(
            stage,
            entered_at,
            exited_at
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate velocities per stage
      const stageMap = new Map<string, number[]>();

      deals.forEach(deal => {
        const histories = deal.pipeline_stage_histories || [];
        
        histories.forEach((history: any) => {
          if (history.exited_at) {
            const entered = new Date(history.entered_at);
            const exited = new Date(history.exited_at);
            const days = Math.ceil(
              (exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (!stageMap.has(history.stage)) {
              stageMap.set(history.stage, []);
            }
            stageMap.get(history.stage)!.push(days);
          }
        });
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

      // Calculate overall velocity
      const closedDeals = deals.filter(d => d.closed_at);
      const dealDurations = closedDeals.map(d => {
        const created = new Date(d.created_at);
        const closed = new Date(d.closed_at);
        return {
          id: d.id,
          days: Math.ceil((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)),
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
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
