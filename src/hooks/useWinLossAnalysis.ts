import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WinLossData {
  totalWins: number;
  totalLosses: number;
  winRate: number;
  topWinReasons: { reason: string; count: number }[];
  topLossReasons: { reason: string; count: number }[];
  monthlyTrend: { month: string; wins: number; losses: number }[];
}

export const useWinLossAnalysis = () => {
  return useQuery<WinLossData>({
    queryKey: ['win-loss-analysis'],
    queryFn: async () => {
      const { data: outcomes, error } = await supabase
        .from('deal_outcomes')
        .select('outcome, reason, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const wins = (outcomes || []).filter(o => o.outcome === 'won');
      const losses = (outcomes || []).filter(o => o.outcome === 'lost');
      const total = wins.length + losses.length;

      // Count reasons
      const countReasons = (items: typeof outcomes) => {
        const map = new Map<string, number>();
        (items || []).forEach(item => {
          const r = item.reason || 'Não informado';
          map.set(r, (map.get(r) || 0) + 1);
        });
        return Array.from(map.entries())
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      };

      // Monthly trend (last 6 months)
      const monthlyMap = new Map<string, { wins: number; losses: number }>();
      (outcomes || []).forEach(o => {
        const date = new Date(o.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthlyMap.get(key) || { wins: 0, losses: 0 };
        if (o.outcome === 'won') existing.wins++;
        else existing.losses++;
        monthlyMap.set(key, existing);
      });

      const monthlyTrend = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      return {
        totalWins: wins.length,
        totalLosses: losses.length,
        winRate: total > 0 ? Math.round((wins.length / total) * 100) : 0,
        topWinReasons: countReasons(wins),
        topLossReasons: countReasons(losses),
        monthlyTrend,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};
