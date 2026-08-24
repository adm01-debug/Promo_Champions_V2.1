import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EnrollmentRule {
  id: string;
  cadence_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  priority: number;
  trigger_stage: string | null;
  trigger_category: string | null;
  trigger_source: string | null;
  min_amount: number | null;
  max_amount: number | null;
  created_at: string;
  updated_at: string;
}

export type EnrollmentRuleInput = Omit<EnrollmentRule, "id" | "created_at" | "updated_at">;

export function useEnrollmentRules() {
  return useQuery({
    queryKey: ["cadence-enrollment-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadence_enrollment_rules")
        .select("*")
        .order("priority", { ascending: true });
      if (error) throw error;
      return data as EnrollmentRule[];
    },
  });
}

export function useCreateEnrollmentRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<EnrollmentRuleInput> & { cadence_id: string; name: string }) => {
      const { data, error } = await supabase
        .from("cadence_enrollment_rules")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cadence-enrollment-rules"] });
      toast.success("Regra criada!");
    },
    onError: () => toast.error("Erro ao criar regra (verifique permissão admin/manager)"),
  });
}

export function useUpdateEnrollmentRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EnrollmentRule> & { id: string }) => {
      const { data, error } = await supabase
        .from("cadence_enrollment_rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cadence-enrollment-rules"] });
      toast.success("Regra atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar regra"),
  });
}

export function useDeleteEnrollmentRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cadence_enrollment_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cadence-enrollment-rules"] });
      toast.success("Regra removida!");
    },
    onError: () => toast.error("Erro ao remover regra"),
  });
}
