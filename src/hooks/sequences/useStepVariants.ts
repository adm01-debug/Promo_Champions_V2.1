import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StepVariant {
  id: string;
  step_id: string;
  label: "A" | "B";
  subject: string | null;
  body: string | null;
  traffic_weight: number;
  created_at: string;
}

export interface VariantPerformance {
  step_id: string;
  variant_id: string;
  label: "A" | "B";
  sent: number;
  replied: number;
  reply_rate: number;
}

export function useStepVariants(stepId: string | undefined) {
  return useQuery({
    queryKey: ["step-variants", stepId],
    queryFn: async () => {
      if (!stepId) return [];
      const { data, error } = await supabase
        .from("sequence_step_variants")
        .select("*")
        .eq("step_id", stepId)
        .order("label", { ascending: true });
      if (error) throw error;
      return (data ?? []) as StepVariant[];
    },
    enabled: !!stepId,
  });
}

export function useStepVariantPerformance(stepId: string | undefined) {
  return useQuery({
    queryKey: ["step-variant-performance", stepId],
    queryFn: async () => {
      if (!stepId) return [];
      const { data, error } = await supabase
        .from("sequence_variant_performance")
        .select("*")
        .eq("step_id", stepId);
      if (error) throw error;
      return (data ?? []) as VariantPerformance[];
    },
    enabled: !!stepId,
  });
}

export function useUpsertStepVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<StepVariant> & { step_id: string; label: "A" | "B" }) => {
      const payload = {
        step_id: input.step_id,
        label: input.label,
        subject: input.subject ?? null,
        body: input.body ?? null,
        traffic_weight: input.traffic_weight ?? 50,
      };
      if (input.id) {
        const { data, error } = await supabase
          .from("sequence_step_variants")
          .update(payload)
          .eq("id", input.id)
          .select()
          .single();
        if (error) throw error;
        return data as StepVariant;
      }
      const { data, error } = await supabase
        .from("sequence_step_variants")
        .upsert(payload, { onConflict: "step_id,label" })
        .select()
        .single();
      if (error) throw error;
      return data as StepVariant;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["step-variants", data.step_id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteStepVariants() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stepId: string) => {
      const { error } = await supabase.from("sequence_step_variants").delete().eq("step_id", stepId);
      if (error) throw error;
      return stepId;
    },
    onSuccess: (stepId) => {
      qc.invalidateQueries({ queryKey: ["step-variants", stepId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeclareStepWinner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ stepId, label }: { stepId: string; label: "A" | "B" }) => {
      const { error } = await supabase.rpc("declare_step_winner", {
        _step_id: stepId,
        _variant_label: label,
      });
      if (error) throw error;
      return stepId;
    },
    onSuccess: (stepId) => {
      qc.invalidateQueries({ queryKey: ["step-variants", stepId] });
      qc.invalidateQueries({ queryKey: ["sequence-steps"] });
      toast.success("Variante vencedora promovida");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
