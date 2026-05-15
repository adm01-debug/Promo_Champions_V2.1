import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { useEffect } from "react";

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

  // Fetch sales and metrics in parallel
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

  const sales = salesResult.data;
  const metrics = metricsResult.data;

  const completedSales = sales?.filter(s => s.status === "completed") || [];
  const totalRevenue = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalSales = completedSales.length;
  
  // Calculate from metrics or sales
  const newClients = metrics?.reduce((sum, m) => sum + m.new_clients, 0) || 0;
  const avgConversion = metrics?.length 
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
};

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const useDashboardKPIs = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
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

  return useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async (): Promise<KPIWithComparison> => {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));

      const [current, previous] = await Promise.all([
        fetchPeriodData(currentMonthStart, currentMonthEnd),
        fetchPeriodData(previousMonthStart, previousMonthEnd),
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
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));

      // Fetch ALL data in a single parallel batch
      const [currentMetrics, previousMetrics, stageHistoryResult, allSalesResult] = await Promise.all([
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
          .select("stage, entered_at, exited_at"),
        supabase
          .from("sales")
          .select("client_name, status"),
      ]);

      const current = currentMetrics.data || [];
      const previous = previousMetrics.data || [];
      const stageHistory = stageHistoryResult.data;
      const allSales = allSalesResult.data;

      // Calculate averages
      const calcAvg = (data: typeof current, key: keyof typeof current[0]) =>
        data.length ? data.reduce((sum, d) => sum + Number(d[key]), 0) / data.length : 0;

      const currentAvgTicket = calcAvg(current, "avg_ticket");
      const previousAvgTicket = calcAvg(previous, "avg_ticket");
      
      const currentConversion = calcAvg(current, "conversion_rate");
      const previousConversion = calcAvg(previous, "conversion_rate");

      // Calculate average closing time
      const closedDeals = stageHistory?.filter(
        (h) => h.stage === "completed" || h.stage === "Fechado"
      ) || [];
      
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

      // Calculate return rate from completed sales
      const completedSales = allSales?.filter(s => s.status === "completed") || [];
      const uniqueClients = new Set(completedSales.map(s => s.client_name));
      const repeatClients = completedSales.length - uniqueClients.size;
      const returnRate = completedSales.length > 0 
        ? (repeatClients / completedSales.length) * 100 
        : 0;

      const kpis: DetailedKPI[] = [
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
        // Ticket recorrente: estimativa de 70% do ticket médio (renovações/upgrades)
        {
          title: "Ticket Recorrente",
          value: `R$ ${(currentAvgTicket * 0.7).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
          previousValue: `R$ ${(previousAvgTicket * 0.7).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
          change: calculateChange(currentAvgTicket * 0.7, previousAvgTicket * 0.7),
          icon: "CreditCard",
        },
        // LTV: estimativa de 3x ticket médio (média de permanência de cliente)
        {
          title: "LTV Médio",
          value: `R$ ${(currentAvgTicket * 3).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
          previousValue: `R$ ${(previousAvgTicket * 3).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
          change: calculateChange(currentAvgTicket * 3, previousAvgTicket * 3),
          icon: "Wallet",
        },
      ];

      return kpis;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
