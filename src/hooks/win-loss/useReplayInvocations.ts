import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReplayInvocation {
  id: string;
  request_id: string;
  actor_user_id: string;
  actor_email: string | null;
  source: "dlq" | "delivery";
  item_count: number;
  succeeded_count: number;
  failed_count: number;
  skipped_count: number;
  duration_ms: number | null;
  ids: string[];
  created_at: string;
}

/**
 * Lists call-level audit entries for webhook replays (one row per invocation).
 * Used by the "Auditoria" tab in the admin DLQ page.
 */
export function useReplayInvocations(limit = 100) {
  return useQuery<ReplayInvocation[]>({
    queryKey: ["winloss-replay-invocations", limit],
    staleTime: 15_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("winloss_webhook_replay_invocations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as ReplayInvocation[];
    },
  });
}
