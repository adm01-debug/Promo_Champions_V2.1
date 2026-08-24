import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { toast } from "sonner";

export interface StageConversionMetric {
  id: string;
  from_stage: string;
  to_stage: string;
  owner_id: string | null;
  entered_count: number;
  converted_count: number;
  lost_count: number;
  conversion_rate: number;
  avg_transition_days: number;
  period_start: string;
  period_end: string;
  calculated_at: string;
}

export interface StageBottleneckInsight {
  id: string;
  stage: string;
  owner_id: string | null;
  severity: "low" | "medium" | "high" | "critical";
  conversion_rate: number;
  top_loss_reasons: { reason: string; count: number }[];
  recommendations: { title: string; action: string; impact: "low" | "medium" | "high" }[];
  ai_summary: string | null;
  calculated_at: string;
}

export const useStageConversion = (ownerId?: string | null) => {
  return useQuery({
    queryKey: ["stage-conversion", ownerId ?? "global"],
    queryFn: async () => {
      let q = supabase.from("stage_conversion_metrics").select("*").order("from_stage");
      q = ownerId ? q.eq("owner_id", ownerId) : q.is("owner_id", null);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as StageConversionMetric[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });
};

export const useStageBottlenecks = (ownerId?: string | null) => {
  return useQuery({
    queryKey: ["stage-bottlenecks", ownerId ?? "global"],
    queryFn: async () => {
      let q = supabase.from("stage_bottleneck_insights").select("*").order("severity");
      q = ownerId ? q.eq("owner_id", ownerId) : q.is("owner_id", null);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as StageBottleneckInsight[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });
};

export const useAnalyzeStageConversion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { owner_id?: string | null; days?: number } = {}) => {
      const { data, error } = await supabase.functions.invoke("analyze-stage-conversion", {
        body: { owner_id: vars.owner_id ?? null, days: vars.days ?? 90 },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Análise de conversão atualizada");
      qc.invalidateQueries({ queryKey: ["stage-conversion"] });
      qc.invalidateQueries({ queryKey: ["stage-bottlenecks"] });
    },
    onError: () => toast.error("Erro ao analisar conversão"),
  });
};
