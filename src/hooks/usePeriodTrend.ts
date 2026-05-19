import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears,
  eachMonthOfInterval,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  format,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { KPIPeriod } from "@/hooks/dashboard/useDashboardKPIsPeriod";

export interface TrendBucket {
  label: string;
  fullLabel: string;
  revenue: number;
  sales: number;
}

const getRange = (period: KPIPeriod) => {
  const now = new Date();
  switch (period) {
    case "week":
      return { start: startOfWeek(now, { locale: ptBR }), end: endOfWeek(now, { locale: ptBR }), granularity: "day" as const };
    case "current_month":
      return { start: startOfMonth(now), end: endOfMonth(now), granularity: "week" as const };
    case "last_month": {
      const last = subMonths(now, 1);
      return { start: startOfMonth(last), end: endOfMonth(last), granularity: "week" as const };
    }
    case "quarter":
      return { start: startOfQuarter(now), end: endOfQuarter(now), granularity: "month" as const };
    case "year":
      return { start: startOfYear(now), end: endOfYear(now), granularity: "month" as const };
  }
};

export const usePeriodTrend = (period: KPIPeriod) => {
  return useQuery({
    queryKey: ["period-trend", period],
    queryFn: async (): Promise<TrendBucket[]> => {
      const { start, end, granularity } = getRange(period);
      const s = format(start, "yyyy-MM-dd");
      const e = format(end, "yyyy-MM-dd");

      const { data } = await supabase
        .from("sales")
        .select("amount, status, created_at")
        .gte("created_at", s)
        .lte("created_at", e + "T23:59:59");

      const completed = (data ?? []).filter((r) => r.status === "completed");

      let buckets: { start: Date; end: Date; label: string; fullLabel: string }[] = [];
      
      if (granularity === "month") {
        buckets = eachMonthOfInterval({ start, end }).map((d) => ({
          start: startOfMonth(d),
          end: endOfMonth(d),
          label: format(d, "MMM", { locale: ptBR }),
          fullLabel: format(d, "MMMM yyyy", { locale: ptBR }),
        }));
      } else if (granularity === "week") {
        buckets = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((d, i) => ({
          start: startOfWeek(d, { weekStartsOn: 1 }),
          end: endOfWeek(d, { weekStartsOn: 1 }),
          label: `S${i + 1}`,
          fullLabel: `Semana ${i + 1} • ${format(d, "dd/MM", { locale: ptBR })}`,
        }));
      } else {
        // day granularity
        const days = [];
        let curr = start;
        while (curr <= end) {
          days.push(new Date(curr));
          curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
        }
        buckets = days.map(d => ({
          start: startOfDay(d),
          end: endOfDay(d),
          label: format(d, "EEE", { locale: ptBR }),
          fullLabel: format(d, "dd 'de' MMMM", { locale: ptBR }),
        }));
      }

      return buckets.map((b) => {
        const inBucket = completed.filter((r) =>
          isWithinInterval(new Date(r.created_at as string), { start: b.start, end: b.end })
        );
        return {
          label: b.label,
          fullLabel: b.fullLabel,
          revenue: inBucket.reduce((sum, r) => sum + Number(r.amount), 0),
          sales: inBucket.length,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};
