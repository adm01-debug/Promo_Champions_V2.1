import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export interface StockForecast {
  productId: string;
  productName: string;
  currentStock: number;
  dailyVelocity: number;
  daysRemaining: number;
  expectedOutOfStockDate: Date | null;
  urgency: 'critical' | 'warning' | 'stable';
}

export const useStockForecast = () => {
  return useQuery<StockForecast[]>({
    queryKey: ['stock-forecast'],
    queryFn: async (): Promise<StockForecast[]> => {
      // 1. Get current inventory
      const { data: inventory, error: invError } = await supabase
        .from('inventory_levels')
        .select('product_id, current_stock, products(name)');

      if (invError || !inventory) return [];

      // 2. Get sales from last 30 days to calculate velocity
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data: recentSales, error: salesError } = await supabase
        .from('sales')
        .select('product_id, amount') // Using amount as proxy if quantity isn't there, but usually sales count is better
        .gte('created_at', thirtyDaysAgo);

      if (salesError) return [];

      // Calculate velocity (sales per day)
      const salesCounts: Record<string, number> = {};
      recentSales?.forEach(s => {
        if (s.product_id) {
          salesCounts[s.product_id] = (salesCounts[s.product_id] || 0) + 1;
        }
      });

      return inventory.map(item => {
        const productId = item.product_id!;
        const productName = (item as any).products?.name || 'Produto Desconhecido';
        const currentStock = item.current_stock;
        const totalSales = salesCounts[productId] || 0;
        const dailyVelocity = totalSales / 30;
        
        const daysRemaining = dailyVelocity > 0 ? Math.floor(currentStock / dailyVelocity) : 999;
        const expectedOutOfStockDate = dailyVelocity > 0 
          ? new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000) 
          : null;

        let urgency: 'critical' | 'warning' | 'stable' = 'stable';
        if (daysRemaining <= 7) urgency = 'critical';
        else if (daysRemaining <= 15) urgency = 'warning';

        return {
          productId,
          productName,
          currentStock,
          dailyVelocity,
          daysRemaining,
          expectedOutOfStockDate,
          urgency
        };
      }).sort((a, b) => a.daysRemaining - b.daysRemaining);
    },
    staleTime: 1000 * 60 * 30, // 30 mins
  });
};
