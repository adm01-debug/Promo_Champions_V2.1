import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WinLossData {
  totalWins: number;
  totalLosses: number;
  winRate: number;
  reasonsWon: { reason: string; count: number; percentage: number }[];
  reasonsLost: { reason: string; count: number; percentage: number }[];
  byProduct: { product: string; wins: number; losses: number; winRate: number }[];
  bySalesperson: { name: string; wins: number; losses: number; winRate: number }[];
}

export function useWinLossAnalysis(salespersonId?: string) {
  return useQuery({
    queryKey: ['win-loss-analysis', salespersonId],
    queryFn: async (): Promise<WinLossData> => {
      let query = supabase
        .from('deal_outcomes')
        .select(`
          *,
          sales:sale_id (product_name, client_name),
          salespeople:salesperson_id (name)
        `);

      if (salespersonId) {
        query = query.eq('salesperson_id', salespersonId);
      }

      const { data: outcomes, error } = await query;

      if (error) throw error;

      const wins = outcomes?.filter(o => o.outcome === 'won') || [];
      const losses = outcomes?.filter(o => o.outcome === 'lost') || [];

      // Count reasons
      const countReasons = (items: typeof wins) => {
        const counts: Record<string, number> = {};
        items.forEach(item => {
          counts[item.reason] = (counts[item.reason] || 0) + 1;
        });
        const total = items.length || 1;
        return Object.entries(counts)
          .map(([reason, count]) => ({
            reason,
            count,
            percentage: (count / total) * 100
          }))
          .sort((a, b) => b.count - a.count);
      };

      // Group by product
      const productStats: Record<string, { wins: number; losses: number }> = {};
      outcomes?.forEach(o => {
        const product = (o.sales as any)?.product_name || 'Desconhecido';
        if (!productStats[product]) productStats[product] = { wins: 0, losses: 0 };
        if (o.outcome === 'won') productStats[product].wins++;
        else productStats[product].losses++;
      });

      // Group by salesperson
      const salespersonStats: Record<string, { name: string; wins: number; losses: number }> = {};
      outcomes?.forEach(o => {
        const id = o.salesperson_id || 'unknown';
        const name = (o.salespeople as any)?.name || 'Desconhecido';
        if (!salespersonStats[id]) salespersonStats[id] = { name, wins: 0, losses: 0 };
        if (o.outcome === 'won') salespersonStats[id].wins++;
        else salespersonStats[id].losses++;
      });

      return {
        totalWins: wins.length,
        totalLosses: losses.length,
        winRate: wins.length / ((wins.length + losses.length) || 1) * 100,
        reasonsWon: countReasons(wins),
        reasonsLost: countReasons(losses),
        byProduct: Object.entries(productStats).map(([product, stats]) => ({
          product,
          ...stats,
          winRate: stats.wins / ((stats.wins + stats.losses) || 1) * 100
        })),
        bySalesperson: Object.values(salespersonStats).map(stats => ({
          ...stats,
          winRate: stats.wins / ((stats.wins + stats.losses) || 1) * 100
        }))
      };
    }
  });
}
