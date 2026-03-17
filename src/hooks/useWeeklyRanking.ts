import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek } from 'date-fns';

export interface WeeklyRankedPerson {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  weeklySales: number;
  dealsCount: number;
  rank: number;
}

export function useWeeklyRanking() {
  return useQuery({
    queryKey: ['weekly-ranking'],
    queryFn: async (): Promise<WeeklyRankedPerson[]> => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const [spResult, salesResult] = await Promise.all([
        supabase.rpc('get_active_salespeople'),
        supabase
          .from('sales')
          .select('salesperson_id, amount')
          .eq('status', 'completed')
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString()),
      ]);

      if (spResult.error) throw spResult.error;
      if (salesResult.error) throw salesResult.error;

      const salespeople = spResult.data || [];
      const sales = salesResult.data || [];

      const sorted = salespeople
        .map(sp => {
          const spSales = sales.filter(s => s.salesperson_id === sp.id);
          return {
            id: sp.id,
            name: sp.name,
            avatar_url: sp.avatar_url,
            role: sp.role,
            weeklySales: spSales.reduce((sum, s) => sum + Number(s.amount), 0),
            dealsCount: spSales.length,
            rank: 0,
          };
        })
        .sort((a, b) => b.weeklySales - a.weeklySales);

      return sorted.map((sp, i) => ({ ...sp, rank: i + 1 }));
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
