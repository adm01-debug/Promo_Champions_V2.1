import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
    const channelId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(`dashboard-kpis-realtime-${channelId}`)
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

export interface DetailedKPI {
  title: string;
  value: string;
  change: number;
  previousValue: string;
  icon: string;
}

export const useDetailedKPIs = () => {
  return useQuery({
    queryKey: ['detailed-kpis'],
    queryFn: async (): Promise<DetailedKPI[]> => {
      try {
        const { data, error } = await supabase.rpc('get_detailed_kpis');
        if (error) throw error;

        const {
          current_avg_ticket,
          prev_avg_ticket,
          current_conversion,
          prev_conversion,
          avg_closing_days,
          return_rate,
          // eslint-disable-next-line no-restricted-syntax
        } = data as unknown as {
          current_avg_ticket: number;
          prev_avg_ticket: number;
          current_conversion: number;
          prev_conversion: number;
          avg_closing_days: number;
          return_rate: number;
        };

        return [
          {
            title: 'Ticket Médio',
            value: `R$ ${current_avg_ticket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            previousValue: `R$ ${prev_avg_ticket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            change: calculateChange(current_avg_ticket, prev_avg_ticket),
            icon: 'Receipt',
          },
          {
            title: 'Taxa de Conversão',
            value: `${current_conversion.toFixed(1)}%`,
            previousValue: `${prev_conversion.toFixed(1)}%`,
            change: calculateChange(current_conversion, prev_conversion),
            icon: 'Percent',
          },
          {
            title: 'Tempo Médio',
            value: `${Math.round(avg_closing_days)} dias`,
            previousValue: 'N/A',
            change: 0,
            icon: 'Clock',
          },
          {
            title: 'Taxa de Retorno',
            value: `${return_rate.toFixed(1)}%`,
            previousValue: 'N/A',
            change: 0,
            icon: 'RotateCcw',
          },
          {
            title: 'Ticket Recorrente',
            value: `R$ ${(current_avg_ticket * 0.7).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            previousValue: `R$ ${(prev_avg_ticket * 0.7).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            change: calculateChange(current_avg_ticket * 0.7, prev_avg_ticket * 0.7),
            icon: 'CreditCard',
          },
          {
            title: 'LTV Médio',
            value: `R$ ${(current_avg_ticket * 3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            previousValue: `R$ ${(prev_avg_ticket * 3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            change: calculateChange(current_avg_ticket * 3, prev_avg_ticket * 3),
            icon: 'Wallet',
          },
        ];
      } catch (error) {
        captureException(error, 'useDetailedKPIs');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
