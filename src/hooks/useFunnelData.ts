// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FunnelStage {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
  averageTime: number;
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
 * Hook for sales funnel analysis
 * Calculates conversion rates, drop-offs, and time per stage
 */
export const useFunnelData = (timeframe: number = 30) => {
  return useQuery<FunnelAnalysis>({
    queryKey: ['funnel-data', timeframe],
    queryFn: async (): Promise<FunnelAnalysis> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      const { data: deals, error } = await supabase
        .from('deals')
        .select(`
          id,
          value,
          stage,
          created_at,
          updated_at
        `)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Define funnel stages in order
      const stageOrder = [
        'Lead',
        'Qualified',
        'Proposal',
        'Negotiation',
        'Closed Won',
        'Closed Lost',
      ];

      // Group deals by stage
      const stageGroups = new Map<string, any[]>();
      stageOrder.forEach(stage => stageGroups.set(stage, []));

      deals.forEach(deal => {
        if (stageGroups.has(deal.stage)) {
          stageGroups.get(deal.stage)!.push(deal);
        }
      });

      const totalDeals = deals.length;
      let previousCount = totalDeals;

      const stages: FunnelStage[] = stageOrder.slice(0, -1).map((stage, index) => {
        const stageDeals = stageGroups.get(stage) || [];
        const count = stageDeals.length;
        const value = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

        const conversionRate = previousCount > 0
          ? (count / previousCount) * 100
          : 0;

        const dropOffRate = 100 - conversionRate;

        const avgTime = stageDeals.length > 0
          ? stageDeals.reduce((sum, d) => {
              const created = new Date(d.created_at);
              const updated = new Date(d.updated_at);
              return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            }, 0) / stageDeals.length
          : 0;

        const result = {
          stage,
          count,
          value,
          conversionRate,
          averageTime: Math.round(avgTime),
          dropOffRate,
        };

        previousCount = count;
        return result;
      });

      const wonDeals = stageGroups.get('Closed Won') || [];
      const overallConversion = totalDeals > 0
        ? (wonDeals.length / totalDeals) * 100
        : 0;

      const totalValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      const avgDealSize = wonDeals.length > 0 ? totalValue / wonDeals.length : 0;

      // Find stage with highest drop-off
      const topDropOffStage = stages.reduce((max, stage) =>
        stage.dropOffRate > max.dropOffRate ? stage : max
      , stages[0] || { stage: 'N/A', dropOffRate: 0 }).stage;

      return {
        stages,
        overallConversion,
        totalValue,
        avgDealSize,
        topDropOffStage,
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
