import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InsightImpact {
  id: string;
  title: string;
  applied_at: string;
  beforeWinRate: number;
  afterWinRate: number;
  uplift: number;
  beforeCount: number;
  afterCount: number;
}

interface InsightRow {
  id: string;
  title: string;
  applied_at: string | null;
}

interface AnalysisRow {
  outcome: "won" | "lost";
  analyzed_at: string;
}

const WINDOW_DAYS = 30;

export function useInsightsImpact() {
  return useQuery({
    queryKey: ["wl-insights-impact"],
    queryFn: async (): Promise<InsightImpact[]> => {
      const { data: insightsRaw } = await supabase
        .from("win_loss_insights")
        .select("id, title, applied_at")
        .order("applied_at", { ascending: false })
        .limit(100);

      const insights = ((insightsRaw ?? []) as unknown as InsightRow[]).filter((i) => i.applied_at);
      if (!insights.length) return [];

      const oldest = insights.reduce<Date | null>((acc, i) => {
        const t = new Date(i.applied_at as string);
        return !acc || t < acc ? t : acc;
      }, null);
      if (!oldest) return [];

      const lower = new Date(oldest);
      lower.setDate(lower.getDate() - WINDOW_DAYS);

      const { data: analyses } = await supabase
        .from("win_loss_analyses")
        .select("outcome, analyzed_at")
        .gte("analyzed_at", lower.toISOString())
        .order("analyzed_at", { ascending: true });

      const list = (analyses ?? []) as unknown as AnalysisRow[];
      const winRateIn = (rows: AnalysisRow[]) => {
        const total = rows.length;
        if (!total) return 0;
        const wins = rows.filter((r) => r.outcome === "won").length;
        return (wins / total) * 100;
      };

      return insights
        .map((i) => {
          const t = new Date(i.applied_at as string).getTime();
          const beforeFrom = t - WINDOW_DAYS * 86400 * 1000;
          const afterTo = t + WINDOW_DAYS * 86400 * 1000;
          const before = list.filter((a) => {
            const at = new Date(a.analyzed_at).getTime();
            return at >= beforeFrom && at < t;
          });
          const after = list.filter((a) => {
            const at = new Date(a.analyzed_at).getTime();
            return at >= t && at <= afterTo;
          });
          const beforeWR = winRateIn(before);
          const afterWR = winRateIn(after);
          return {
            id: i.id,
            title: i.title,
            applied_at: i.applied_at as string,
            beforeWinRate: beforeWR,
            afterWinRate: afterWR,
            uplift: afterWR - beforeWR,
            beforeCount: before.length,
            afterCount: after.length,
          };
        })
        .filter((r) => r.beforeCount + r.afterCount >= 2)
        .sort((a, b) => b.uplift - a.uplift);
    },
    staleTime: 5 * 60_000,
  });
}
