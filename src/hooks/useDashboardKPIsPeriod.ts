import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export type KPIPeriod = "week" | "current_month" | "last_month" | "quarter" | "year";

interface KPIData {
  totalRevenue: number;
  totalSales: number;
  newClients: number;
  conversionRate: number;
  avgTicket: number;
}

export interface KPIPeriodResult {
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

const getRanges = (period: KPIPeriod) => {
  const now = new Date();
  switch (period) {
    case "week":
      return {
        curStart: startOfWeek(now, { locale: ptBR }),
        curEnd: endOfWeek(now, { locale: ptBR }),
        prevStart: startOfWeek(subWeeks(now, 1), { locale: ptBR }),
        prevEnd: endOfWeek(subWeeks(now, 1), { locale: ptBR }),
      };
    case "current_month":
      return {
        curStart: startOfMonth(now),
        curEnd: endOfMonth(now),
        prevStart: startOfMonth(subMonths(now, 1)),
        prevEnd: endOfMonth(subMonths(now, 1)),
      };
    case "last_month": {
      const last = subMonths(now, 1);
      return {
        curStart: startOfMonth(last),
        curEnd: endOfMonth(last),
        prevStart: startOfMonth(subMonths(now, 2)),
        prevEnd: endOfMonth(subMonths(now, 2)),
      };
    }
    case "quarter":
      return {
        curStart: startOfQuarter(now),
        curEnd: endOfQuarter(now),
        prevStart: startOfQuarter(subQuarters(now, 1)),
        prevEnd: endOfQuarter(subQuarters(now, 1)),
      };
    case "year":
      return {
        curStart: startOfYear(now),
        curEnd: endOfYear(now),
        prevStart: startOfYear(subYears(now, 1)),
        prevEnd: endOfYear(subYears(now, 1)),
      };
  }
};

const fetchPeriod = async (
  start: Date,
  end: Date,
  salespersonId?: string | null
): Promise<KPIData> => {
  const s = format(start, "yyyy-MM-dd");
  const e = format(end, "yyyy-MM-dd");

  let salesQuery = supabase
    .from("sales")
    .select("amount, status")
    .gte("created_at", s)
    .lte("created_at", e + "T23:59:59");
  if (salespersonId) salesQuery = salesQuery.eq("salesperson_id", salespersonId);

  const [salesRes, metricsRes] = await Promise.all([
    salesQuery,
    supabase
      .from("daily_metrics")
      .select("new_clients, conversion_rate")
      .gte("date", s)
      .lte( "date", e)
  ]);

  const all = salesRes.data ?? [];
  const metrics = metricsRes.data ?? [];
  
  const completed = all.filter((s) => s.status === "completed");
  const totalRevenue = completed.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalSales = completed.length;
  const newClients = metrics.reduce((sum, m) => sum + (m.new_clients || 0), 0);

  let conversionRate = 0;
  if (salespersonId) {
    conversionRate = all.length > 0 ? (completed.length / all.length) * 100 : 0;
  } else {
    conversionRate = metrics.length
      ? metrics.reduce((sum, m) => sum + Number(m.conversion_rate), 0) / metrics.length
      : 0;
  }
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  return { totalRevenue, totalSales, newClients, conversionRate, avgTicket };
};

const change = (cur: number, prev: number): number => {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Number((((cur - prev) / prev) * 100).toFixed(1));
};

export const useDashboardKPIsPeriod = (period: KPIPeriod, salespersonId?: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-kpis-period-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-kpis-period"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["dashboard-kpis-period", period, salespersonId ?? "all"],
    queryFn: async (): Promise<KPIPeriodResult> => {
      const { curStart, curEnd, prevStart, prevEnd } = getRanges(period);
      const [current, previous] = await Promise.all([
        fetchPeriod(curStart, curEnd, salespersonId),
        fetchPeriod(prevStart, prevEnd, salespersonId),
      ]);
      return {
        current,
        previous,
        changes: {
          revenue: change(current.totalRevenue, previous.totalRevenue),
          sales: change(current.totalSales, previous.totalSales),
          clients: change(current.newClients, previous.newClients),
          conversion: change(current.conversionRate, previous.conversionRate),
          avgTicket: change(current.avgTicket, previous.avgTicket),
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const PERIOD_LABELS: Record<KPIPeriod, { label: string; comparison: string }> = {
  week: { label: "Semana", comparison: "Semana Anterior" },
  current_month: { label: "Mês", comparison: "Mês Anterior" },
  last_month: { label: "Último Mês", comparison: "Mês Anterior" },
  quarter: { label: "Trimestre", comparison: "Trimestre Anterior" },
  year: { label: "Ano", comparison: "Ano Anterior" },
};