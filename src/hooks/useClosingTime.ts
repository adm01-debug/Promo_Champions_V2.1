import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface ClosingTimeData {
  bySalesperson: { name: string; avgDays: number; deals: number; previousAvgDays?: number; change?: number }[];
  byProduct: { name: string; avgDays: number; deals: number; previousAvgDays?: number; change?: number }[];
  byCategory: { name: string; avgDays: number; deals: number; previousAvgDays?: number; change?: number }[];
  overall: { avgDays: number; totalDeals: number; previousAvgDays?: number; change?: number };
}

function calculateClosingTimeData(sales: any[], stageHistory: any[]) {
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
}

export function useClosingTime(enableComparison = true) {
  return useQuery({
    queryKey: ['closing-time', enableComparison],
    queryFn: async (): Promise<ClosingTimeData> => {
      const now = new Date();
      const currentStart = startOfMonth(now);
      const currentEnd = endOfMonth(now);
      const previousStart = startOfMonth(subMonths(now, 1));
      const previousEnd = endOfMonth(subMonths(now, 1));

      // Fetch current period sales
      const { data: currentSales, error: currentSalesError } = await supabase
        .from('sales')
        .select(`*, salespeople (name)`)
        .eq('status', 'completed')
        .gte('created_at', currentStart.toISOString())
        .lte('created_at', currentEnd.toISOString());

      if (currentSalesError) throw currentSalesError;

      const { data: stageHistory, error: historyError } = await supabase
        .from('deal_stage_history')
        .select('*');

      if (historyError) throw historyError;

      const currentData = calculateClosingTimeData(currentSales || [], stageHistory || []);

      if (!enableComparison) {
        return currentData;
      }

      // Fetch previous period
      const { data: previousSales, error: previousSalesError } = await supabase
        .from('sales')
        .select(`*, salespeople (name)`)
        .eq('status', 'completed')
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString());

      if (previousSalesError) throw previousSalesError;

      const previousData = calculateClosingTimeData(previousSales || [], stageHistory || []);

      // Add comparison to arrays
      const addComparison = (current: any[], previous: any[]) => {
        return current.map(item => {
          const prev = previous.find(p => p.name === item.name);
          const previousAvgDays = prev?.avgDays || 0;
          const change = previousAvgDays > 0
            ? ((item.avgDays - previousAvgDays) / previousAvgDays) * 100
            : 0;
          return { ...item, previousAvgDays, change };
        });
      };

      const overallChange = previousData.overall.avgDays > 0
        ? ((currentData.overall.avgDays - previousData.overall.avgDays) / previousData.overall.avgDays) * 100
        : 0;

      return {
        bySalesperson: addComparison(currentData.bySalesperson, previousData.bySalesperson),
        byProduct: addComparison(currentData.byProduct, previousData.byProduct),
        byCategory: addComparison(currentData.byCategory, previousData.byCategory),
        overall: {
          ...currentData.overall,
          previousAvgDays: previousData.overall.avgDays,
          change: overallChange
        }
      };
    },
  });
}
