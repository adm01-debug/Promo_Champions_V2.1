import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WinCalibrationRow {
  id: string;
  scope: "global" | "owner" | "segment" | "source";
  scope_value: string | null;
  stage: string;
  historical_win_rate: number;
  sample_size: number;
  confidence: number;
  calibrated_probability: number;
  baseline_probability: number;
  calculated_at: string;
}

export interface DealProbabilityScoreRow {
  id: string;
  sale_id: string;
  raw_probability: number;
  calibrated_probability: number;
  confidence: number;
  factors: Record<string, number>;
  calculated_at: string;
}

export function useWinProbabilityCalibration() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("win-calibrations-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "win_probability_calibrations" }, () => {
        qc.invalidateQueries({ queryKey: ["win-probability-calibrations"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["win-probability-calibrations"],
    queryFn: async (): Promise<WinCalibrationRow[]> => {
      const { data, error } = await supabase
        .from("win_probability_calibrations")
        .select("*")
        .order("calculated_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as WinCalibrationRow[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDealProbabilityScores(limit = 200) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("deal-prob-scores-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "deal_probability_scores" }, () => {
        qc.invalidateQueries({ queryKey: ["deal-probability-scores"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["deal-probability-scores", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_probability_scores")
        .select("*, sales:sale_id(id, amount, status, salesperson_id, salespeople:salespeople!salesperson_id(name))")
        .order("calculated_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Array<DealProbabilityScoreRow & {
        sales: {
          id: string;
          amount: number | null;
          status: string;
          salesperson_id: string | null;
          salespeople: { name: string } | null;
        } | null;
      }>;
    },
    staleTime: 60 * 1000,
  });
}

export function useRunWinCalibration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input?: { lookback_days?: number; min_sample?: number }) => {
      const { data, error } = await supabase.functions.invoke("calibrate-win-probability", {
        body: input ?? {},
      });
      if (error) throw error;
      return data as {
        ok: boolean;
        calibrations_written: number;
        deal_scores_written: number;
        closed_sample: number;
        open_deals: number;
      };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["win-probability-calibrations"] });
      qc.invalidateQueries({ queryKey: ["deal-probability-scores"] });
      toast.success(`Recalibrado: ${data.calibrations_written} curvas, ${data.deal_scores_written} deals`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
