import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AgentTargetType, AgentType } from "@/components/agents/agentHelpers";

export interface StartAgentInput {
  agent_type: AgentType;
  target_entity_type?: AgentTargetType;
  target_entity_id?: string;
  goal?: string;
  auto_execute?: boolean;
}

export function useStartAgentRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: StartAgentInput) => {
      const { data, error } = await supabase.functions.invoke<{
        run_id: string;
        status: string;
        result: Record<string, unknown>;
      }>("ai-agent-orchestrator", { body: input });
      if (error) throw error;
      if (!data) throw new Error("Sem resposta do agente.");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Agente iniciado", {
        description: `Run ${data.run_id.slice(0, 8)} • ${data.status}`,
      });
      qc.invalidateQueries({ queryKey: ["agent-runs"] });
    },
    onError: (e: Error) => {
      toast.error("Falha ao iniciar agente", { description: e.message });
    },
  });
}
