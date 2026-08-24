import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function invalidateQuoteCadences(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["quote-cadences"] });
  qc.invalidateQueries({ queryKey: ["quote-cadence-stats"] });
  qc.invalidateQueries({ queryKey: ["cadence-tasks-by-enrollment"] });
  qc.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
}

export function usePauseQuoteCadence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from("prospect_cadences")
        .update({ status: "paused" })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateQuoteCadences(qc);
      toast.success("Follow-up pausado");
    },
    onError: () => toast.error("Erro ao pausar"),
  });
}

export function useResumeQuoteCadence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from("prospect_cadences")
        .update({ status: "active" })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateQuoteCadences(qc);
      toast.success("Follow-up retomado");
    },
    onError: () => toast.error("Erro ao retomar"),
  });
}

export function useCancelQuoteCadence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from("prospect_cadences")
        .update({ status: "cancelled", completed_at: new Date().toISOString() })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateQuoteCadences(qc);
      toast.success("Follow-up cancelado");
    },
    onError: () => toast.error("Erro ao cancelar"),
  });
}

export function useRescheduleCadenceTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, newDate }: { taskId: string; newDate: string }) => {
      const { error } = await supabase
        .from("cadence_tasks")
        .update({ scheduled_date: newDate, status: "pending" })
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateQuoteCadences(qc);
      toast.success("Tarefa reagendada");
    },
    onError: () => toast.error("Erro ao reagendar"),
  });
}
