import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RegionSales {
  region: string;
  totalRevenue: number;
  dealsCount: number;
  avgDealSize: number;
  topSalesperson: string;
}

export const useRegionalSales = () => {
  return useQuery<RegionSales[]>({
    queryKey: ['regional-sales'],
    queryFn: async (): Promise<RegionSales[]> => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, clients(region), salespeople(name)')
        .eq('status', 'won');
      
      if (error) throw error;
      if (!data) return [];
      
      const regionMap = new Map<string, {
        revenue: number;
        count: number;
        salespeople: Map<string, number>;
      }>();
      
      data.forEach((deal: { clients: { region?: string }; value: number; salespeople: { name: string } }) => {
        const region = deal.clients?.region || 'Unknown';
        const current = regionMap.get(region) || {
          revenue: 0,
          count: 0,
          salespeople: new Map()
        };
        
        current.revenue += deal.value;
        current.count += 1;
        
        const spRevenue = current.salespeople.get(deal.salespeople.name) || 0;
        current.salespeople.set(deal.salespeople.name, spRevenue + deal.value);
        
        regionMap.set(region, current);
      });
      
      return Array.from(regionMap.entries()).map(([region, stats]) => {
        const topSP = Array.from(stats.salespeople.entries())
          .sort((a, b) => b[1] - a[1])[0];
        
        return {
          region,
          totalRevenue: stats.revenue,
          dealsCount: stats.count,
          avgDealSize: stats.revenue / stats.count,
          topSalesperson: topSP ? topSP[0] : 'N/A'
        };
      }).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }
  });
};
