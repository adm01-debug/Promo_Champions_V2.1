import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RegionalData {
  region: string;
  totalDeals: number;
  wonDeals: number;
  totalValue: number;
  avgDealSize: number;
  winRate: number;
}

export const useRegionalSales = () => {
  return useQuery({
    queryKey: ['regionalSales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('region, value, status');
      
      if (error) throw error;
      
      const regionMap = new Map<string, RegionalData>();
      
      data.forEach(deal => {
        const region = deal.region || 'Unknown';
        
        if (!regionMap.has(region)) {
          regionMap.set(region, {
            region,
            totalDeals: 0,
            wonDeals: 0,
            totalValue: 0,
            avgDealSize: 0,
            winRate: 0,
          });
        }
        
        const regionData = regionMap.get(region)!;
        regionData.totalDeals++;
        
        if (deal.status === 'won') {
          regionData.wonDeals++;
          regionData.totalValue += deal.value || 0;
        }
      });
      
      const result = Array.from(regionMap.values()).map(r => ({
        ...r,
        avgDealSize: r.wonDeals > 0 ? r.totalValue / r.wonDeals : 0,
        winRate: r.totalDeals > 0 ? (r.wonDeals / r.totalDeals) * 100 : 0,
      }));
      
      return result.sort((a, b) => b.totalValue - a.totalValue);
    },
  });
};
