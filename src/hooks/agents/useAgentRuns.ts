import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AgentRun } from "@/components/agents/agentHelpers";

export function useAgentRuns(limit = 50) {
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase
      .channel("ai_agent_runs_feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ai_agent_runs" },
        () => {
          qc.invalidateQueries({ queryKey: ["agent-runs"] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [qc]);

  return useQuery<AgentRun[]>({
    queryKey: ["agent-runs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_agent_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as AgentRun[];
    },
    staleTime: 5_000,
  });
}
