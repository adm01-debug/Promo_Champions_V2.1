import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export interface SelfBenchmarkMetric {
  label: string;
  current: number;
  avg3Months: number;
  change: number; // percentage
  trend: "up" | "down" | "stable";
  format: "currency" | "number" | "percent";
}

export function useSelfBenchmark(salespersonId?: string) {
  return useQuery({
    queryKey: ["self-benchmark", salespersonId],
    enabled: !!salespersonId,
    queryFn: async (): Promise<SelfBenchmarkMetric[]> => {
      const now = new Date();

      // Fetch 4 months: current + 3 previous for avg
      const months = Array.from({ length: 4 }, (_, i) => {
        const d = subMonths(now, i);
        return { start: startOfMonth(d), end: endOfMonth(d), isCurrent: i === 0 };
      });

      const [salesResult, activitiesResult, outcomesResult] = await Promise.all([
        supabase
          .from("sales")
          .select("amount, status, created_at")
          .eq("salesperson_id", salespersonId!)
          .gte("created_at", months[months.length - 1].start.toISOString()),
        supabase
          .from("activities")
          .select("id, outcome, created_at")
          .eq("salesperson_id", salespersonId!)
          .gte("created_at", months[months.length - 1].start.toISOString()),
        supabase
          .from("deal_outcomes")
          .select("outcome, created_at")
          .eq("salesperson_id", salespersonId!)
          .gte("created_at", months[months.length - 1].start.toISOString()),
      ]);

      const sales = salesResult.data || [];
      const activities = activitiesResult.data || [];
      const outcomes = outcomesResult.data || [];

      const monthlyStats = months.map((m) => {
        const mSales = sales.filter(
          (s) =>
            s.status === "completed" &&
            new Date(s.created_at) >= m.start &&
            new Date(s.created_at) <= m.end
        );
        const mAllSales = sales.filter(
          (s) => new Date(s.created_at) >= m.start && new Date(s.created_at) <= m.end
        );
        const mActivities = activities.filter(
          (a) => new Date(a.created_at) >= m.start && new Date(a.created_at) <= m.end
        );
        const mOutcomes = outcomes.filter(
          (o) => new Date(o.created_at) >= m.start && new Date(o.created_at) <= m.end
        );

        const revenue = mSales.reduce((sum, s) => sum + Number(s.amount), 0);
        const avgTicket = mSales.length > 0 ? revenue / mSales.length : 0;
        const wins = mOutcomes.filter((o) => o.outcome === "won").length;
        const winRate = mOutcomes.length > 0 ? (wins / mOutcomes.length) * 100 : 0;
        const conversion = mAllSales.length > 0 ? (mSales.length / mAllSales.length) * 100 : 0;

        return {
          revenue,
          deals: mSales.length,
          avgTicket,
          activities: mActivities.length,
          winRate,
          conversion,
          isCurrent: m.isCurrent,
        };
      });

      const current = monthlyStats[0];
      const previous = monthlyStats.slice(1);

      const avg = (key: keyof (typeof monthlyStats)[0]) => {
        const vals = previous.map((p) => Number(p[key])).filter((v) => v > 0);
        return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      };

      const buildMetric = (
        label: string,
        currentVal: number,
        avgVal: number,
        format: "currency" | "number" | "percent"
      ): SelfBenchmarkMetric => {
        const change = avgVal > 0 ? Math.round(((currentVal - avgVal) / avgVal) * 100) : 0;
        return {
          label,
          current: Math.round(currentVal),
          avg3Months: Math.round(avgVal),
          change,
          trend: change > 5 ? "up" : change < -5 ? "down" : "stable",
          format,
        };
      };

      return [
        buildMetric("Receita", current.revenue, avg("revenue"), "currency"),
        buildMetric("Deals Fechados", current.deals, avg("deals"), "number"),
        buildMetric("Ticket Médio", current.avgTicket, avg("avgTicket"), "currency"),
        buildMetric("Atividades", current.activities, avg("activities"), "number"),
        buildMetric("Taxa de Conversão", current.conversion, avg("conversion"), "percent"),
        buildMetric("Win Rate", current.winRate, avg("winRate"), "percent"),
      ];
    },
    staleTime: 120000,
  });
}
