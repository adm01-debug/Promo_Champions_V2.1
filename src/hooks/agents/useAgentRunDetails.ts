import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AgentAction, AgentRun } from "@/components/agents/agentHelpers";

export function useAgentRunDetails(runId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!runId) return;
    const ch = supabase
      .channel(`agent_run_${runId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ai_agent_actions", filter: `run_id=eq.${runId}` },
        () => qc.invalidateQueries({ queryKey: ["agent-run-details", runId] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ai_agent_runs", filter: `id=eq.${runId}` },
        () => qc.invalidateQueries({ queryKey: ["agent-run-details", runId] }),
      )
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [runId, qc]);

  return useQuery({
    queryKey: ["agent-run-details", runId],
    enabled: !!runId,
    queryFn: async () => {
      const [{ data: run }, { data: actions }] = await Promise.all([
        supabase.from("ai_agent_runs").select("*").eq("id", runId!).maybeSingle(),
        supabase.from("ai_agent_actions").select("*").eq("run_id", runId!).order("step_index", { ascending: true }),
      ]);
      return {
        run: (run ?? null) as unknown as AgentRun | null,
        actions: ((actions ?? []) as unknown) as AgentAction[],
      };
    },
    staleTime: 2_000,
  });
}
