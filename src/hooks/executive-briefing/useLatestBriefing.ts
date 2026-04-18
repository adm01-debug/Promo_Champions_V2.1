import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ExecutiveBriefing } from "@/components/executive-briefing/briefingHelpers";

export function useLatestBriefing() {
  return useQuery({
    queryKey: ["executive-briefing", "latest"],
    queryFn: async (): Promise<ExecutiveBriefing | null> => {
      const { data, error } = await supabase
        .from("executive_briefings")
        .select("*")
        .order("briefing_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as ExecutiveBriefing) ?? null;
    },
    staleTime: 2 * 60_000,
  });
}
