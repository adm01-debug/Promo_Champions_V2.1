import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, subWeeks, endOfWeek } from 'date-fns';

interface WeeklyMetrics {
  revenue: number;
  salesCount: number;
  conversionRate: number;
  avgTicket: number;
  activitiesCount: number;
  newClients: number;
}

export function useWeeklyComparison() {
  return useQuery({
    queryKey: ['weekly-comparison'],
    queryFn: async () => {
      const now = new Date();
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

      const [thisSales, lastSales, thisActivities, lastActivities, thisClients, lastClients] = await Promise.all([
        supabase.from('sales').select('id, amount, status').gte('created_at', thisWeekStart.toISOString()),
        supabase.from('sales').select('id, amount, status').gte('created_at', lastWeekStart.toISOString()).lte('created_at', lastWeekEnd.toISOString()),
        supabase.from('activities').select('id').gte('created_at', thisWeekStart.toISOString()),
        supabase.from('activities').select('id').gte('created_at', lastWeekStart.toISOString()).lte('created_at', lastWeekEnd.toISOString()),
        supabase.from('clients').select('id').gte('created_at', thisWeekStart.toISOString()),
        supabase.from('clients').select('id').gte('created_at', lastWeekStart.toISOString()).lte('created_at', lastWeekEnd.toISOString()),
      ]);

      const buildMetrics = (
        sales: { id: string; amount: number | null; status: string | null }[],
        activities: { id: string }[],
        clients: { id: string }[]
      ): WeeklyMetrics => {
        const completed = sales.filter((s) => s.status === 'completed');
        const revenue = completed.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const salesCount = completed.length;
        return {
          revenue,
          salesCount,
          conversionRate: sales.length > 0 ? (salesCount / sales.length) * 100 : 0,
          avgTicket: salesCount > 0 ? revenue / salesCount : 0,
          activitiesCount: activities.length,
          newClients: clients.length,
        };
      };

      return {
        currentWeek: buildMetrics(thisSales.data || [], thisActivities.data || [], thisClients.data || []),
        previousWeek: buildMetrics(lastSales.data || [], lastActivities.data || [], lastClients.data || []),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
