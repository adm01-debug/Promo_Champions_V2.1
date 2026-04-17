import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CoachingProgressRow {
  category: string;
  severity: string;
  status: string;
  count: number;
}

export function useCoachingProgress(salespersonId?: string, days = 30) {
  return useQuery({
    queryKey: ["coaching-progress", salespersonId, days],
    queryFn: async () => {
      if (!salespersonId) return [];
      const { data, error } = await supabase.rpc("coaching_progress_by_salesperson", {
        _salesperson_id: salespersonId,
        _days: days,
      });
      if (error) throw error;
      return (data ?? []) as CoachingProgressRow[];
    },
    enabled: !!salespersonId,
  });
}
