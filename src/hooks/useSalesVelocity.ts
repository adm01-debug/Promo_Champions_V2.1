import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface SalesVelocityMetrics {
  avgDealValue: number;
  avgSalesCycle: number;
  winRate: number;
  velocity: number;
  pipelineValue: number;
  projectedRevenue: number;
  dealsInPipeline: number;
  avgTimePerStage: Record<string, number>;
}

export function useSalesVelocity(dateRange?: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['sales-velocity', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async (): Promise<SalesVelocityMetrics> => {
      const now = new Date();
      const startDate = dateRange?.start || new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = dateRange?.end || now;

      // Buscar deals fechados (completed) para calcular métricas
      const { data: wonDeals, error: wonError } = await supabase
        .from('sales')
        .select('id, amount, created_at, status')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (wonError) throw wonError;

      // Buscar deals perdidos para calcular win rate
      const { data: lostDeals, error: lostError } = await supabase
        .from('sales')
        .select('id')
        .eq('status', 'cancelled')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (lostError) throw lostError;

      // Buscar pipeline ativo (pending)
      const { data: pipelineDeals, error: pipelineError } = await supabase
        .from('sales')
        .select('id, amount, status, created_at')
        .eq('status', 'pending');

      if (pipelineError) throw pipelineError;

      // Buscar histórico de stages para calcular tempo médio
      const { data: stageHistory, error: stageError } = await supabase
        .from('deal_stage_history')
        .select('stage, entered_at, exited_at')
        .not('exited_at', 'is', null);

      if (stageError) throw stageError;

      // Calcular métricas
      const totalWon = wonDeals?.length || 0;
      const totalLost = lostDeals?.length || 0;
      const totalClosed = totalWon + totalLost;

      const avgDealValue = totalWon > 0
        ? (wonDeals?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0) / totalWon
        : 0;

      const winRate = totalClosed > 0 ? (totalWon / totalClosed) * 100 : 0;

      // Calcular ciclo médio de vendas (dias entre criação e fechamento)
      let totalDays = 0;
      wonDeals?.forEach(deal => {
        const created = new Date(deal.created_at);
        const diff = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        totalDays += diff;
      });
      const avgSalesCycle = totalWon > 0 ? totalDays / totalWon : 0;

      // Pipeline value
      const pipelineValue = pipelineDeals?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

      // Velocity = (Nº Opportunities × Avg Deal Value × Win Rate) / Sales Cycle Length
      const velocity = avgSalesCycle > 0
        ? ((pipelineDeals?.length || 0) * avgDealValue * (winRate / 100)) / avgSalesCycle
        : 0;

      // Projected revenue = pipeline value × win rate
      const projectedRevenue = pipelineValue * (winRate / 100);

      // Tempo médio por stage
      const avgTimePerStage: Record<string, number> = {};
      const stageGroups: Record<string, number[]> = {};

      stageHistory?.forEach(h => {
        if (!h.entered_at || !h.exited_at) return;
        const entered = new Date(h.entered_at);
        const exited = new Date(h.exited_at);
        const days = Math.ceil((exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24));
        
        if (!stageGroups[h.stage]) stageGroups[h.stage] = [];
        stageGroups[h.stage].push(days);
      });

      Object.entries(stageGroups).forEach(([stage, days]) => {
        avgTimePerStage[stage] = days.reduce((a, b) => a + b, 0) / days.length;
      });

      return {
        avgDealValue,
        avgSalesCycle,
        winRate,
        velocity,
        pipelineValue,
        projectedRevenue,
        dealsInPipeline: pipelineDeals?.length || 0,
        avgTimePerStage,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
