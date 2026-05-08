import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CadenceMetrics {
  cadence_id: string;
  cadence_name: string;
  total_enrolled: number;
  active_count: number;
  paused_count: number;
  completed_count: number;
  cancelled_count: number;
  auto_paused_count: number;
  total_tasks: number;
  tasks_completed: number;
  tasks_skipped: number;
  completion_rate: number;
  reply_rate: number;
  conversion_rate: number;
  click_rate?: number;
  bookings_count?: number;
}

export function useCadenceMetrics(cadenceId?: string, days: number = 30) {
  return useQuery({
    queryKey: ["cadence-metrics", cadenceId ?? "all", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_cadence_metrics", {
        _cadence_id: cadenceId ?? undefined,
        _days: days,
      });
      if (error) throw error;
      return (data as CadenceMetrics[]) ?? [];
    },
    staleTime: 60_000,
  });
}
