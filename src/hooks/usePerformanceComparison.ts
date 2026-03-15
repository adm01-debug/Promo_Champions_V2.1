import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalespersonPerformance {
  id: string;
  name: string;
  role: string;
  avatar_url: string | null;
  avatarUrl: string | null;
  totalSales: number;
  totalRevenue: number;
  avgDealSize: number;
  winRate: number;
  activitiesCount: number;
  totalActivities: number;
  conversionRate: number;
  rank: number;
  goalProgress: number;
}

interface RoleBenchmark {
  role: string;
  salespeople: SalespersonPerformance[];
  avgRevenue: number;
  avgWinRate: number;
  avgActivities: number;
  avgDealSize: number;
  topPerformer: SalespersonPerformance | null;
}

export const usePerformanceComparison = (timeframe: number = 30) => {
  return useQuery<RoleBenchmark[]>({
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

      // Get activities
      const { data: activities } = await supabase
        .from('activities')
        .select('id, salesperson_id')
        .gte('created_at', startDate.toISOString());

      // Get deal outcomes
      const { data: outcomes } = await supabase
        .from('deal_outcomes')
        .select('salesperson_id, outcome')
        .gte('created_at', startDate.toISOString());

      // Get goals for progress
      const { data: goals } = await supabase
        .from('sales_goals')
        .select('salesperson_id, goal_amount');

      const metrics: SalespersonPerformance[] = salespeople.map(sp => {
        const spSales = (sales || []).filter(s => s.salesperson_id === sp.id);
        const completedSales = spSales.filter(s => s.status === 'completed');
        const spActivities = (activities || []).filter(a => a.salesperson_id === sp.id);
        const spOutcomes = (outcomes || []).filter(o => o.salesperson_id === sp.id);
        const wins = spOutcomes.filter(o => o.outcome === 'won').length;
        const totalOutcomes = spOutcomes.length;

        const totalRevenue = completedSales.reduce((sum, s) => sum + (s.amount || 0), 0);
        const spGoal = (goals || []).find(g => g.salesperson_id === sp.id);
        const goalProgress = spGoal?.goal_amount ? (totalRevenue / spGoal.goal_amount) * 100 : 0;

        return {
          id: sp.id,
          name: sp.name,
          role: sp.role || 'hybrid',
          avatar_url: sp.avatar_url,
          avatarUrl: sp.avatar_url,
          totalSales: completedSales.length,
          totalRevenue,
          avgDealSize: completedSales.length > 0 ? totalRevenue / completedSales.length : 0,
          winRate: totalOutcomes > 0 ? Math.round((wins / totalOutcomes) * 100) : 0,
          activitiesCount: spActivities.length,
          totalActivities: spActivities.length,
          conversionRate: spSales.length > 0 ? Math.round((completedSales.length / spSales.length) * 100) : 0,
          rank: 0,
          goalProgress: Math.round(goalProgress),
        };
      }).sort((a, b) => b.totalRevenue - a.totalRevenue);

      // Assign ranks
      metrics.forEach((m, idx) => m.rank = idx + 1);

      // Group by role
      const roleMap = new Map<string, SalespersonPerformance[]>();
      metrics.forEach(m => {
        const role = m.role || 'hybrid';
        if (!roleMap.has(role)) roleMap.set(role, []);
        roleMap.get(role)!.push(m);
      });

      return Array.from(roleMap.entries()).map(([role, people]) => {
        const avgRevenue = people.length > 0
          ? people.reduce((sum, p) => sum + p.totalRevenue, 0) / people.length
          : 0;
        const avgWinRate = people.length > 0
          ? people.reduce((sum, p) => sum + p.winRate, 0) / people.length
          : 0;
        const avgActivities = people.length > 0
          ? people.reduce((sum, p) => sum + p.totalActivities, 0) / people.length
          : 0;
        const avgDealSize = people.length > 0
          ? people.reduce((sum, p) => sum + p.avgDealSize, 0) / people.length
          : 0;

        const topPerformer = people.length > 0
          ? people.reduce((best, p) => p.totalRevenue > best.totalRevenue ? p : best)
          : null;

        return {
          role,
          salespeople: people,
          avgRevenue: Math.round(avgRevenue),
          avgWinRate: Math.round(avgWinRate),
          avgActivities: Math.round(avgActivities),
          avgDealSize: Math.round(avgDealSize),
          topPerformer,
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
};
