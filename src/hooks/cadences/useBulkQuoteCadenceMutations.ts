import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["quote-cadences"] });
  qc.invalidateQueries({ queryKey: ["quote-cadence-stats"] });
  qc.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
}

type BulkInput = { ids: string[] };

export function useBulkPauseQuoteCadences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids }: BulkInput) => {
      if (ids.length === 0) return;
      const { error } = await supabase
        .from("prospect_cadences")
        .update({ status: "paused" })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      invalidate(qc);
      toast.success(`${v.ids.length} follow-up(s) pausado(s)`);
    },
    onError: () => toast.error("Erro ao pausar em lote"),
  });
}

export function useBulkResumeQuoteCadences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids }: BulkInput) => {
      if (ids.length === 0) return;
      const { error } = await supabase
        .from("prospect_cadences")
        .update({ status: "active" })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      invalidate(qc);
      toast.success(`${v.ids.length} follow-up(s) retomado(s)`);
    },
    onError: () => toast.error("Erro ao retomar em lote"),
  });
}

export function useBulkCancelQuoteCadences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids }: BulkInput) => {
      if (ids.length === 0) return;
      const { error } = await supabase
        .from("prospect_cadences")
        .update({ status: "cancelled", completed_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      invalidate(qc);
      toast.success(`${v.ids.length} follow-up(s) cancelado(s)`);
    },
    onError: () => toast.error("Erro ao cancelar em lote"),
  });
}
