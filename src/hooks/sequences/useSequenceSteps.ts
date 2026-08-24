import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SequenceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  channel: "email" | "whatsapp" | "call" | "linkedin" | "task";
  delay_days: number;
  delay_hours: number;
  template_id: string | null;
  subject: string | null;
  body: string | null;
  conditions: Record<string, unknown>;
  whatsapp_template_id?: string | null;
  created_at: string;
}

export function useSequenceSteps(sequenceId: string | undefined) {
  return useQuery({
    queryKey: ["sequence-steps", sequenceId],
    queryFn: async () => {
      if (!sequenceId) return [];
      const { data, error } = await supabase
        .from("sequence_steps")
        .select("*")
        .eq("sequence_id", sequenceId)
        .order("step_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SequenceStep[];
    },
    enabled: !!sequenceId,
  });
}

export function useUpsertSequenceStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<SequenceStep> & { sequence_id: string }) => {
      const payload = {
        sequence_id: input.sequence_id,
        step_order: input.step_order ?? 0,
        channel: input.channel ?? "email",
        delay_days: input.delay_days ?? 0,
        delay_hours: input.delay_hours ?? 0,
        subject: input.subject ?? null,
        body: input.body ?? null,
        template_id: input.template_id ?? null,
        whatsapp_template_id: input.whatsapp_template_id ?? null,
        conditions: (input.conditions ?? {}) as never,
      };
      if (input.id) {
        const { data, error } = await supabase
          .from("sequence_steps")
          .update(payload)
          .eq("id", input.id)
          .select()
          .single();
        if (error) throw error;
        return data as SequenceStep;
      }
      const { data, error } = await supabase
        .from("sequence_steps")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as SequenceStep;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["sequence-steps", data.sequence_id] });
      toast.success("Passo salvo");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSequenceStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sequence_id }: { id: string; sequence_id: string }) => {
      const { error } = await supabase.from("sequence_steps").delete().eq("id", id);
      if (error) throw error;
      return sequence_id;
    },
    onSuccess: (sequence_id) => {
      qc.invalidateQueries({ queryKey: ["sequence-steps", sequence_id] });
      toast.success("Passo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
