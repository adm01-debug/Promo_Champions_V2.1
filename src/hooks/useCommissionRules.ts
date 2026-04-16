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
  updated_at: string;
  salespeople?: { name: string } | null;
}

export interface CreateCommissionRuleInput {
  name: string;
  description?: string;
  salesperson_id?: string | null;
  category?: string | null;
  percentage: number;
  min_amount?: number;
  max_amount?: number | null;
  priority?: number;
  is_active?: boolean;
}

export const useCommissionRules = () => {
  return useQuery({
    queryKey: ["commission_rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_rules")
        .select("*, salespeople(name)")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CommissionRule[];
    },
  });
};

export const useCreateCommissionRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCommissionRuleInput) => {
      const { error } = await supabase.from("commission_rules").insert([input]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commission_rules"] });
      toast.success("Regra criada");
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao criar regra"),
  });
};

export const useUpdateCommissionRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CreateCommissionRuleInput>) => {
      const { error } = await supabase.from("commission_rules").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commission_rules"] });
      toast.success("Regra atualizada");
    },
    onError: () => toast.error("Erro ao atualizar regra"),
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
      qc.invalidateQueries({ queryKey: ["commission_rules"] });
      toast.success("Regra removida");
    },
    onError: () => toast.error("Erro ao remover regra"),
  });
};
