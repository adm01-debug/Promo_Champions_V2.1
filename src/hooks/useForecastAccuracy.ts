import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface ForecastAccuracyData {
  period: string;
  forecasted: number;
  actual: number;
  accuracy: number;
  variance: number;
}

export interface ForecastAccuracyResult {
  overallAccuracy: number;
  avgVariance: number;
  trend: 'improving' | 'declining' | 'stable';
  monthlyData: ForecastAccuracyData[];
  bestMonth: ForecastAccuracyData | null;
  worstMonth: ForecastAccuracyData | null;
}

export function useForecastAccuracy() {
  return useQuery({
    queryKey: ['forecast-accuracy'],
    queryFn: async (): Promise<ForecastAccuracyResult> => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

      // Buscar forecasts históricos
      const { data: forecasts, error: forecastError } = await supabase
        .from('demand_forecasts')
        .select('forecast_date, predicted_revenue')
        .gte('forecast_date', sixMonthsAgo.toISOString())
        .lte('forecast_date', now.toISOString());

      if (forecastError) throw forecastError;

      // Buscar vendas reais
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', sixMonthsAgo.toISOString())
        .lte('created_at', now.toISOString());

      if (salesError) throw salesError;

      // Buscar metas mensais
      const { data: dailyMetrics, error: metricsError } = await supabase
        .from('daily_metrics')
        .select('date, revenue, revenue_goal')
        .gte('date', sixMonthsAgo.toISOString().split('T')[0])
        .lte('date', now.toISOString().split('T')[0]);

      if (metricsError) throw metricsError;

      // Agrupar por mês
      const monthlyData: Record<string, { forecasted: number; actual: number }> = {};

      // Agrupar forecasts por mês
      forecasts?.forEach(f => {
        const month = f.forecast_date.substring(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { forecasted: 0, actual: 0 };
        monthlyData[month].forecasted += f.predicted_revenue;
      });

      // Agrupar vendas reais por mês
      sales?.forEach(s => {
        const month = s.created_at.substring(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { forecasted: 0, actual: 0 };
        monthlyData[month].actual += s.amount;
      });

      // Se não há forecasts, usar metas como proxy
      if ((forecasts?.length || 0) === 0) {
        const goalByMonth: Record<string, number> = {};
        dailyMetrics?.forEach(m => {
          const month = m.date.substring(0, 7);
          if (!goalByMonth[month]) goalByMonth[month] = 0;
          goalByMonth[month] = Math.max(goalByMonth[month], m.revenue_goal);
        });

        Object.entries(goalByMonth).forEach(([month, goal]) => {
          if (!monthlyData[month]) monthlyData[month] = { forecasted: 0, actual: 0 };
          if (monthlyData[month].forecasted === 0) {
            monthlyData[month].forecasted = goal;
          }
        });
      }

      // Calcular métricas
      const processedData: ForecastAccuracyData[] = Object.entries(monthlyData)
        .filter(([_, data]) => data.forecasted > 0)
        .map(([period, data]) => {
          const variance = data.forecasted > 0 
            ? ((data.actual - data.forecasted) / data.forecasted) * 100
            : 0;
          const accuracy = Math.max(0, 100 - Math.abs(variance));

          return {
            period,
            forecasted: data.forecasted,
            actual: data.actual,
            accuracy,
            variance,
          };
        })
        .sort((a, b) => a.period.localeCompare(b.period));

      const overallAccuracy = processedData.length > 0
        ? processedData.reduce((sum, d) => sum + d.accuracy, 0) / processedData.length
        : 0;

      const avgVariance = processedData.length > 0
        ? processedData.reduce((sum, d) => sum + Math.abs(d.variance), 0) / processedData.length
        : 0;

      // Determinar tendência
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (processedData.length >= 3) {
        const recent = processedData.slice(-3);
        const first = recent[0]?.accuracy || 0;
        const last = recent[recent.length - 1]?.accuracy || 0;
        if (last - first > 5) trend = 'improving';
        else if (first - last > 5) trend = 'declining';
      }

      // Melhor e pior mês
      const sorted = [...processedData].sort((a, b) => b.accuracy - a.accuracy);
      const bestMonth = sorted[0] || null;
      const worstMonth = sorted[sorted.length - 1] || null;

      return {
        overallAccuracy,
        avgVariance,
        trend,
        monthlyData: processedData,
        bestMonth,
        worstMonth,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
