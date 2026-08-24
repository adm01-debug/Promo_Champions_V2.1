import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCompleteCadenceTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, notes }: { taskId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("cadence_tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          notes,
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["prospect-cadences"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detailed-logs"] });
      toast.success("Tarefa concluída!");
    },
    onError: (error) => {
      toast.error("Erro ao concluir tarefa");
      if (import.meta.env.DEV) {
        console.error(error);
      }
    },
  });
}

export function useSkipCadenceTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, notes }: { taskId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("cadence_tasks")
        .update({
          status: "skipped",
          notes,
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detailed-logs"] });
      toast.success("Tarefa pulada!");
    },
    onError: (error) => {
      toast.error("Erro ao pular tarefa");
      if (import.meta.env.DEV) {
        console.error(error);
      }
    },
  });
}
