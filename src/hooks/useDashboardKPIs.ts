import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, subDays } from "date-fns";
import { useEffect, useMemo } from "react";
import { captureException } from "@/lib/errorTracking";

interface KPIData {
  totalRevenue: number;
  totalSales: number;
  newClients: number;
  conversionRate: number;
  avgTicket: number;
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
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(endDate, "yyyy-MM-dd");

  try {
    // Fetch sales and metrics in parallel with selected columns for performance
    const [salesResult, metricsResult] = await Promise.all([
      supabase
        .from("sales")
        .select("amount, status")
        .gte("created_at", start)
        .lte("created_at", end),
      supabase
        .from("daily_metrics")
        .select("new_clients, conversion_rate")
        .gte("date", start)
        .lte("date", end),
    ]);

    if (salesResult.error) throw salesResult.error;
    if (metricsResult.error) throw metricsResult.error;

    const sales = salesResult.data || [];
    const metrics = metricsResult.data || [];

    const completedSales = sales.filter(s => s.status === "completed");
    const totalRevenue = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalSales = completedSales.length;
    
    const newClients = metrics.reduce((sum, m) => sum + m.new_clients, 0);
    const avgConversion = metrics.length 
      ? metrics.reduce((sum, m) => sum + Number(m.conversion_rate), 0) / metrics.length 
      : 0;
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalRevenue,
      totalSales,
      newClients,
      conversionRate: avgConversion,
      avgTicket,
    };
  } catch (error) {
    captureException(error, "fetchPeriodData");
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
    // Debounced invalidation would be better but for now let's use a simple channel
    const channel = supabase
      .channel('dashboard-kpis-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_metrics' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
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
    queryKey: ["dashboard-kpis", dates],
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
    staleTime: 5 * 60 * 1000, // Increased to 5 minutes for better performance
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(attempt * 1000, 5000),
  });
};

// Additional KPIs hook
export interface DetailedKPI {
  title: string;
  value: string;
  change: number;
  previousValue: string;
  icon: string;
}

export const useDetailedKPIs = () => {
  return useQuery({
    queryKey: ["detailed-kpis"],
    queryFn: async (): Promise<DetailedKPI[]> => {
      try {
        const now = new Date();
        const sixtyDaysAgo = subDays(now, 60);
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        const previousMonthStart = startOfMonth(subMonths(now, 1));
        const previousMonthEnd = endOfMonth(subMonths(now, 1));

        // Optimized fetching with column selection and date filtering
        const [currentMetrics, previousMetrics, stageHistoryResult, recentSalesResult] = await Promise.all([
          supabase
            .from("daily_metrics")
            .select("avg_ticket, conversion_rate")
            .gte("date", format(currentMonthStart, "yyyy-MM-dd"))
            .lte("date", format(currentMonthEnd, "yyyy-MM-dd")),
          supabase
            .from("daily_metrics")
            .select("avg_ticket, conversion_rate")
            .gte("date", format(previousMonthStart, "yyyy-MM-dd"))
            .lte("date", format(previousMonthEnd, "yyyy-MM-dd")),
          supabase
            .from("deal_stage_history")
            .select("stage, entered_at, exited_at")
            .gte("entered_at", sixtyDaysAgo.toISOString()), // Filter by last 60 days
          supabase
            .from("sales")
            .select("client_name, status")
            .gte("created_at", sixtyDaysAgo.toISOString()), // Filter by last 60 days
        ]);

        if (currentMetrics.error) throw currentMetrics.error;
        if (previousMetrics.error) throw previousMetrics.error;
        if (stageHistoryResult.error) throw stageHistoryResult.error;
        if (recentSalesResult.error) throw recentSalesResult.error;

        const current = currentMetrics.data || [];
        const previous = previousMetrics.data || [];
        const stageHistory = stageHistoryResult.data || [];
        const recentSales = recentSalesResult.data || [];

        const calcAvg = (data: any[], key: string) =>
          data.length ? data.reduce((sum, d) => sum + Number(d[key] || 0), 0) / data.length : 0;

        const currentAvgTicket = calcAvg(current, "avg_ticket");
        const previousAvgTicket = calcAvg(previous, "avg_ticket");
        
        const currentConversion = calcAvg(current, "conversion_rate");
        const previousConversion = calcAvg(previous, "conversion_rate");

        // Closing time calculation
        const closedDeals = stageHistory.filter(
          (h) => h.stage === "completed" || h.stage === "Fechado"
        );
        
        let avgClosingDays = 0;
        if (closedDeals.length > 0) {
          const closingTimes = closedDeals
            .filter(d => d.entered_at)
            .map(d => {
              const start = new Date(d.entered_at);
              const end = d.exited_at ? new Date(d.exited_at) : new Date();
              return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            });
          avgClosingDays = closingTimes.length > 0 
            ? closingTimes.reduce((a, b) => a + b, 0) / closingTimes.length 
            : 0;
        }

        // Return rate calculation
        const completedSales = recentSales.filter(s => s.status === "completed");
        const uniqueClients = new Set(completedSales.map(s => s.client_name));
        const repeatClients = completedSales.length - uniqueClients.size;
        const returnRate = completedSales.length > 0 
          ? (repeatClients / completedSales.length) * 100 
          : 0;

        return [
          {
            title: "Ticket Médio",
            value: `R$ ${currentAvgTicket.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
            previousValue: `R$ ${previousAvgTicket.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
            change: calculateChange(currentAvgTicket, previousAvgTicket),
            icon: "Receipt",
          },
          {
            title: "Taxa de Conversão",
            value: `${currentConversion.toFixed(1)}%`,
            previousValue: `${previousConversion.toFixed(1)}%`,
            change: calculateChange(currentConversion, previousConversion),
            icon: "Percent",
          },
          {
            title: "Tempo Médio",
            value: `${Math.round(avgClosingDays)} dias`,
            previousValue: "N/A",
            change: 0,
            icon: "Clock",
          },
          {
            title: "Taxa de Retorno",
            value: `${returnRate.toFixed(1)}%`,
            previousValue: "N/A",
            change: 0,
            icon: "RotateCcw",
          },
          {
            title: "Ticket Recorrente",
            value: `R$ ${(currentAvgTicket * 0.7).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
            previousValue: `R$ ${(previousAvgTicket * 0.7).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
            change: calculateChange(currentAvgTicket * 0.7, previousAvgTicket * 0.7),
            icon: "CreditCard",
          },
          {
            title: "LTV Médio",
            value: `R$ ${(currentAvgTicket * 3).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
            previousValue: `R$ ${(previousAvgTicket * 3).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
            change: calculateChange(currentAvgTicket * 3, previousAvgTicket * 3),
            icon: "Wallet",
          },
        ];
      } catch (error) {
        captureException(error, "useDetailedKPIs");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
