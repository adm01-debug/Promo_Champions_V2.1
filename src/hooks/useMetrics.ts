import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MetricData } from '@/types';
import { CACHE_TIMES } from '@/constants';

export interface MetricsOptions {
  userId?: string;
  period?: 'day' | 'week' | 'month';
}

export const useMetrics = (options?: MetricsOptions | string) => {
  // Handle both old string signature and new options object
  const opts: MetricsOptions = typeof options === 'string' 
    ? { userId: options } 
    : options || {};
  
  return useQuery<MetricData[]>({
    queryKey: ['metrics', opts],
    queryFn: async (): Promise<MetricData[]> => {
      // Get sales data
      let salesQuery = supabase.from('sales').select('*');
      
      if (opts.userId) {
        salesQuery = salesQuery.eq('salesperson_id', opts.userId);
      }
      
      const { data: sales, error } = await salesQuery;
      if (error) throw error;
      
      const wonSales = (sales || []).filter(s => s.status === 'won');
      const totalRevenue = wonSales.reduce((acc, s) => acc + s.amount, 0);
      const avgTicket = wonSales.length > 0 ? totalRevenue / wonSales.length : 0;
      const conversionRate = sales && sales.length > 0 
        ? (wonSales.length / sales.length) * 100 
        : 0;
      
      return [
        { label: 'Receita Total', value: totalRevenue, trend: 'up' },
        { label: 'Deals Fechados', value: wonSales.length, trend: 'up' },
        { label: 'Taxa de Conversão', value: conversionRate, trend: 'stable' },
        { label: 'Ticket Médio', value: avgTicket, trend: 'up' },
      ];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
