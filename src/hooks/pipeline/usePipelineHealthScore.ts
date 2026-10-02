import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePipelineHealthScore() {
  return useQuery({
    queryKey: ['pipeline-health'],
    queryFn: async () => {
      // Usamos a view de forecast para pegar dados de pipeline aberto e meta
      const { data, error } = await supabase.from('revenue_forecast_view').select('*');
      if (error) throw error;

      const agg = data.reduce(
        (acc, r) => {
          acc.total_pipeline += Number(r.total_open_pipeline) || 0;
          acc.weighted_forecast += Number(r.weighted_forecast) || 0;
          acc.monthly_goal += Number(r.monthly_goal) || 0;
          return acc;
        },
        { total_pipeline: 0, weighted_forecast: 0, monthly_goal: 0 }
      );

      // Pipeline Coverage (Standard target is 3x or 4x)
      const coverage = agg.monthly_goal > 0 ? agg.total_pipeline / agg.monthly_goal : 0;
      const weightedCoverage =
        agg.monthly_goal > 0 ? agg.weighted_forecast / agg.monthly_goal : 0;

      return {
        ...agg,
        coverage,
        weightedCoverage,
        health: coverage >= 3 ? 'Excellent' : coverage >= 2 ? 'Healthy' : 'At Risk',
        commit: agg.total_pipeline * 0.4, // Simplified logic for commit
        upside: agg.total_pipeline * 0.7, // Simplified logic for upside
      };
    },
  });
}
