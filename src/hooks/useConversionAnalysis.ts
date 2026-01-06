import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConversionData {
  fromStage: string;
  toStage: string;
  rate: number;
  avgDays: number;
  count: number;
}

export const useConversionAnalysis = (timeframe: number = 90) => {
  return useQuery<ConversionData[]>({
    queryKey: ['conversion-analysis', timeframe],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      const { data: stages } = await supabase
        .from('deal_stage_history')
        .select('*')
        .gte('entered_at', startDate.toISOString());

      if (!stages) return [];

      const conversions = new Map<string, ConversionData>();

      stages.forEach((stage, idx) => {
        if (idx < stages.length - 1) {
          const next = stages[idx + 1];
          const key = `${stage.stage}->${next.stage}`;
          
          if (!conversions.has(key)) {
            conversions.set(key, {
              fromStage: stage.stage,
              toStage: next.stage,
              rate: 0,
              avgDays: 0,
              count: 0,
            });
          }

          const data = conversions.get(key)!;
          data.count++;
          const days = (new Date(next.entered_at).getTime() - new Date(stage.entered_at).getTime()) / (1000 * 60 * 60 * 24);
          data.avgDays = (data.avgDays * (data.count - 1) + days) / data.count;
        }
      });

      return Array.from(conversions.values());
    },
  });
};
