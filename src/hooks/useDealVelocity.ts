import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInHours, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface StageVelocity {
  stage: string;
  avgDays: number;
  avgHours: number;
  totalDeals: number;
  bottleneck: boolean;
  previousAvgDays?: number;
  change?: number;
}

interface DealVelocityData {
  stages: StageVelocity[];
  totalAvgDays: number;
  fastestStage: string;
  slowestStage: string;
  previousTotalAvgDays?: number;
  totalChange?: number;
}

const STAGE_ORDER = ['lead', 'qualificado', 'proposta', 'negociacao', 'fechado'];
const STAGE_LABELS: Record<string, string> = {
  'lead': 'Lead',
  'qualificado': 'Qualificado',
  'proposta': 'Proposta',
  'negociacao': 'Negociação',
  'fechado': 'Fechado'
};

function calculateVelocityData(history: any[], salespersonId?: string): { stages: StageVelocity[]; totalAvgDays: number; fastestStage: string; slowestStage: string } {
  const filteredHistory = salespersonId
    ? history?.filter(h => (h.sales as any)?.salesperson_id === salespersonId)
    : history;

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

  return { stages, totalAvgDays, fastestStage, slowestStage };
}

export function useDealVelocity(salespersonId?: string, enableComparison = true) {
  return useQuery({
    queryKey: ['deal-velocity', salespersonId, enableComparison],
    queryFn: async (): Promise<DealVelocityData> => {
      const now = new Date();
      const currentStart = startOfMonth(now);
      const currentEnd = endOfMonth(now);
      const previousStart = startOfMonth(subMonths(now, 1));
      const previousEnd = endOfMonth(subMonths(now, 1));

      // Fetch current period
      const { data: currentHistory, error: currentError } = await supabase
        .from('deal_stage_history')
        .select(`*, sales:sale_id (salesperson_id)`)
        .gte('entered_at', currentStart.toISOString())
        .lte('entered_at', currentEnd.toISOString())
        .order('entered_at', { ascending: true });

      if (currentError) throw currentError;

      const currentData = calculateVelocityData(currentHistory || [], salespersonId);

      if (!enableComparison) {
        return currentData;
      }

      // Fetch previous period for comparison
      const { data: previousHistory, error: previousError } = await supabase
        .from('deal_stage_history')
        .select(`*, sales:sale_id (salesperson_id)`)
        .gte('entered_at', previousStart.toISOString())
        .lte('entered_at', previousEnd.toISOString())
        .order('entered_at', { ascending: true });

      if (previousError) throw previousError;

      const previousData = calculateVelocityData(previousHistory || [], salespersonId);

      // Calculate changes
      const stagesWithComparison = currentData.stages.map((stage, index) => {
        const prevStage = previousData.stages[index];
        const previousAvgDays = prevStage?.avgDays || 0;
        const change = previousAvgDays > 0 
          ? ((stage.avgDays - previousAvgDays) / previousAvgDays) * 100 
          : 0;
        return {
          ...stage,
          previousAvgDays,
          change
        };
      });

      const totalChange = previousData.totalAvgDays > 0
        ? ((currentData.totalAvgDays - previousData.totalAvgDays) / previousData.totalAvgDays) * 100
        : 0;

      return {
        ...currentData,
        stages: stagesWithComparison,
        previousTotalAvgDays: previousData.totalAvgDays,
        totalChange
      };
    }
  });
}
