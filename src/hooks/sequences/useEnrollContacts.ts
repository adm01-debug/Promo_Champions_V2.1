import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EnrollPayload {
  sequence_id: string;
  contacts: Array<{ contact_id: string; contact_type: "lead" | "client" | "contact" }>;
}

export function useEnrollContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EnrollPayload) => {
      const { data, error } = await supabase.functions.invoke("sequence-enroll", {
        body: payload,
      });
      if (error) throw error;
      return data as { ok: boolean; enrolled: number; skipped_duplicates: number };
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["sequence-enrollments", vars.sequence_id] });
      toast.success(`${data.enrolled} contato(s) inscrito(s)`, {
        description: data.skipped_duplicates > 0 ? `${data.skipped_duplicates} duplicado(s) ignorado(s)` : undefined,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTriggerSequenceRunner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("sequence-runner", { body: {} });
      if (error) throw error;
      return data as { ok: boolean; processed: number; succeeded: number; failed: number };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["sequence-enrollments"] });
      toast.success(`Runner executado: ${data.succeeded}/${data.processed} ok`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
