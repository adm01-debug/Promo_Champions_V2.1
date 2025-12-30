import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface StageVelocity {
  stage: string;
  avgDays: number;
  totalDeals: number;
  bottleneck: boolean;
  change?: number;
}

export interface DealVelocityData {
  stages: StageVelocity[];
  totalAvgDays: number;
  totalChange?: number;
  fastestStage: string;
  slowestStage: string;
}

const PIPELINE_STAGES = ['Lead', 'Qualificado', 'Proposta', 'Negociação', 'Fechado'];

export const useDealVelocity = (salespersonId?: string) => {
  return useQuery<DealVelocityData>({
    queryKey: ['deal-velocity', salespersonId],
    queryFn: async (): Promise<DealVelocityData> => {
      // Get deal stage history
      let query = supabase
        .from('deal_stage_history')
        .select(`
          *,
          sale:sales(salesperson_id, status)
        `)
        .not('exited_at', 'is', null);
      
      const { data: history, error } = await query;
      
      if (error) throw error;
      
      // Calculate average days per stage
      const stageStats: Record<string, { totalDays: number; count: number }> = {};
      
      PIPELINE_STAGES.forEach(stage => {
        stageStats[stage] = { totalDays: 0, count: 0 };
      });
      
      (history || []).forEach(h => {
        if (salespersonId && (h.sale as any)?.salesperson_id !== salespersonId) {
          return;
        }
        
        const enteredAt = new Date(h.entered_at);
        const exitedAt = new Date(h.exited_at!);
        const daysInStage = (exitedAt.getTime() - enteredAt.getTime()) / (1000 * 60 * 60 * 24);
        
        if (stageStats[h.stage]) {
          stageStats[h.stage].totalDays += daysInStage;
          stageStats[h.stage].count++;
        }
      });
      
      const stages: StageVelocity[] = PIPELINE_STAGES.map(stage => {
        const stats = stageStats[stage];
        const avgDays = stats.count > 0 ? stats.totalDays / stats.count : 0;
        return {
          stage,
          avgDays,
          totalDeals: stats.count,
          bottleneck: false,
        };
      });
      
      // Find bottleneck (slowest stage with deals)
      const stagesWithDeals = stages.filter(s => s.totalDeals > 0);
      if (stagesWithDeals.length > 0) {
        const maxAvgDays = Math.max(...stagesWithDeals.map(s => s.avgDays));
        stages.forEach(s => {
          if (s.avgDays === maxAvgDays && s.totalDeals > 0) {
            s.bottleneck = true;
          }
        });
      }
      
      const totalAvgDays = stages.reduce((acc, s) => acc + s.avgDays, 0);
      const fastestStage = stagesWithDeals.length > 0 
        ? stagesWithDeals.reduce((a, b) => a.avgDays < b.avgDays ? a : b).stage 
        : PIPELINE_STAGES[0];
      const slowestStage = stagesWithDeals.length > 0 
        ? stagesWithDeals.reduce((a, b) => a.avgDays > b.avgDays ? a : b).stage 
        : PIPELINE_STAGES[0];
      
      return {
        stages,
        totalAvgDays,
        fastestStage,
        slowestStage,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
