import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { startOfMonth, subMonths, startOfYear, subYears, endOfMonth, format, parseISO } from "date-fns";
import { CACHE_TIMES } from "@/constants";

export type BenchmarkPeriod = "mom" | "qoq" | "yoy";

interface PeriodData {
  revenue: number;
  deals: number;
  avgTicket: number;
  conversionRate: number;
}

export interface BenchmarkResult {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  format: "currency" | "number" | "percent";
}

function getDateRanges(period: BenchmarkPeriod) {
  const now = new Date();
  let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

  switch (period) {
    case "mom":
      currentStart = startOfMonth(now);
      currentEnd = now;
      previousStart = startOfMonth(subMonths(now, 1));
      previousEnd = endOfMonth(subMonths(now, 1));
      break;
    case "qoq":
      currentStart = startOfMonth(subMonths(now, 2));
      currentEnd = now;
      previousStart = startOfMonth(subMonths(now, 5));
      previousEnd = endOfMonth(subMonths(now, 3));
      break;
    case "yoy":
      currentStart = startOfYear(now);
      currentEnd = now;
      previousStart = startOfYear(subYears(now, 1));
      previousEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
  }

  return {
    current: { start: currentStart.toISOString(), end: currentEnd.toISOString() },
    previous: { start: previousStart.toISOString(), end: previousEnd.toISOString() },
  };
}

export const useBenchmarkData = (period: BenchmarkPeriod) => {
  const ranges = useMemo(() => getDateRanges(period), [period]);

  const { data: currentSales } = useQuery({
    queryKey: ["benchmark-current", period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, amount, status, created_at")
        .gte("created_at", ranges.current.start)
        .lte("created_at", ranges.current.end);
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  const { data: previousSales } = useQuery({
    queryKey: ["benchmark-previous", period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, amount, status, created_at")
        .gte("created_at", ranges.previous.start)
        .lte("created_at", ranges.previous.end);
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  const benchmarks = useMemo((): BenchmarkResult[] => {
    if (!currentSales || !previousSales) return [];

    const calc = (sales: typeof currentSales): PeriodData => {
      const closed = sales.filter((s) => s.status === "closed");
      const revenue = closed.reduce((sum, s) => sum + (s.amount || 0), 0);
      const avgTicket = closed.length > 0 ? revenue / closed.length : 0;
      const convRate = sales.length > 0 ? (closed.length / sales.length) * 100 : 0;
      return { revenue, deals: closed.length, avgTicket, conversionRate: convRate };
    };

    const current = calc(currentSales);
    const previous = calc(previousSales);

    const makeBenchmark = (
      metric: string,
      cur: number,
      prev: number,
      fmt: "currency" | "number" | "percent"
    ): BenchmarkResult => {
      const change = cur - prev;
      const changePercent = prev !== 0 ? (change / prev) * 100 : cur > 0 ? 100 : 0;
      const trend: "up" | "down" | "stable" =
        Math.abs(changePercent) < 1 ? "stable" : changePercent > 0 ? "up" : "down";
      return { metric, current: cur, previous: prev, change, changePercent, trend, format: fmt };
    };

    return [
      makeBenchmark("Receita", current.revenue, previous.revenue, "currency"),
      makeBenchmark("Deals Fechados", current.deals, previous.deals, "number"),
      makeBenchmark("Ticket Médio", current.avgTicket, previous.avgTicket, "currency"),
      makeBenchmark("Taxa de Conversão", current.conversionRate, previous.conversionRate, "percent"),
    ];
  }, [currentSales, previousSales]);

  return { benchmarks, isLoading: !currentSales || !previousSales };
};
