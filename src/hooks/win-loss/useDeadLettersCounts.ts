import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DeadLetterStatus } from "@/hooks/win-loss/useWebhookDeadLetters";

export interface DeadLettersCounts {
  pending: number;
  replaying: number;
  replayed: number;
  archived: number;
}

async function countByStatus(status: DeadLetterStatus): Promise<number> {
  const { count, error } = await (supabase as unknown as {
    from: (t: string) => {
      select: (
        c: string,
        opts: { count: "exact"; head: true },
      ) => {
        eq: (c: string, v: string) => Promise<{ count: number | null; error: Error | null }>;
      };
    };
  })
    .from("winloss_webhook_dead_letters")
    .select("id", { count: "exact", head: true })
    .eq("status", status);
  if (error) throw error;
  return count ?? 0;
}

export function useDeadLettersCounts() {
  return useQuery({
    queryKey: ["winloss-dead-letters", "counts"],
    staleTime: 30_000,
    queryFn: async (): Promise<DeadLettersCounts> => {
      const [pending, replaying, replayed, archived] = await Promise.all([
        countByStatus("pending"),
        countByStatus("replaying"),
        countByStatus("replayed"),
        countByStatus("archived"),
      ]);
      return { pending, replaying, replayed, archived };
    },
  });
}
