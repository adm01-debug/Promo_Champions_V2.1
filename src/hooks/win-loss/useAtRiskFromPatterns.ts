import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AtRiskDealFromPattern {
  sale_id: string;
  client_name: string | null;
  amount: number;
  stage: string | null;
  risk_score: number;
  matched_pattern: string;
  suggested_action: string;
}

export function useAtRiskFromPatterns() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["winloss-at-risk-from-patterns"],
    queryFn: async (): Promise<AtRiskDealFromPattern[]> => {
      const { data, error } = await supabase.functions.invoke("detect-at-risk-deals", { body: {} });
      if (error) throw error;
      return ((data as { deals?: AtRiskDealFromPattern[] })?.deals ?? []) as AtRiskDealFromPattern[];
    },
    staleTime: 5 * 60_000,
  });

  const refresh = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("detect-at-risk-deals", { body: { force: true } });
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
