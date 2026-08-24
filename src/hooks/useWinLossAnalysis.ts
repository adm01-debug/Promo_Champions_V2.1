import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WinLossDetail {
  id: string;
  outcome: 'won' | 'lost';
  reason: string;
  notes: string | null;
  created_at: string;
  sales: {
    product_name: string | null;
    amount: number | null;
    client_name: string | null;
  } | null;
  salespeople: {
    name: string;
  } | null;
}

interface WinLossData {
  totalWins: number;
  totalLosses: number;
  winRate: number;
  topWinReasons: { reason: string; count: number }[];
  topLossReasons: { reason: string; count: number }[];
  monthlyTrend: { month: string; wins: number; losses: number }[];
  details: WinLossDetail[];
  bySalesperson: { name: string; wins: number; losses: number; winRate: number }[];
  byProduct: { name: string; wins: number; losses: number; winRate: number }[];
}

export const useWinLossAnalysis = () => {
  return useQuery<WinLossData>({
    queryKey: ['win-loss-analysis'],
    queryFn: async () => {
      const { data: outcomes, error } = await supabase
        .from('deal_outcomes')
        .select(`
          id, outcome, reason, notes, created_at,
          sales (product_name, amount, client_name),
          salespeople (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedOutcomes = (outcomes || []) as unknown as WinLossDetail[];
      const wins = typedOutcomes.filter(o => o.outcome === 'won');
      const losses = typedOutcomes.filter(o => o.outcome === 'lost');
      const total = wins.length + losses.length;

      // Count reasons
      const countReasons = (items: WinLossDetail[]) => {
        const map = new Map<string, number>();
        items.forEach(item => {
          const r = item.reason || 'Não informado';
          map.set(r, (map.get(r) || 0) + 1);
        });
        return Array.from(map.entries())
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      };

      // Group by Salesperson
      const salespersonMap = new Map<string, { wins: number; losses: number }>();
      typedOutcomes.forEach(o => {
        const name = o.salespeople?.name || 'Desconhecido';
        const existing = salespersonMap.get(name) || { wins: 0, losses: 0 };
        if (o.outcome === 'won') existing.wins++;
        else existing.losses++;
        salespersonMap.set(name, existing);
      });

      const bySalesperson = Array.from(salespersonMap.entries()).map(([name, data]) => ({
        name,
        ...data,
        winRate: (data.wins + data.losses) > 0 ? Math.round((data.wins / (data.wins + data.losses)) * 100) : 0
      })).sort((a, b) => b.wins - a.wins);

      // Group by Product
      const productMap = new Map<string, { wins: number; losses: number }>();
      typedOutcomes.forEach(o => {
        const name = o.sales?.product_name || 'Sem Produto';
        const existing = productMap.get(name) || { wins: 0, losses: 0 };
        if (o.outcome === 'won') existing.wins++;
        else existing.losses++;
        productMap.set(name, existing);
      });

      const byProduct = Array.from(productMap.entries()).map(([name, data]) => ({
        name,
        ...data,
        winRate: (data.wins + data.losses) > 0 ? Math.round((data.wins / (data.wins + data.losses)) * 100) : 0
      })).sort((a, b) => b.wins - a.wins);

      // Monthly trend
      const monthlyMap = new Map<string, { wins: number; losses: number }>();
      typedOutcomes.forEach(o => {
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
        details: typedOutcomes,
        bySalesperson,
        byProduct
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};
