import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ForecastSnapshot {
  id: string;
  period_start: string;
  period_end: string;
  owner_id: string | null;
  segment: string | null;
  forecast_amount: number;
  forecast_deals: number;
  weighted_amount: number;
  commit_amount: number;
  best_case_amount: number;
  source: "manual" | "weighted" | "ai";
  snapshot_at: string;
}

export interface ForecastAccuracyRow {
  id: string;
  snapshot_id: string;
  actual_amount: number;
  actual_deals: number;
  variance_pct: number;
  mape: number;
  bias: "optimistic" | "pessimistic" | "accurate";
  computed_at: string;
}

export interface ConfidenceScore {
  id: string;
  owner_id: string | null;
  source: string;
  period_count: number;
  avg_mape: number;
  bias_trend: "optimistic" | "pessimistic" | "accurate";
  confidence_score: number;
  computed_at: string;
}

export function useForecastSnapshots(limit = 100) {
  return useQuery({
    queryKey: ["forecast-snapshots", limit],
    queryFn: async (): Promise<ForecastSnapshot[]> => {
      const { data, error } = await supabase
        .from("forecast_snapshots")
        .select("*")
        .order("period_start", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as ForecastSnapshot[]) ?? [];
    },
  });
}

export function useForecastAccuracy(limit = 100) {
  return useQuery({
    queryKey: ["forecast-accuracy", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forecast_accuracy")
        .select("*, forecast_snapshots(*)")
        .order("computed_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Array<
        ForecastAccuracyRow & { forecast_snapshots: ForecastSnapshot | null }
      >;
    },
  });
}

export function useConfidenceScores() {
  return useQuery({
    queryKey: ["forecast-confidence-scores"],
    queryFn: async (): Promise<ConfidenceScore[]> => {
      const { data, error } = await supabase
        .from("forecast_confidence_scores")
        .select("*")
        .order("confidence_score", { ascending: false });
      if (error) throw error;
      return (data as ConfidenceScore[]) ?? [];
    },
  });
}

export function useForecastSummary() {
  const accuracy = useForecastAccuracy(200);
  const scores = useConfidenceScores();

  return {
    isLoading: accuracy.isLoading || scores.isLoading,
    summary: (() => {
      const rows = accuracy.data ?? [];
      const avgMape = rows.length
        ? rows.reduce((s, r) => s + Number(r.mape), 0) / rows.length
        : 0;
      const opt = rows.filter((r) => r.bias === "optimistic").length;
      const pes = rows.filter((r) => r.bias === "pessimistic").length;
      const acc = rows.filter((r) => r.bias === "accurate").length;
      const dominant: "optimistic" | "pessimistic" | "accurate" =
        opt > pes && opt > acc
          ? "optimistic"
          : pes > opt && pes > acc
            ? "pessimistic"
            : "accurate";
      const best =
        (scores.data ?? []).slice().sort((a, b) =>
          Number(b.confidence_score) - Number(a.confidence_score),
        )[0] ?? null;
      const accuracyTrend = 100 - avgMape;
      return {
        avg_mape: Math.round(avgMape * 100) / 100,
        bias: dominant,
        best_source: best,
        accuracy_trend: Math.max(0, Math.min(100, Math.round(accuracyTrend * 10) / 10)),
        sample_size: rows.length,
      };
    })(),
  };
}

export function useSnapshotForecast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input?: {
      period_start?: string;
      period_end?: string;
      source?: "manual" | "weighted" | "ai";
    }) => {
      const { data, error } = await supabase.functions.invoke("snapshot-forecast", {
        body: input ?? {},
      });
      if (error) throw error;
      return data as { inserted: number };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["forecast-snapshots"] });
      toast.success(`${d.inserted} snapshots gerados`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useComputeAccuracy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "compute-forecast-accuracy",
        { body: {} },
      );
      if (error) throw error;
      return data as { computed: number; scored: number };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["forecast-accuracy"] });
      qc.invalidateQueries({ queryKey: ["forecast-confidence-scores"] });
      toast.success(`${d.computed} períodos avaliados, ${d.scored} scores`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
