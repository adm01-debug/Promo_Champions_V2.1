// Melhoria 2.4 - useSalesData.ts REFATORADO
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalesMetrics {
  total_revenue: number;
  deals_won: number;
  deals_lost: number;
  conversion_rate: number;
  avg_deal_value: number;
}

interface DateRange {
  start: string;
  end: string;
}

export const useSalesData = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['sales-data', dateRange],
    queryFn: async () => {
      let query = supabase.rpc('calculate_sales_metrics');
      
      if (dateRange) {
        query = query.gte('created_at', dateRange.start)
                    .lte('created_at', dateRange.end);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SalesMetrics;
    },
  });
};
