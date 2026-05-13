import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CommissionRule {
  id: string;
  name: string;
  description: string | null;
  salesperson_id: string | null;
  category: string | null;
  percentage: number;
  min_amount: number | null;
  max_amount: number | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  salespeople?: { name: string } | null;
}

export type CommissionRuleUpsert = Partial<Omit<CommissionRule, "salespeople" | "created_at">> & {
  name: string;
  percentage: number;
};

export const useCommissionRules = () => {
  return useQuery({
    queryKey: ["commission-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_rules")
        .select("*, salespeople(name)")
        .order("priority", { ascending: false });
      if (error) throw error;
      return data as CommissionRule[];
    },
  });
};

export const useUpsertCommissionRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rule: CommissionRuleUpsert) => {
      const { data, error } = await supabase
        .from("commission_rules")
        .upsert(rule)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commission-rules"] });
      toast.success("Regra salva com sucesso");
    },
    onError: (error: Error) => toast.error(`Erro ao salvar regra: ${error.message}`),
  });
};

export const useDeleteCommissionRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("commission_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commission-rules"] });
      toast.success("Regra removida");
    },
    onError: (error: Error) => toast.error(`Erro ao remover regra: ${error.message}`),
  });
};
