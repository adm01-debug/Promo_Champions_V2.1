import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { uniqueChannelTopic } from '@/lib/supabase/realtime';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { captureException } from '@/lib/errorTracking';

interface KPIData {
  totalRevenue: number;
  totalSales: number;
  newClients: number;
  conversionRate: number;
  avgTicket: number;
  firstSaleRevenue?: number;
  recurringRevenue?: number;
}

interface KPIWithComparison {
  current: KPIData;
  previous: KPIData;
  changes: {
    revenue: number;
    sales: number;
    clients: number;
    conversion: number;
    avgTicket: number;
  };
}

const fetchPeriodData = async (startDate: Date, endDate: Date): Promise<KPIData> => {
  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');

  try {
    const { data, error } = await supabase.rpc('get_dashboard_kpis', {
      start_date: start,
      end_date: end,
    });

    if (error) throw error;
    // eslint-disable-next-line no-restricted-syntax
    return data as unknown as KPIData;
  } catch (error) {
    captureException(error, 'fetchPeriodData');
    throw error;
  }
};

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const useDashboardKPIs = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Optimized realtime invalidation: only invalidates if relevant tables change
    const channel = supabase
      .channel(uniqueChannelTopic('dashboard-kpis-realtime'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_metrics' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const dates = useMemo(() => {
    const now = new Date();
    return {
      currentMonthStart: startOfMonth(now),
      currentMonthEnd: endOfMonth(now),
      previousMonthStart: startOfMonth(subMonths(now, 1)),
      previousMonthEnd: endOfMonth(subMonths(now, 1)),
    };
  }, []);

  return useQuery({
    queryKey: ['dashboard-kpis', dates],
    queryFn: async (): Promise<KPIWithComparison> => {
      const [current, previous] = await Promise.all([
        fetchPeriodData(dates.currentMonthStart, dates.currentMonthEnd),
        fetchPeriodData(dates.previousMonthStart, dates.previousMonthEnd),
      ]);

      return {
        current,
        previous,
        changes: {
          revenue: calculateChange(current.totalRevenue, previous.totalRevenue),
          sales: calculateChange(current.totalSales, previous.totalSales),
          clients: calculateChange(current.newClients, previous.newClients),
          conversion: calculateChange(current.conversionRate, previous.conversionRate),
          avgTicket: calculateChange(current.avgTicket, previous.avgTicket),
        },
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: attempt => Math.min(attempt * 1000, 5000),
  });
};
