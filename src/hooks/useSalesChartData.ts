import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, startOfWeek, startOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Period = '7d' | '30d' | '90d';

interface ChartPoint {
  name: string;
  value: number;
}

export function useSalesChartData(period: Period) {
  return useQuery<ChartPoint[]>({
    queryKey: ['sales-chart', period],
    queryFn: async () => {
      const now = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = subDays(now, days);

      const { data: sales, error } = await supabase
        .from('sales')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!sales || sales.length === 0) return [];

      const grouped = new Map<string, number>();

      if (period === '7d') {
        // Group by day
        for (let i = 6; i >= 0; i--) {
          const d = subDays(now, i);
          const key = format(d, 'EEE', { locale: ptBR });
          grouped.set(key, 0);
        }
        sales.forEach(s => {
          const key = format(parseISO(s.created_at), 'EEE', { locale: ptBR });
          grouped.set(key, (grouped.get(key) || 0) + Number(s.amount));
        });
      } else if (period === '30d') {
        // Group by week
        for (let i = 3; i >= 0; i--) {
          grouped.set(`Sem ${4 - i}`, 0);
        }
        sales.forEach(s => {
          const weekStart = startOfWeek(parseISO(s.created_at), { weekStartsOn: 1 });
          const weeksDiff = Math.floor((now.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const weekNum = Math.max(1, 4 - weeksDiff);
          const key = `Sem ${weekNum}`;
          if (grouped.has(key)) {
            grouped.set(key, (grouped.get(key) || 0) + Number(s.amount));
          }
        });
      } else {
        // Group by month
        for (let i = 0; i < 3; i++) {
          const d = subDays(now, (2 - i) * 30);
          const key = format(d, 'MMM', { locale: ptBR });
          grouped.set(key, 0);
        }
        sales.forEach(s => {
          const key = format(parseISO(s.created_at), 'MMM', { locale: ptBR });
          grouped.set(key, (grouped.get(key) || 0) + Number(s.amount));
        });
      }

      return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }));
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
