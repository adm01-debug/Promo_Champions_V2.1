import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClosingTimeData {
  stage: string;
  avgDays: number;
  deals: number;
}

export const useClosingTime = () => {
  return useQuery<ClosingTimeData[]>({
    queryKey: ['closing-time'],
    queryFn: async () => {
      const { data: stageHistory, error } = await supabase
        .from('deal_stage_history')
        .select('stage, entered_at, exited_at, sale_id')
        .not('exited_at', 'is', null);

      if (error) throw error;
      if (!stageHistory || stageHistory.length === 0) return [];

      // Group by stage and calculate average days
      const stageMap = new Map<string, { totalDays: number; count: number }>();

      stageHistory.forEach((record) => {
        if (!record.exited_at || !record.entered_at) return;
        const entered = new Date(record.entered_at);
        const exited = new Date(record.exited_at);
        const days = Math.max(1, Math.ceil((exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)));

        const existing = stageMap.get(record.stage) || { totalDays: 0, count: 0 };
        stageMap.set(record.stage, {
          totalDays: existing.totalDays + days,
          count: existing.count + 1,
        });
      });

      const stageOrder = ['lead', 'prospecting', 'qualified', 'proposal', 'negotiation', 'won', 'closed'];
      
      return Array.from(stageMap.entries())
        .map(([stage, { totalDays, count }]) => ({
          stage: stage.charAt(0).toUpperCase() + stage.slice(1),
          avgDays: Math.round(totalDays / count),
          deals: count,
        }))
        .sort((a, b) => {
          const aIdx = stageOrder.indexOf(a.stage.toLowerCase());
          const bIdx = stageOrder.indexOf(b.stage.toLowerCase());
          return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
        });
    },
    staleTime: 1000 * 60 * 5,
  });
};
