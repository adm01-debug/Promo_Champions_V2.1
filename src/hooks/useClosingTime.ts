import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClosingTime = (userId?: string) => {
  return useQuery({
    queryKey: ['closingTime', userId],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select('created_at, closed_at, stage')
        .eq('status', 'won')
        .not('closed_at', 'is', null);
      
      if (userId) {
        query = query.eq('owner_id', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const closingTimes = data.map(deal => {
        const created = new Date(deal.created_at).getTime();
        const closed = new Date(deal.closed_at).getTime();
        return Math.round((closed - created) / (1000 * 60 * 60 * 24)); // days
      });
      
      const avg = closingTimes.reduce((a, b) => a + b, 0) / closingTimes.length;
      const median = closingTimes.sort((a, b) => a - b)[Math.floor(closingTimes.length / 2)];
      
      return {
        average: Math.round(avg),
        median,
        shortest: Math.min(...closingTimes),
        longest: Math.max(...closingTimes),
        count: closingTimes.length,
      };
    },
  });
};
