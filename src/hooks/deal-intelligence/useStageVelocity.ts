import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { toast } from "sonner";
import type { StageSeverity } from "@/components/deal-intelligence/velocity/velocityHelpers";

export interface StageTransition {
  id: string;
  sale_id: string;
  from_stage: string | null;
  to_stage: string;
  entered_at: string;
  exited_at: string | null;
  duration_hours: number | null;
}

export interface StageBaseline {
  id: string;
  stage: string;
  segment: string;
  p50_hours: number;
  p75_hours: number;
  p90_hours: number;
  sample_size: number;
  computed_at: string;
}

export interface VelocityAlert {
  id: string;
  sale_id: string;
  current_stage: string;
  hours_in_stage: number;
  baseline_p75: number;
  baseline_p90: number;
  severity: StageSeverity;
  recommendation: string | null;
  detected_at: string;
}

export const useDealStageVelocity = (saleId: string | undefined) =>
  useQuery({
    queryKey: ["deal-stage-velocity", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const [alertRes, transRes] = await Promise.all([
        supabase
          .from("deal_velocity_alerts")
          .select("*")
          .eq("sale_id", saleId)
          .maybeSingle(),
        supabase
          .from("deal_stage_transitions")
          .select("*")
          .eq("sale_id", saleId)
          .order("entered_at", { ascending: true }),
      ]);
      if (alertRes.error) throw alertRes.error;
      if (transRes.error) throw transRes.error;
      return {
        alert: alertRes.data as VelocityAlert | null,
        transitions: (transRes.data || []) as StageTransition[],
      };
    },
    enabled: !!saleId,
    staleTime: CACHE_TIMES.STALE_TIME,
  });

export const useStageBaselinesAll = () =>
  useQuery({
    queryKey: ["stage-baselines-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_velocity_baselines")
        .select("*")
        .eq("segment", "all")
        .order("p75_hours", { ascending: false });
      if (error) throw error;
      return (data || []) as StageBaseline[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

export const useStuckDeals = (limit = 20) =>
  useQuery({
    queryKey: ["stuck-deals", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_velocity_alerts")
        .select("*, sales!inner(id, client_name, product_name, amount, salesperson_id)")
        .in("severity", ["stuck", "critical"])
        .order("hours_in_stage", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

export const useStageBottlenecks = () =>
  useQuery({
    queryKey: ["stage-bottlenecks"],
    queryFn: async () => {
      const [baselinesRes, alertsRes] = await Promise.all([
        supabase
          .from("stage_velocity_baselines")
          .select("stage, p50_hours, p75_hours, p90_hours, sample_size")
          .eq("segment", "all"),
        supabase.from("deal_velocity_alerts").select("current_stage, severity"),
      ]);
      if (baselinesRes.error) throw baselinesRes.error;
      if (alertsRes.error) throw alertsRes.error;

      const stuckByStage = new Map<string, number>();
      for (const a of (alertsRes.data || []) as Array<{ current_stage: string; severity: string }>) {
        if (a.severity === "stuck" || a.severity === "critical") {
          stuckByStage.set(a.current_stage, (stuckByStage.get(a.current_stage) || 0) + 1);
        }
      }
      return ((baselinesRes.data || []) as Array<{
        stage: string;
        p50_hours: number;
        p75_hours: number;
        p90_hours: number;
        sample_size: number;
      }>).map((b) => ({
        stage: b.stage,
        p50: Number(b.p50_hours),
        p75: Number(b.p75_hours),
        p90: Number(b.p90_hours),
        sample: b.sample_size,
        stuck: stuckByStage.get(b.stage) || 0,
      }));
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

export const useRecomputeBaselines = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("recompute-stage-baselines", { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Baselines recalculadas");
      qc.invalidateQueries({ queryKey: ["stage-baselines-all"] });
      qc.invalidateQueries({ queryKey: ["stage-bottlenecks"] });
    },
    onError: () => toast.error("Erro ao recalcular baselines"),
  });
};

export const useDetectStuckDeals = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("detect-stuck-deals", { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Deals presos atualizados");
      qc.invalidateQueries({ queryKey: ["stuck-deals"] });
      qc.invalidateQueries({ queryKey: ["deal-stage-velocity"] });
      qc.invalidateQueries({ queryKey: ["stage-bottlenecks"] });
    },
    onError: () => toast.error("Erro ao detectar deals presos"),
  });
};
