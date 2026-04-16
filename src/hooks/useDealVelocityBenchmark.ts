import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface StageBenchmark {
  stage: string;
  avgDays: number;
  medianDays: number;
  p90Days: number;
  totalSamples: number;
}

export interface DealVelocityBenchmarkData {
  benchmarks: StageBenchmark[];
  overallAvgDays: number;
  overallMedianDays: number;
  totalDealsAnalyzed: number;
}

/**
 * Hook providing benchmark statistics (avg/median/p90) per pipeline stage
 * across the entire organization for comparison purposes.
 */
export const useDealVelocityBenchmark = (timeframeDays: number = 90) => {
  return useQuery<DealVelocityBenchmarkData>({
    queryKey: ['deal-velocity-benchmark', timeframeDays],
    queryFn: async (): Promise<DealVelocityBenchmarkData> => {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - timeframeDays);

      const { data, error } = await supabase
        .from('deal_stage_history')
        .select('stage, entered_at, exited_at')
        .gte('entered_at', sinceDate.toISOString())
        .not('exited_at', 'is', null);

      if (error) throw error;

      const stageGroups: Record<string, number[]> = {};
      (data || []).forEach((row) => {
        if (!row.exited_at) return;
        const days =
          (new Date(row.exited_at).getTime() - new Date(row.entered_at).getTime()) /
          (1000 * 60 * 60 * 24);
        if (!stageGroups[row.stage]) stageGroups[row.stage] = [];
        stageGroups[row.stage].push(days);
      });

      const percentile = (arr: number[], p: number): number => {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const idx = Math.floor((p / 100) * (sorted.length - 1));
        return sorted[idx];
      };

      const benchmarks: StageBenchmark[] = Object.entries(stageGroups).map(
        ([stage, days]) => ({
          stage,
          avgDays: Math.round((days.reduce((a, b) => a + b, 0) / days.length) * 10) / 10,
          medianDays: Math.round(percentile(days, 50) * 10) / 10,
          p90Days: Math.round(percentile(days, 90) * 10) / 10,
          totalSamples: days.length,
        }),
      );

      const allDays = Object.values(stageGroups).flat();
      const overallAvgDays =
        allDays.length > 0
          ? Math.round((allDays.reduce((a, b) => a + b, 0) / allDays.length) * 10) / 10
          : 0;
      const overallMedianDays = Math.round(percentile(allDays, 50) * 10) / 10;

      return {
        benchmarks,
        overallAvgDays,
        overallMedianDays,
        totalDealsAnalyzed: allDays.length,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
