// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  userId: string;
  userName: string;
  dealsWon: number;
  revenue: number;
  winRate: number;
  rank: number;
}

export const usePerformanceComparison = (timeframe: number = 30) => {
  return useQuery<PerformanceMetric[]>({
    queryKey: ['performance-comparison', timeframe],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, deals(*)')
        .eq('role', 'salesperson');

      if (!users) return [];

      const metrics = users.map(user => {
        const deals = user.deals || [];
        const won = deals.filter((d: any) => d.status === 'won');
        
        return {
          userId: user.id,
          userName: user.full_name,
          dealsWon: won.length,
          revenue: won.reduce((sum: number, d: any) => sum + (d.value || 0), 0),
          winRate: deals.length > 0 ? (won.length / deals.length) * 100 : 0,
          rank: 0,
        };
      }).sort((a, b) => b.revenue - a.revenue);

      // Assign ranks
      metrics.forEach((m, idx) => m.rank = idx + 1);

      return metrics;
    },
  });
};
