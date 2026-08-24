import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrendPoint {
  recorded_at: string;
  score: number;
}

export function useScoreTrend(saleId: string | null | undefined, days = 30) {
  return useQuery({
    queryKey: ["score-trend", saleId, days],
    enabled: !!saleId,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<TrendPoint[]> => {
      if (!saleId) return [];
      const { data, error } = await supabase.rpc("get_score_trend", {
        _sale_id: saleId,
        _days: days,
      });
      if (error) throw error;
      return (data ?? []) as TrendPoint[];
    },
  });
}
