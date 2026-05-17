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
  meetingsScheduled?: number;
  qualifiedLeads?: number;
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
    meetings?: number;
    qualified?: number;
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

const change = (cur: number, prev: number): number => {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Number((((cur - prev) / prev) * 100).toFixed(1));
};

const fetchData = async (
  curStart: Date,
  curEnd: Date,
  prevStart: Date,
  prevEnd: Date,
  salespersonId?: string | null,
  role?: string | null
): Promise<KPIPeriodResult> => {
  const sCur = format(curStart, "yyyy-MM-dd");
  const eCur = format(curEnd, "yyyy-MM-dd");
  const sPrev = format(prevStart, "yyyy-MM-dd");
  const ePrev = format(prevEnd, "yyyy-MM-dd");

  const allStart = prevStart < curStart ? sPrev : sCur;
  const allEnd = prevEnd > curEnd ? ePrev + "T23:59:59" : eCur + "T23:59:59";

  let salesQuery = supabase
    .from("sales")
    .select("amount, status, created_at, salesperson_id, sdr_id, closer_id")
    .gte("created_at", allStart)
    .lte("created_at", allEnd);
    
  if (salespersonId) {
    if (role === 'sdr') {
      salesQuery = salesQuery.eq("sdr_id", salespersonId);
    } else if (role === 'closer') {
      salesQuery = salesQuery.eq("closer_id", salespersonId);
    } else {
      salesQuery = salesQuery.eq("salesperson_id", salespersonId);
    }
  }

  const tasksQuery = supabase
    .from("tasks")
    .select("id, task_type, created_at, salesperson_id")
    .gte("created_at", allStart)
    .lte("created_at", allEnd);

  const [salesRes, metricsRes, tasksRes] = await Promise.all([
    salesQuery,
    supabase
      .from("daily_metrics")
      .select("new_clients, conversion_rate, date")
      .gte("date", allStart)
      .lte("date", allEnd.split('T')[0]),
    tasksQuery
  ]);

  const allSales = salesRes.data ?? [];
  const allMetrics = metricsRes.data ?? [];
  const allTasks = tasksRes.data ?? [];

  const processPeriod = (start: Date, end: Date): KPIData => {
    const sStr = format(start, "yyyy-MM-dd");
    const eStr = format(end, "yyyy-MM-dd") + "T23:59:59";
    const eMetricStr = format(end, "yyyy-MM-dd");

    const periodSales = allSales.filter(s => s.created_at >= sStr && s.created_at <= eStr);
    const periodMetrics = allMetrics.filter(m => m.date >= sStr && m.date <= eMetricStr);
    const periodTasks = allTasks.filter(t => t.created_at >= sStr && t.created_at <= eStr);

    const completed = periodSales.filter((s) => s.status === "completed");
    const totalRevenue = completed.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalSales = completed.length;
    const newClients = role === 'sdr' 
      ? periodSales.length // For SDR, "new clients" are new leads they brought in
      : periodMetrics.reduce((sum, m) => sum + (m.new_clients || 0), 0);

    let conversionRate = 0;
    if (salespersonId) {
      if (role === 'sdr') {
        const qualifiedCount = periodSales.filter(s => 
          ["qualified", "proposal", "negotiation", "completed"].includes(s.status)
        ).length;
        conversionRate = periodSales.length > 0 ? (qualifiedCount / periodSales.length) * 100 : 0;
      } else {
        conversionRate = periodSales.length > 0 ? (completed.length / periodSales.length) * 100 : 0;
      }
    } else {
      conversionRate = periodMetrics.length
        ? periodMetrics.reduce((sum, m) => sum + Number(m.conversion_rate), 0) / periodMetrics.length
        : 0;
    }
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    const meetingsScheduled = periodTasks.filter(t => 
      t.task_type === 'meeting' && (salespersonId ? t.salesperson_id === salespersonId : true)
    ).length;

    const qualifiedLeads = periodSales.filter(s => 
      ["qualified", "proposal", "negotiation", "completed"].includes(s.status)
    ).length;

    return { 
      totalRevenue, 
      totalSales, 
      newClients, 
      conversionRate, 
      avgTicket,
      meetingsScheduled,
      qualifiedLeads
    };
  };

  const current = processPeriod(curStart, curEnd);
  const previous = processPeriod(prevStart, prevEnd);

  return {
    current,
    previous,
    changes: {
      revenue: change(current.totalRevenue, previous.totalRevenue),
      sales: change(current.totalSales, previous.totalSales),
      clients: change(current.newClients, previous.newClients),
      conversion: change(current.conversionRate, previous.conversionRate),
      avgTicket: change(current.avgTicket, previous.avgTicket),
      meetings: role === 'sdr' ? change(current.meetingsScheduled || 0, previous.meetingsScheduled || 0) : undefined,
      qualified: role === 'sdr' ? change(current.qualifiedLeads || 0, previous.qualifiedLeads || 0) : undefined,
    },
  };
};

export const useDashboardKPIsPeriod = (period: KPIPeriod, salespersonId?: string | null, role?: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!salespersonId && salespersonId !== null) return;

    const channelName = `dashboard-kpis-${salespersonId ?? 'all'}`;
    const channel = supabase
      .channel(channelName)
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
  }, [queryClient, salespersonId]);

  return useQuery({
    queryKey: ["dashboard-kpis-period", period, salespersonId ?? "all", role ?? "any"],
    queryFn: () => {
      const { curStart, curEnd, prevStart, prevEnd } = getRanges(period);
      return fetchData(curStart, curEnd, prevStart, prevEnd, salespersonId, role);
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const PERIOD_LABELS: Record<KPIPeriod, { label: string; comparison: string }> = {
  week: { label: "Semana", comparison: "Semana Anterior" },
  current_month: { label: "Mês", comparison: "Mês Anterior" },
  last_month: { label: "Último Mês", comparison: "Mês Anterior" },
  quarter: { label: "Trimestre", comparison: "Trimestre Anterior" },
  year: { label: "Ano", comparison: "Ano Anterior" },
};