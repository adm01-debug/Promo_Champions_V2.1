import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReplayAuditEntry {
  id: string;
  dead_letter_id: string | null;
  delivery_id: string | null;
  source: "dlq" | "delivery";
  request_id: string;
  actor_user_id: string;
  actor_email: string | null;
  succeeded: boolean;
  status_label: "succeeded" | "failed" | "skipped";
  http_status: number;
  error: string | null;
  attempts: number | null;
  created_at: string;
}

/**
 * Fetches the replay audit trail for a specific dead-letter row.
 * Ordered most-recent first.
 */
export function useReplayAuditForDeadLetter(deadLetterId: string | null | undefined) {
  return useQuery<ReplayAuditEntry[]>({
    queryKey: ["winloss-replay-audit", "dlq", deadLetterId],
    enabled: !!deadLetterId,
    staleTime: 10_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("winloss_webhook_replay_audit")
        .select("*")
        .eq("dead_letter_id", deadLetterId as string)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * Fetches the latest audit entry for each dead_letter_id in the given list,
 * to render compact "última auditoria" badges in the list view.
 *
 * Returns a Map<dead_letter_id, latest entry>.
 */
export function useLatestReplayAuditByDeadLetters(deadLetterIds: string[]) {
  const sortedKey = [...deadLetterIds].sort().join(",");
  return useQuery<Map<string, ReplayAuditEntry>>({
    queryKey: ["winloss-replay-audit", "latest-by-dlq", sortedKey],
    enabled: deadLetterIds.length > 0,
    staleTime: 10_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("winloss_webhook_replay_audit")
        .select("*")
        .in("dead_letter_id", deadLetterIds)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const map = new Map<string, ReplayAuditEntry>();
      for (const r of data ?? []) {
        if (!r.dead_letter_id) continue;
        if (!map.has(r.dead_letter_id)) map.set(r.dead_letter_id, r);
      }
      return map;
    },
  });
}
