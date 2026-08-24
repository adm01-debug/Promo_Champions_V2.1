import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CalibrationBucket {
  id: string;
  stage: string;
  segment: string;
  bucket_min: number;
  bucket_max: number;
  actual_win_rate: number;
  sample_size: number;
  computed_at: string;
}

export interface DealCalibration {
  id: string;
  sale_id: string;
  stage: string;
  segment: string;
  owner_id: string | null;
  declared_probability: number;
  historical_win_rate: number;
  calibrated_probability: number;
  calibration_delta: number;
  confidence: "low" | "medium" | "high";
  flag: "overconfident" | "underconfident" | "aligned";
  sample_size: number;
  computed_at: string;
  sales?: { id: string; amount: number | null; status: string; salespeople?: { name: string } | null } | null;
}

export function useCalibrations(filters?: { flag?: string }) {
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase
      .channel("wpdc-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "win_probability_deal_calibrations" }, () => {
        qc.invalidateQueries({ queryKey: ["deal-calibrations"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return useQuery({
    queryKey: ["deal-calibrations", filters],
    queryFn: async () => {
      let q = supabase
        .from("win_probability_deal_calibrations")
        .select("*, sales:sale_id(id, amount, status, salespeople:salespeople!salesperson_id(name))")
        .order("calibration_delta", { ascending: true })
        .limit(500);
      if (filters?.flag) q = q.eq("flag", filters.flag);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as DealCalibration[];
    },
    staleTime: 60_000,
  });
}

export function useCalibrationBuckets(stage?: string, segment?: string) {
  return useQuery({
    queryKey: ["calibration-buckets", stage, segment],
    queryFn: async () => {
      let q = supabase.from("win_calibration_buckets").select("*").order("bucket_min");
      if (stage) q = q.eq("stage", stage);
      if (segment) q = q.eq("segment", segment);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CalibrationBucket[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useCalibrationSummary() {
  const { data: calibrations } = useCalibrations();
  if (!calibrations) return null;
  const total = calibrations.length;
  const overconfident = calibrations.filter((c) => c.flag === "overconfident").length;
  const underconfident = calibrations.filter((c) => c.flag === "underconfident").length;
  const aligned = calibrations.filter((c) => c.flag === "aligned").length;
  const avgGap = total > 0
    ? calibrations.reduce((s, c) => s + Math.abs(c.calibration_delta), 0) / total
    : 0;
  return { total, overconfident, underconfident, aligned, avgGap };
}

export function useRunCalibration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("calibrate-win-probabilities", { body: {} });
      if (error) throw error;
      return data as { ok: boolean; buckets_written: number; calibrations_written: number; groups_analyzed: number };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["deal-calibrations"] });
      qc.invalidateQueries({ queryKey: ["calibration-buckets"] });
      toast.success(`Calibrado: ${d.calibrations_written} deals, ${d.buckets_written} buckets`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
