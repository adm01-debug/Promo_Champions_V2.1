import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Deal {
  id: string;
  created_at: string;
  closed_at: string;
  status: 'open' | 'won' | 'lost';
  value: number;
  title: string;
}

interface ClosingTimeStats {
  avgDays: number;
  medianDays: number;
  minDays: number;
  maxDays: number;
  dealCount: number;
  p25Days: number;
  p75Days: number;
}

export const useClosingTime = () => {
  return useQuery<ClosingTimeStats>({
    queryKey: ['closing-time'],
    queryFn: async (): Promise<ClosingTimeStats> => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, created_at, closed_at, status, value, title')
        .eq('status', 'won')
        .not('closed_at', 'is', null);
      
      if (error) {
        console.error('Error fetching closing time data:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return {
          avgDays: 0,
          medianDays: 0,
          minDays: 0,
          maxDays: 0,
          dealCount: 0,
          p25Days: 0,
          p75Days: 0
        };
      }
      
      const deals = data as Deal[];
      
      const closingTimes = deals.map((deal) => {
        const created = new Date(deal.created_at);
        const closed = new Date(deal.closed_at);
        return (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      });
      
      closingTimes.sort((a, b) => a - b);
      
      const sum = closingTimes.reduce((acc, val) => acc + val, 0);
      const avg = sum / closingTimes.length;
      const median = closingTimes[Math.floor(closingTimes.length / 2)];
      const min = closingTimes[0];
      const max = closingTimes[closingTimes.length - 1];
      const p25 = closingTimes[Math.floor(closingTimes.length * 0.25)];
      const p75 = closingTimes[Math.floor(closingTimes.length * 0.75)];
      
      return {
        avgDays: Math.round(avg * 10) / 10,
        medianDays: Math.round(median * 10) / 10,
        minDays: Math.round(min * 10) / 10,
        maxDays: Math.round(max * 10) / 10,
        dealCount: deals.length,
        p25Days: Math.round(p25 * 10) / 10,
        p75Days: Math.round(p75 * 10) / 10
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  });
};
