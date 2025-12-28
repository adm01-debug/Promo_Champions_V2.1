import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FunnelStage {
  id: string;
  name: string;
  dealsCount: number;
  totalValue: number;
  conversionRate: number;
  avgDaysInStage: number;
}

export const useFunnelData = () => {
  return useQuery<FunnelStage[]>({
    queryKey: ['funnel-data'],
    queryFn: async (): Promise<FunnelStage[]> => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select(`id, name, order, deals(id, value, stage_entered_at)`);
      
      if (error) throw error;
      if (!data) return [];
      
      const stages = data.map((stage, index, array) => {
        const deals = stage.deals || [];
        const totalValue = deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
        
        const nextStage = array[index + 1];
        const nextStageDeals = nextStage?.deals?.length || 0;
        const conversionRate = deals.length > 0 && nextStageDeals > 0
          ? (nextStageDeals / deals.length) * 100
          : 0;
        
        return {
          id: stage.id,
          name: stage.name,
          dealsCount: deals.length,
          totalValue,
          conversionRate,
          avgDaysInStage: 0
        };
      });
      
      return stages;
    }
  });
};
