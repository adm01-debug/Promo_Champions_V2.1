import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface WinLossReason {
  reason: string;
  count: number;
  percentage: number;
  avgValue: number;
}

export interface WinLossAnalysis {
  won: {
    total: number;
    totalValue: number;
    avgValue: number;
    avgCycle: number;
    topReasons: WinLossReason[];
  };
  lost: {
    total: number;
    totalValue: number;
    avgValue: number;
    avgCycle: number;
    topReasons: WinLossReason[];
  };
  winRate: number;
  trend: 'up' | 'down' | 'stable';
  byCategory: Record<string, { won: number; lost: number; winRate: number }>;
  bySalesperson: { id: string; name: string; won: number; lost: number; winRate: number }[];
}

export function useWinLossAnalysisDetailed(dateRange?: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['win-loss-analysis', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async (): Promise<WinLossAnalysis> => {
      const now = new Date();
      const startDate = dateRange?.start || new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const endDate = dateRange?.end || now;

      // Buscar deals won
      const { data: wonDeals, error: wonError } = await supabase
        .from('sales')
        .select('id, amount, category, salesperson_id, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (wonError) throw wonError;

      // Buscar deals lost
      const { data: lostDeals, error: lostError } = await supabase
        .from('sales')
        .select('id, amount, category, salesperson_id, created_at')
        .eq('status', 'cancelled')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (lostError) throw lostError;

      // Buscar outcomes para motivos
      const { data: outcomes, error: outcomesError } = await supabase
        .from('deal_outcomes')
        .select('sale_id, outcome, reason')
        .in('sale_id', [...(wonDeals?.map(d => d.id) || []), ...(lostDeals?.map(d => d.id) || [])]);

      if (outcomesError) throw outcomesError;

      // Buscar salespeople para nomes
      const { data: salespeople, error: spError } = await supabase
        .from('salespeople')
        .select('id, name');

      if (spError) throw spError;

      // Processar won
      const wonTotal = wonDeals?.length || 0;
      const wonValue = wonDeals?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const wonAvg = wonTotal > 0 ? wonValue / wonTotal : 0;

      // Processar lost
      const lostTotal = lostDeals?.length || 0;
      const lostValue = lostDeals?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const lostAvg = lostTotal > 0 ? lostValue / lostTotal : 0;

      // Win rate
      const totalClosed = wonTotal + lostTotal;
      const winRate = totalClosed > 0 ? (wonTotal / totalClosed) * 100 : 0;

      // Agrupar razões de won
      const wonOutcomes = outcomes?.filter(o => o.outcome === 'won') || [];
      const wonReasonCounts: Record<string, { count: number; totalValue: number }> = {};
      wonOutcomes.forEach(o => {
        const deal = wonDeals?.find(d => d.id === o.sale_id);
        if (!wonReasonCounts[o.reason]) wonReasonCounts[o.reason] = { count: 0, totalValue: 0 };
        wonReasonCounts[o.reason].count++;
        wonReasonCounts[o.reason].totalValue += deal?.amount || 0;
      });

      const wonReasons: WinLossReason[] = Object.entries(wonReasonCounts)
        .map(([reason, data]) => ({
          reason,
          count: data.count,
          percentage: wonTotal > 0 ? (data.count / wonTotal) * 100 : 0,
          avgValue: data.count > 0 ? data.totalValue / data.count : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Agrupar razões de lost
      const lostOutcomes = outcomes?.filter(o => o.outcome === 'lost') || [];
      const lostReasonCounts: Record<string, { count: number; totalValue: number }> = {};
      lostOutcomes.forEach(o => {
        const deal = lostDeals?.find(d => d.id === o.sale_id);
        if (!lostReasonCounts[o.reason]) lostReasonCounts[o.reason] = { count: 0, totalValue: 0 };
        lostReasonCounts[o.reason].count++;
        lostReasonCounts[o.reason].totalValue += deal?.amount || 0;
      });

      const lostReasons: WinLossReason[] = Object.entries(lostReasonCounts)
        .map(([reason, data]) => ({
          reason,
          count: data.count,
          percentage: lostTotal > 0 ? (data.count / lostTotal) * 100 : 0,
          avgValue: data.count > 0 ? data.totalValue / data.count : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Por categoria
      const byCategory: Record<string, { won: number; lost: number; winRate: number }> = {};
      wonDeals?.forEach(d => {
        if (!byCategory[d.category]) byCategory[d.category] = { won: 0, lost: 0, winRate: 0 };
        byCategory[d.category].won++;
      });
      lostDeals?.forEach(d => {
        if (!byCategory[d.category]) byCategory[d.category] = { won: 0, lost: 0, winRate: 0 };
        byCategory[d.category].lost++;
      });
      Object.keys(byCategory).forEach(cat => {
        const total = byCategory[cat].won + byCategory[cat].lost;
        byCategory[cat].winRate = total > 0 ? (byCategory[cat].won / total) * 100 : 0;
      });

      // Por vendedor
      const bySpMap: Record<string, { won: number; lost: number }> = {};
      wonDeals?.forEach(d => {
        if (!d.salesperson_id) return;
        if (!bySpMap[d.salesperson_id]) bySpMap[d.salesperson_id] = { won: 0, lost: 0 };
        bySpMap[d.salesperson_id].won++;
      });
      lostDeals?.forEach(d => {
        if (!d.salesperson_id) return;
        if (!bySpMap[d.salesperson_id]) bySpMap[d.salesperson_id] = { won: 0, lost: 0 };
        bySpMap[d.salesperson_id].lost++;
      });

      const bySalesperson = Object.entries(bySpMap).map(([id, data]) => {
        const sp = salespeople?.find(s => s.id === id);
        const total = data.won + data.lost;
        return {
          id,
          name: sp?.name || 'Desconhecido',
          won: data.won,
          lost: data.lost,
          winRate: total > 0 ? (data.won / total) * 100 : 0,
        };
      }).sort((a, b) => b.winRate - a.winRate);

      return {
        won: {
          total: wonTotal,
          totalValue: wonValue,
          avgValue: wonAvg,
          avgCycle: 0,
          topReasons: wonReasons,
        },
        lost: {
          total: lostTotal,
          totalValue: lostValue,
          avgValue: lostAvg,
          avgCycle: 0,
          topReasons: lostReasons,
        },
        winRate,
        trend: winRate >= 50 ? 'up' : winRate >= 30 ? 'stable' : 'down',
        byCategory,
        bySalesperson,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
