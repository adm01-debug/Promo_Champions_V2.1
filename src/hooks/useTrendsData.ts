import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface TrendPoint {
  week: string;
  weekFull: string;
  revenue: number;
  sales: number;
  conversion: number;
}

export const useTrendsData = (weeks: number = 8) => {
  return useQuery({
    queryKey: ["dashboard-trends", weeks],
    queryFn: async (): Promise<TrendPoint[]> => {
      const now = new Date();
      const ranges = Array.from({ length: weeks }, (_, i) => {
        const ref = subWeeks(now, weeks - 1 - i);
        const start = startOfWeek(ref, { weekStartsOn: 1 });
        const end = endOfWeek(ref, { weekStartsOn: 1 });
        return { start, end };
      });

      const earliest = ranges[0].start;
      const latest = ranges[ranges.length - 1].end;

      const [salesRes, metricsRes] = await Promise.all([
        supabase
          .from("sales")
          .select("amount, status, created_at")
          .gte("created_at", earliest.toISOString())
          .lte("created_at", latest.toISOString()),
        supabase
          .from("daily_metrics")
          .select("conversion_rate, date")
          .gte("date", format(earliest, "yyyy-MM-dd"))
          .lte("date", format(latest, "yyyy-MM-dd")),
      ]);

      const sales = salesRes.data ?? [];
      const metrics = metricsRes.data ?? [];

      return ranges.map(({ start, end }) => {
        const inRange = sales.filter((s) => {
          const t = new Date(s.created_at).getTime();
          return t >= start.getTime() && t <= end.getTime() && s.status === "completed";
        });
        const revenue = inRange.reduce((sum, s) => sum + Number(s.amount), 0);
        const salesCount = inRange.length;
        const wkMetrics = metrics.filter((m) => {
          const t = new Date(m.date).getTime();
          return t >= start.getTime() && t <= end.getTime();
        });
        const conversion = wkMetrics.length
          ? wkMetrics.reduce((s, m) => s + Number(m.conversion_rate), 0) / wkMetrics.length
          : 0;

        return {
          week: format(start, "dd/MM", { locale: ptBR }),
          weekFull: `${format(start, "dd MMM", { locale: ptBR })} - ${format(end, "dd MMM", { locale: ptBR })}`,
          revenue,
          sales: salesCount,
          conversion,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};
