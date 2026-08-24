import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useApproveAgentRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase.rpc("approve_agent_run", { _run_id: runId });
      if (error) throw error;
      return runId;
    },
    onSuccess: (runId) => {
      toast.success("Plano aprovado", { description: "O agente continuará a execução." });
      qc.invalidateQueries({ queryKey: ["agent-runs"] });
      qc.invalidateQueries({ queryKey: ["agent-run-details", runId] });
    },
    onError: (e: Error) => toast.error("Falha ao aprovar", { description: e.message }),
  });
}

export function useCancelAgentRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase
        .from("ai_agent_runs")
        .update({ status: "cancelled" })
        .eq("id", runId);
      if (error) throw error;
      return runId;
    },
    onSuccess: () => {
      toast.success("Agente cancelado");
      qc.invalidateQueries({ queryKey: ["agent-runs"] });
    },
    onError: (e: Error) => toast.error("Falha ao cancelar", { description: e.message }),
  });
}
