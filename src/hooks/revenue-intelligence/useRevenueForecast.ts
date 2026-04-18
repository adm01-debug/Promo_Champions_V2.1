import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ForecastPeriodType = "week" | "month" | "quarter";
export type ForecastCategory = "commit" | "best" | "upside" | "omitted";

export interface RevenueForecastRow {
  id: string;
  owner_id: string | null;
  period_type: ForecastPeriodType;
  period_start: string;
  period_end: string;
  commit_amount: number;
  best_case_amount: number;
  upside_amount: number;
  confidence_score: number;
  goal_amount: number;
  gap_to_goal: number;
  deals_count: number;
  weighted_pipeline: number;
  factors: Array<{ label: string; impact: "positive" | "negative" | "neutral"; detail: string }>;
  ai_summary: string | null;
  calculated_at: string;
}

export interface ForecastContribution {
  id: string;
  forecast_id: string;
  sale_id: string;
  category: ForecastCategory;
  weighted_amount: number;
  probability: number;
  reasoning: string | null;
}

export function useRevenueForecast(
  periodType: ForecastPeriodType,
  periodStart: string,
  ownerId?: string | null,
) {
  const qc = useQueryClient();
  const queryKey = ["revenue-forecast", periodType, periodStart, ownerId ?? "team"];

  useEffect(() => {
    const channel = supabase
      .channel(`forecast-${periodType}-${periodStart}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "revenue_forecasts" }, () => {
        qc.invalidateQueries({ queryKey });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [periodType, periodStart, ownerId, qc]);

  return useQuery({
    queryKey,
    queryFn: async (): Promise<RevenueForecastRow | null> => {
      let q = supabase
        .from("revenue_forecasts")
        .select("*")
        .eq("period_type", periodType)
        .eq("period_start", periodStart);
      q = ownerId ? q.eq("owner_id", ownerId) : q.is("owner_id", null);
      const { data, error } = await q.maybeSingle();
      if (error) throw error;
      return (data as RevenueForecastRow | null) ?? null;
    },
    staleTime: 60_000,
  });
}

export function useForecastContributions(forecastId?: string) {
  return useQuery({
    queryKey: ["forecast-contributions", forecastId],
    queryFn: async (): Promise<ForecastContribution[]> => {
      if (!forecastId) return [];
      const { data, error } = await supabase
        .from("forecast_deal_contributions")
        .select("*")
        .eq("forecast_id", forecastId)
        .order("weighted_amount", { ascending: false });
      if (error) throw error;
      return (data as ForecastContribution[]) ?? [];
    },
    enabled: !!forecastId,
  });
}

export function useGenerateForecast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      period_type: ForecastPeriodType;
      period_start: string;
      owner_id?: string | null;
    }) => {
      const { data, error } = await supabase.functions.invoke("generate-revenue-forecast", {
        body: input,
      });
      if (error) throw error;
      return data as RevenueForecastRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["revenue-forecast"] });
      toast.success("Forecast atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
