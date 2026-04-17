import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useTriggerScheduledReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const { data, error } = await supabase.functions.invoke("scheduled-report-trigger", {
        body: { schedule_id: scheduleId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, scheduleId) => {
      toast.success("Execução disparada");
      qc.invalidateQueries({ queryKey: ["scheduled-reports"] });
      qc.invalidateQueries({ queryKey: ["scheduled-report-runs", scheduleId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao executar"),
  });
}
