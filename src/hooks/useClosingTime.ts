import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClosingTimeData {
  bySalesperson: { name: string; avgDays: number; deals: number }[];
  byProduct: { name: string; avgDays: number; deals: number }[];
  byCategory: { name: string; avgDays: number; deals: number }[];
  overall: { avgDays: number; totalDeals: number };
}

export function useClosingTime() {
  return useQuery({
    queryKey: ['closing-time'],
    queryFn: async (): Promise<ClosingTimeData> => {
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          salespeople (name)
        `)
        .eq('status', 'completed');

      if (salesError) throw salesError;

      const { data: stageHistory, error: historyError } = await supabase
        .from('deal_stage_history')
        .select('*');

      if (historyError) throw historyError;

      // Calculate closing time for each sale
      const saleClosingTimes = new Map<string, number>();
      
      sales?.forEach(sale => {
        const saleStages = stageHistory?.filter(h => h.sale_id === sale.id) || [];
        if (saleStages.length > 0) {
          const firstEntry = new Date(Math.min(...saleStages.map(s => new Date(s.entered_at).getTime())));
          const lastExit = saleStages.find(s => s.stage === 'Fechado')?.entered_at;
          
          if (lastExit) {
            const days = (new Date(lastExit).getTime() - firstEntry.getTime()) / (1000 * 60 * 60 * 24);
            saleClosingTimes.set(sale.id, days);
          }
        }
      });

      // Group by salesperson
      const salespersonMap = new Map<string, { totalDays: number; count: number }>();
      sales?.forEach(sale => {
        const days = saleClosingTimes.get(sale.id);
        if (days !== undefined && sale.salespeople?.name) {
          const existing = salespersonMap.get(sale.salespeople.name) || { totalDays: 0, count: 0 };
          salespersonMap.set(sale.salespeople.name, {
            totalDays: existing.totalDays + days,
            count: existing.count + 1,
          });
        }
      });

      // Group by product
      const productMap = new Map<string, { totalDays: number; count: number }>();
      sales?.forEach(sale => {
        const days = saleClosingTimes.get(sale.id);
        if (days !== undefined) {
          const existing = productMap.get(sale.product_name) || { totalDays: 0, count: 0 };
          productMap.set(sale.product_name, {
            totalDays: existing.totalDays + days,
            count: existing.count + 1,
          });
        }
      });

      // Group by category
      const categoryMap = new Map<string, { totalDays: number; count: number }>();
      sales?.forEach(sale => {
        const days = saleClosingTimes.get(sale.id);
        if (days !== undefined) {
          const existing = categoryMap.get(sale.category) || { totalDays: 0, count: 0 };
          categoryMap.set(sale.category, {
            totalDays: existing.totalDays + days,
            count: existing.count + 1,
          });
        }
      });

      const mapToArray = (map: Map<string, { totalDays: number; count: number }>) =>
        Array.from(map.entries())
          .map(([name, data]) => ({
            name,
            avgDays: data.count > 0 ? Math.round(data.totalDays / data.count) : 0,
            deals: data.count,
          }))
          .sort((a, b) => a.avgDays - b.avgDays);

      const totalDays = Array.from(saleClosingTimes.values()).reduce((a, b) => a + b, 0);
      const totalDeals = saleClosingTimes.size;

      return {
        bySalesperson: mapToArray(salespersonMap),
        byProduct: mapToArray(productMap),
        byCategory: mapToArray(categoryMap),
        overall: {
          avgDays: totalDeals > 0 ? Math.round(totalDays / totalDeals) : 0,
          totalDeals,
        },
      };
    },
  });
}
