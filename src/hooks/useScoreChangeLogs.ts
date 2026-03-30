import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useScoreChangeLogs(limit = 50) {
  return useQuery({
    queryKey: ["score-change-logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("score_change_logs")
        .select("*, salespeople(name, email)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}
