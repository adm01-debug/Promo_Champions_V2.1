import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface ClosingTimeData {
  stage: string;
  avgDays: number;
  deals: number;
}

export const useClosingTime = () => {
  return useQuery({
    queryKey: ['closingTime'],
    queryFn: async (): Promise<ClosingTimeData[]> => {
      // Fetch deal stage history to calculate average time per stage
      const { data: stageHistory, error } = await supabase
        .from('deal_stage_history')
        .select('stage, entered_at, exited_at')
        .not('exited_at', 'is', null);

      if (error) throw error;

      if (!stageHistory || stageHistory.length === 0) {
        return [];
      }

      // Calculate average days per stage
      const stageStats: Record<string, { totalDays: number; count: number }> = {};

      stageHistory.forEach((record) => {
        const enteredAt = new Date(record.entered_at);
        const exitedAt = record.exited_at ? new Date(record.exited_at) : new Date();
        const days = Math.max(1, Math.round((exitedAt.getTime() - enteredAt.getTime()) / (1000 * 60 * 60 * 24)));

        if (!stageStats[record.stage]) {
          stageStats[record.stage] = { totalDays: 0, count: 0 };
        }
        stageStats[record.stage].totalDays += days;
        stageStats[record.stage].count += 1;
      });

      return Object.entries(stageStats).map(([stage, stats]) => ({
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        avgDays: Math.round(stats.totalDays / stats.count),
        deals: stats.count,
      }));
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
