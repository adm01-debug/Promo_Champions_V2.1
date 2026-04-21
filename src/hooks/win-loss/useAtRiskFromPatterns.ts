import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RiskBreakdown {
  stagnation: number;
  amount_alignment: number;
  stage_match: number;
  matched_pattern_label: string;
  matched_pattern_type: string;
  matched_confidence: number;
  reasons: string[];
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

export function useAtRiskFromPatterns() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["winloss-at-risk-from-patterns"],
    queryFn: async (): Promise<AtRiskDealFromPattern[]> => {
      const { data, error } = await supabase.functions.invoke("detect-winloss-at-risk", { body: {} });
      if (error) throw error;
      return ((data as { deals?: AtRiskDealFromPattern[] })?.deals ?? []) as AtRiskDealFromPattern[];
    },
    staleTime: 5 * 60_000,
  });

  const refresh = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("detect-winloss-at-risk", { body: { force: true } });
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
