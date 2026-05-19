import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalesStreak {
  id: string;
  salesperson_id: string;
  salesperson_name: string;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  last_sale_date: string | null;
  xp_multiplier: number;
}

export function useSalesStreaks() {
  return useQuery({
    queryKey: ['sales-streaks'],
    queryFn: async (): Promise<SalesStreak[]> => {
      // Get all salespeople with their streak data
      const { data: salespeople, error: spErr } = await supabase
        .from('salespeople')
        .select('id, name, avatar_url')
        .eq('is_active', true);
      if (spErr) throw spErr;

      const { data: streaks, error: strErr } = await supabase
        .from('sales_streaks')
        .select('*');
      if (strErr) throw strErr;

      // Calculate streaks from actual sales data
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const results: SalesStreak[] = (salespeople || []).map(sp => {
        const streak = streaks?.find(s => s.salesperson_id === sp.id);
        const currentStreak = streak?.current_streak || 0;
        const multiplier = currentStreak >= 10 ? 3.0 :
          currentStreak >= 5 ? 2.0 :
          currentStreak >= 2 ? 1.5 : 1.0;

        return {
          id: streak?.id || sp.id,
          salesperson_id: sp.id,
          salesperson_name: sp.name,
          avatar_url: sp.avatar_url,
          current_streak: currentStreak,
          longest_streak: streak?.longest_streak || 0,
          last_sale_date: streak?.last_sale_date || null,
          xp_multiplier: multiplier,
        };
      });

      return results.sort((a, b) => b.current_streak - a.current_streak);
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
}
