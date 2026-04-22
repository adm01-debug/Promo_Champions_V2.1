import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { classifyDeadLetterError } from "./classifyDeadLetterError";

export interface DeadLetterErrorGroupOption {
  key: string;
  label: string;
  count: number;
}

/**
 * Aggregates pending dead-letters by classified error group for the admin filter.
 * Only fetches `last_status` + `last_error` (cheap) from up to 500 most recent rows.
 */
export function useDeadLetterErrorGroups() {
  return useQuery<DeadLetterErrorGroupOption[]>({
    queryKey: ["winloss-dead-letter-error-groups"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (col: string, v: string) => {
              order: (c: string, o: { ascending: boolean }) => {
                limit: (n: number) => Promise<{
                  data: Array<{ last_status: number | null; last_error: string | null }> | null;
                  error: Error | null;
                }>;
              };
            };
          };
        };
      })
        .from("winloss_webhook_dead_letters")
        .select("last_status,last_error")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const map = new Map<string, { label: string; count: number }>();
      for (const r of data ?? []) {
        const g = classifyDeadLetterError({ last_status: r.last_status, last_error: r.last_error });
        const entry = map.get(g.key);
        if (entry) entry.count += 1;
        else map.set(g.key, { label: g.label, count: 1 });
      }
      return Array.from(map.entries())
        .map(([key, v]) => ({ key, label: v.label, count: v.count }))
        .sort((a, b) => b.count - a.count);
    },
  });
}
