import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePromoteSequenceWinners() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sequenceId: string) => {
      const { data, error } = await supabase.functions.invoke("sequence-ab-promote", {
        body: { sequence_id: sequenceId },
      });
      if (error) throw error;
      const r = data as { ok?: boolean; promoted?: Array<{ step_id: string; promoted_label: string }>; error?: string };
      if (!r?.ok) throw new Error(r?.error ?? "Falha ao promover");
      return { sequenceId, promoted: r.promoted ?? [] };
    },
    onSuccess: ({ sequenceId, promoted }) => {
      qc.invalidateQueries({ queryKey: ["sequence-steps", sequenceId] });
      qc.invalidateQueries({ queryKey: ["step-variants"] });
      qc.invalidateQueries({ queryKey: ["step-variant-performance"] });
      if (promoted.length === 0) {
        toast.info("Nenhum step com significância suficiente ainda");
      } else {
        toast.success(`${promoted.length} vencedor(es) promovido(s)`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
