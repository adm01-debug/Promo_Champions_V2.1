import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, differenceInHours } from 'date-fns';

interface StageVelocity {
  stage: string;
  avgDays: number;
  avgHours: number;
  totalDeals: number;
  bottleneck: boolean;
}

interface DealVelocityData {
  stages: StageVelocity[];
  totalAvgDays: number;
  fastestStage: string;
  slowestStage: string;
}

const STAGE_ORDER = ['lead', 'qualificado', 'proposta', 'negociacao', 'fechado'];
const STAGE_LABELS: Record<string, string> = {
  'lead': 'Lead',
  'qualificado': 'Qualificado',
  'proposta': 'Proposta',
  'negociacao': 'Negociação',
  'fechado': 'Fechado'
};

export function useDealVelocity(salespersonId?: string) {
  return useQuery({
    queryKey: ['deal-velocity', salespersonId],
    queryFn: async (): Promise<DealVelocityData> => {
      let query = supabase
        .from('deal_stage_history')
        .select(`
          *,
          sales:sale_id (salesperson_id)
        `)
        .order('entered_at', { ascending: true });

      const { data: history, error } = await query;

      if (error) throw error;

      // Filter by salesperson if provided
      const filteredHistory = salespersonId
        ? history?.filter(h => (h.sales as any)?.salesperson_id === salespersonId)
        : history;

      // Calculate time spent in each stage
      const stageTimes: Record<string, number[]> = {};
      
      filteredHistory?.forEach(record => {
        if (record.exited_at) {
          const hours = differenceInHours(
            new Date(record.exited_at),
            new Date(record.entered_at)
          );
          if (!stageTimes[record.stage]) stageTimes[record.stage] = [];
          stageTimes[record.stage].push(hours);
        }
      });

      // Calculate averages per stage
      const stages: StageVelocity[] = STAGE_ORDER.map(stage => {
        const times = stageTimes[stage] || [];
        const avgHours = times.length > 0 
          ? times.reduce((a, b) => a + b, 0) / times.length 
          : 0;
        return {
          stage: STAGE_LABELS[stage] || stage,
          avgDays: avgHours / 24,
          avgHours,
          totalDeals: times.length,
          bottleneck: false
        };
      });

      // Mark bottleneck (slowest stage with deals)
      const stagesWithDeals = stages.filter(s => s.totalDeals > 0);
      if (stagesWithDeals.length > 0) {
        const maxAvg = Math.max(...stagesWithDeals.map(s => s.avgDays));
        stages.forEach(s => {
          if (s.avgDays === maxAvg && s.totalDeals > 0) s.bottleneck = true;
        });
      }

      const totalAvgDays = stages.reduce((acc, s) => acc + s.avgDays, 0);
      const fastestStage = stagesWithDeals.length > 0
        ? stagesWithDeals.reduce((a, b) => a.avgDays < b.avgDays ? a : b).stage
        : '-';
      const slowestStage = stagesWithDeals.length > 0
        ? stagesWithDeals.reduce((a, b) => a.avgDays > b.avgDays ? a : b).stage
        : '-';

      return {
        stages,
        totalAvgDays,
        fastestStage,
        slowestStage
      };
    }
  });
}
