import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardKPIs {
  totalRevenue: number;
  revenueGrowth: number;
  activeDeals: number;
  dealsGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  avgDealSize: number;
  dealSizeGrowth: number;
  pipelineValue: number;
  forecastedRevenue: number;
}

export const useDashboardKPIs = (userId?: string) => {
  return useQuery<DashboardKPIs, Error>({
    queryKey: ['dashboardKPIs', userId],
    queryFn: async () => {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      
      // Current month data
      let currentQuery = supabase
        .from('deals')
        .select('value, status')
        .gte('created_at', currentMonthStart.toISOString());
      
      // Last month data
      let lastQuery = supabase
        .from('deals')
        .select('value, status')
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());
      
      if (userId) {
        currentQuery = currentQuery.eq('owner_id', userId);
        lastQuery = lastQuery.eq('owner_id', userId);
      }
      
      const [currentResult, lastResult] = await Promise.all([
        currentQuery,
        lastQuery,
      ]);
      
      if (currentResult.error) throw currentResult.error;
      if (lastResult.error) throw lastResult.error;
      
      const currentWon = currentResult.data?.filter(d => d.status === 'won') || [];
      const lastWon = lastResult.data?.filter(d => d.status === 'won') || [];
      
      const currentRevenue = currentWon.reduce((sum, d) => sum + (d.value || 0), 0);
      const lastRevenue = lastWon.reduce((sum, d) => sum + (d.value || 0), 0);
      
      const currentTotal = currentResult.data?.length || 0;
      const lastTotal = lastResult.data?.length || 0;
      
      const currentConversion = currentTotal > 0 ? (currentWon.length / currentTotal) * 100 : 0;
      const lastConversion = lastTotal > 0 ? (lastWon.length / lastTotal) * 100 : 0;
      
      const currentAvg = currentWon.length > 0 ? currentRevenue / currentWon.length : 0;
      const lastAvg = lastWon.length > 0 ? lastRevenue / lastWon.length : 0;
      
      // Pipeline value (open deals)
      const pipelineResult = await supabase
        .from('deals')
        .select('value')
        .eq('status', 'open');
      
      const pipelineValue = pipelineResult.data?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
      
      return {
        totalRevenue: currentRevenue,
        revenueGrowth: lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0,
        activeDeals: currentTotal,
        dealsGrowth: lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0,
        conversionRate: currentConversion,
        conversionGrowth: lastConversion > 0 ? ((currentConversion - lastConversion) / lastConversion) * 100 : 0,
        avgDealSize: currentAvg,
        dealSizeGrowth: lastAvg > 0 ? ((currentAvg - lastAvg) / lastAvg) * 100 : 0,
        pipelineValue,
        forecastedRevenue: pipelineValue * (currentConversion / 100),
      };
    },
  });
};
