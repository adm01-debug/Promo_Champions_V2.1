import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalespersonPerformance {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  totalSales: number;
  totalRevenue: number;
  avgDealSize: number;
  winRate: number;
  activitiesCount: number;
  conversionRate: number;
  rank: number;
}

export const usePerformanceComparison = (timeframe: number = 30) => {
  return useQuery<SalespersonPerformance[]>({
    queryKey: ['performance-comparison', timeframe],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      // Get active salespeople
      const { data: salespeople } = await supabase
        .from('salespeople')
        .select('id, name, role, avatar_url')
        .eq('is_active', true);

      if (!salespeople || salespeople.length === 0) return [];

      // Get sales in timeframe
      const { data: sales } = await supabase
        .from('sales')
        .select('id, amount, status, salesperson_id, created_at')
        .gte('created_at', startDate.toISOString());

      // Get activities count per salesperson
      const { data: activities } = await supabase
        .from('activities')
        .select('id, salesperson_id')
        .gte('created_at', startDate.toISOString());

      // Get deal outcomes
      const { data: outcomes } = await supabase
        .from('deal_outcomes')
        .select('salesperson_id, outcome')
        .gte('created_at', startDate.toISOString());

      const metrics = salespeople.map(sp => {
        const spSales = (sales || []).filter(s => s.salesperson_id === sp.id);
        const completedSales = spSales.filter(s => s.status === 'completed');
        const spActivities = (activities || []).filter(a => a.salesperson_id === sp.id);
        const spOutcomes = (outcomes || []).filter(o => o.salesperson_id === sp.id);
        const wins = spOutcomes.filter(o => o.outcome === 'won').length;
        const totalOutcomes = spOutcomes.length;

        const totalRevenue = completedSales.reduce((sum, s) => sum + (s.amount || 0), 0);

        return {
          id: sp.id,
          name: sp.name,
          role: sp.role || 'hybrid',
          avatarUrl: sp.avatar_url,
          totalSales: completedSales.length,
          totalRevenue,
          avgDealSize: completedSales.length > 0 ? totalRevenue / completedSales.length : 0,
          winRate: totalOutcomes > 0 ? Math.round((wins / totalOutcomes) * 100) : 0,
          activitiesCount: spActivities.length,
          conversionRate: spSales.length > 0 ? Math.round((completedSales.length / spSales.length) * 100) : 0,
          rank: 0,
        };
      }).sort((a, b) => b.totalRevenue - a.totalRevenue);

      // Assign ranks
      metrics.forEach((m, idx) => m.rank = idx + 1);

      return metrics;
    },
    staleTime: 1000 * 60 * 5,
  });
};
