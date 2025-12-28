import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Deal {
  id: string;
  status: 'open' | 'won' | 'lost';
  value: number;
  win_reason?: string;
  loss_reason?: string;
  created_at: string;
  closed_at?: string;
}

interface ReasonCount {
  reason: string;
  count: number;
  percentage: number;
}

interface WinLossData {
  won: number;
  lost: number;
  total: number;
  winRate: number;
  lossRate: number;
  totalRevenue: number;
  avgDealSize: number;
  commonWinReasons: ReasonCount[];
  commonLossReasons: ReasonCount[];
}

export const useWinLossAnalysis = () => {
  return useQuery<WinLossData>({
    queryKey: ['win-loss-analysis'],
    queryFn: async (): Promise<WinLossData> => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, status, value, win_reason, loss_reason, created_at, closed_at')
        .in('status', ['won', 'lost']);
      
      if (error) {
        console.error('Error fetching win/loss data:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return {
          won: 0,
          lost: 0,
          total: 0,
          winRate: 0,
          lossRate: 0,
          totalRevenue: 0,
          avgDealSize: 0,
          commonWinReasons: [],
          commonLossReasons: []
        };
      }
      
      const deals = data as Deal[];
      
      const wonDeals = deals.filter(d => d.status === 'won');
      const lostDeals = deals.filter(d => d.status === 'lost');
      
      const total = deals.length;
      const won = wonDeals.length;
      const lost = lostDeals.length;
      const winRate = (won / total) * 100;
      const lossRate = (lost / total) * 100;
      
      const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      const avgDealSize = won > 0 ? totalRevenue / won : 0;
      
      // Processar razões de vitória
      const winReasonsMap = new Map<string, number>();
      wonDeals.forEach(deal => {
        if (deal.win_reason) {
          const current = winReasonsMap.get(deal.win_reason) || 0;
          winReasonsMap.set(deal.win_reason, current + 1);
        }
      });
      
      const commonWinReasons: ReasonCount[] = Array.from(winReasonsMap.entries())
        .map(([reason, count]) => ({
          reason,
          count,
          percentage: (count / won) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Processar razões de perda
      const lossReasonsMap = new Map<string, number>();
      lostDeals.forEach(deal => {
        if (deal.loss_reason) {
          const current = lossReasonsMap.get(deal.loss_reason) || 0;
          lossReasonsMap.set(deal.loss_reason, current + 1);
        }
      });
      
      const commonLossReasons: ReasonCount[] = Array.from(lossReasonsMap.entries())
        .map(([reason, count]) => ({
          reason,
          count,
          percentage: (count / lost) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      return {
        won,
        lost,
        total,
        winRate: Math.round(winRate * 10) / 10,
        lossRate: Math.round(lossRate * 10) / 10,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        avgDealSize: Math.round(avgDealSize * 100) / 100,
        commonWinReasons,
        commonLossReasons
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });
};
