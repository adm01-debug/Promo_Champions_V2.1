import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FunnelStage {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
  averageTime: number;
  velocityScore: number;
  dropOffRate: number;
}

interface FunnelAnalysis {
  stages: FunnelStage[];
  overallConversion: number;
  totalValue: number;
  avgDealSize: number;
  topDropOffStage: string;
}

/**
 * Hook for sales funnel analysis using the sales table
 */
export const useFunnelData = (timeframe: number = 30) => {
  return useQuery<FunnelAnalysis>({
    queryKey: ['funnel-data', timeframe],
    queryFn: async (): Promise<FunnelAnalysis> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      // Get stage history to understand funnel flow
      const { data: stageHistory, error: shError } = await supabase
        .from('deal_stage_history')
        .select('sale_id, stage, entered_at, exited_at')
        .gte('entered_at', startDate.toISOString());

      if (shError) throw shError;

      // Also get current sales for value data
      const { data: sales, error: sError } = await supabase
        .from('sales')
        .select('id, amount, status, created_at, updated_at')
        .gte('created_at', startDate.toISOString());

      if (sError) throw sError;

      // Define funnel stages in order
      const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'closed'];

      // Count unique sales per stage from history
      const stageGroups = new Map<string, Set<string>>();
      stageOrder.forEach(stage => stageGroups.set(stage, new Set()));

      (stageHistory || []).forEach(record => {
        const normalizedStage = record.stage.toLowerCase();
        if (stageGroups.has(normalizedStage)) {
          stageGroups.get(normalizedStage)!.add(record.sale_id || '');
        }
      });

      // Build sale amount map
      const saleAmountMap = new Map<string, number>();
      (sales || []).forEach(s => saleAmountMap.set(s.id, s.amount || 0));

      const totalDeals = (sales || []).length;
      let previousCount = totalDeals || 1;

      const stages: FunnelStage[] = stageOrder.map((stage) => {
        const saleIds = stageGroups.get(stage) || new Set();
        const count = saleIds.size || 0;
        const value = Array.from(saleIds).reduce((sum, id) => sum + (saleAmountMap.get(id) || 0), 0);

        const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;
        const dropOffRate = Math.max(0, 100 - conversionRate);

        const result = {
          stage: stage.charAt(0).toUpperCase() + stage.slice(1),
          count,
          value,
          conversionRate: Math.round(conversionRate * 10) / 10,
          averageTime: 0,
          dropOffRate: Math.round(dropOffRate * 10) / 10,
        };

        if (count > 0) previousCount = count;
        return result;
      });

      const wonSales = (sales || []).filter(s => s.status === 'completed' || s.status === 'won');
      const overallConversion = totalDeals > 0
        ? (wonSales.length / totalDeals) * 100
        : 0;

      const totalValue = wonSales.reduce((sum, s) => sum + (s.amount || 0), 0);
      const avgDealSize = wonSales.length > 0 ? totalValue / wonSales.length : 0;

      const topDropOffStage = stages.length > 0
        ? stages.reduce((max, stage) =>
            stage.dropOffRate > max.dropOffRate ? stage : max
          , stages[0]).stage
        : 'N/A';

      return {
        stages,
        overallConversion: Math.round(overallConversion * 10) / 10,
        totalValue,
        avgDealSize: Math.round(avgDealSize),
        topDropOffStage,
      };
    },
    staleTime: 1000 * 60 * 30,
  });
};
