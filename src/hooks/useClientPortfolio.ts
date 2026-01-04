import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientSegment {
  segment: 'A' | 'B' | 'C';
  count: number;
  totalValue: number;
  avgValue: number;
}

export const useClientPortfolio = (userId?: string) => {
  return useQuery({
    queryKey: ['clientPortfolio', userId],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*, deals(value, status)');
      
      if (userId) {
        query = query.eq('owner_id', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // ABC Analysis
      const clientsWithValue = data.map(client => ({
        ...client,
        totalValue: client.deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0,
      })).sort((a, b) => b.totalValue - a.totalValue);
      
      const totalValue = clientsWithValue.reduce((sum, c) => sum + c.totalValue, 0);
      
      let accumulated = 0;
      const segments: ClientSegment[] = [
        { segment: 'A', count: 0, totalValue: 0, avgValue: 0 },
        { segment: 'B', count: 0, totalValue: 0, avgValue: 0 },
        { segment: 'C', count: 0, totalValue: 0, avgValue: 0 },
      ];
      
      clientsWithValue.forEach((client) => {
        accumulated += client.totalValue;
        const percentage = (accumulated / totalValue) * 100;
        
        const segmentIndex = percentage <= 80 ? 0 : percentage <= 95 ? 1 : 2;
        segments[segmentIndex].count++;
        segments[segmentIndex].totalValue += client.totalValue;
      });
      
      segments.forEach(s => {
        s.avgValue = s.count > 0 ? s.totalValue / s.count : 0;
      });
      
      return { clients: clientsWithValue, segments };
    },
  });
};
