import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WinLossData {
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  winRate: number;
  avgWonValue: number;
  avgLostValue: number;
  topWinReasons: Array<{ reason: string; count: number }>;
  topLossReasons: Array<{ reason: string; count: number }>;
}

export const useWinLossAnalysis = (userId?: string, timeframe: number = 90) => {
  return useQuery({
    queryKey: ['winLossAnalysis', userId, timeframe],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);
      
      let query = supabase
        .from('deals')
        .select('status, value, win_reason, loss_reason, closed_at')
        .in('status', ['won', 'lost'])
        .gte('closed_at', startDate.toISOString());
      
      if (userId) {
        query = query.eq('owner_id', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const won = data.filter(d => d.status === 'won');
      const lost = data.filter(d => d.status === 'lost');
      
      const winReasonMap = new Map<string, number>();
      const lossReasonMap = new Map<string, number>();
      
      won.forEach(d => {
        if (d.win_reason) {
          winReasonMap.set(d.win_reason, (winReasonMap.get(d.win_reason) || 0) + 1);
        }
      });
      
      lost.forEach(d => {
        if (d.loss_reason) {
          lossReasonMap.set(d.loss_reason, (lossReasonMap.get(d.loss_reason) || 0) + 1);
        }
      });
      
      return {
        totalDeals: data.length,
        wonDeals: won.length,
        lostDeals: lost.length,
        winRate: data.length > 0 ? (won.length / data.length) * 100 : 0,
        avgWonValue: won.reduce((sum, d) => sum + (d.value || 0), 0) / won.length,
        avgLostValue: lost.reduce((sum, d) => sum + (d.value || 0), 0) / lost.length,
        topWinReasons: Array.from(winReasonMap.entries())
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        topLossReasons: Array.from(lossReasonMap.entries())
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      } as WinLossData;
    },
  });
};
