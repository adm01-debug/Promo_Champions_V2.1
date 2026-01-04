import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalesMetrics {
  totalRevenue: number;
  dealsWon: number;
  dealsLost: number;
  winRate: number;
  avgDealSize: number;
  totalDeals: number;
}

export interface MonthlySales {
  month: string;
  revenue: number;
  deals: number;
}

export const useSalesData = (userId?: string, startDate?: Date, endDate?: Date) => {
  return useQuery<SalesMetrics, Error>({
    queryKey: ['salesData', userId, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select('value, status, closed_at');
      
      if (userId) {
        query = query.eq('owner_id', userId);
      }
      
      if (startDate) {
        query = query.gte('closed_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('closed_at', endDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const won = data?.filter(d => d.status === 'won') || [];
      const lost = data?.filter(d => d.status === 'lost') || [];
      const totalRevenue = won.reduce((sum, d) => sum + (d.value || 0), 0);
      const totalDeals = data?.length || 0;
      
      return {
        totalRevenue,
        dealsWon: won.length,
        dealsLost: lost.length,
        winRate: totalDeals > 0 ? (won.length / totalDeals) * 100 : 0,
        avgDealSize: won.length > 0 ? totalRevenue / won.length : 0,
        totalDeals,
      };
    },
  });
};

export const useMonthlySales = (userId?: string, months: number = 12) => {
  return useQuery<MonthlySales[], Error>({
    queryKey: ['monthlySales', userId, months],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      let query = supabase
        .from('deals')
        .select('value, closed_at')
        .eq('status', 'won')
        .gte('closed_at', startDate.toISOString())
        .order('closed_at', { ascending: true });
      
      if (userId) {
        query = query.eq('owner_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const monthlyMap = new Map<string, { revenue: number; deals: number }>();
      
      data?.forEach(deal => {
        if (!deal.closed_at) return;
        const month = new Date(deal.closed_at).toISOString().slice(0, 7);
        
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, { revenue: 0, deals: 0 });
        }
        
        const current = monthlyMap.get(month)!;
        current.revenue += deal.value || 0;
        current.deals += 1;
      });
      
      return Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          deals: data.deals,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    },
  });
};
