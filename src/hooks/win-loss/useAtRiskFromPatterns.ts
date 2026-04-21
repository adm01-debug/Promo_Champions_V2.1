import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export interface RiskBreakdown {
  stagnation: number;
  amount_alignment: number;
  stage_match: number;
  matched_pattern_label: string;
  matched_pattern_type: string;
  matched_confidence: number;
  reasons: string[];
  matched_keywords?: string[];
  competitor_matches?: Array<{
    keyword: string;
    matched_substring: string;
    regex: string;
    confidence: number;
  }>;
  days_stagnant?: number;
  avg_loss_cycle_days?: number | null;
  avg_loss_amount?: number | null;
  raw_score?: number;
  confidence_weight?: number;
  final_score?: number;
  stage_eligible?: boolean;
  severity?: RiskSeverity;
}

export interface AtRiskDealFromPattern {
  sale_id: string;
  client_name: string | null;
  amount: number;
  stage: string | null;
  risk_score: number;
  matched_pattern: string;
  suggested_action: string;
  reasons?: string[];
  breakdown?: RiskBreakdown;
}

export interface UseAtRiskParams {
  threshold?: number;
  limit?: number;
}

export function useAtRiskFromPatterns(params: UseAtRiskParams = {}) {
  const qc = useQueryClient();
  const { threshold, limit } = params;

  const body: Record<string, number> = {};
  if (typeof threshold === "number") body.threshold = threshold;
  if (typeof limit === "number") body.limit = limit;

  const query = useQuery({
    queryKey: ["winloss-at-risk-from-patterns", threshold ?? null, limit ?? null],
    queryFn: async (): Promise<AtRiskDealFromPattern[]> => {
      const { data, error } = await supabase.functions.invoke("detect-winloss-at-risk", { body });
      if (error) throw error;
      return ((data as { deals?: AtRiskDealFromPattern[] })?.deals ?? []) as AtRiskDealFromPattern[];
    },
    staleTime: 5 * 60_000,
  });

  const refresh = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("detect-winloss-at-risk", {
        body: { ...body, force: true },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["winloss-at-risk-from-patterns"] });
      toast.success("Análise de risco atualizada");
    },
    onError: () => toast.error("Não foi possível atualizar"),
  });

  return { ...query, refresh: refresh.mutate, isRefreshing: refresh.isPending };
}
