import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ScheduledReportRun } from "@/components/reporting/scheduledReportHelpers";

export function useScheduledReportRuns(scheduleId: string | null) {
  return useQuery({
    queryKey: ["scheduled-report-runs", scheduleId],
    enabled: !!scheduleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_report_runs" as never)
        .select("*")
        .eq("schedule_id", scheduleId!)
        .order("started_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as ScheduledReportRun[];
    },
    staleTime: 30_000,
  });
}

export async function getSnapshotSignedUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("report-snapshots")
    .createSignedUrl(filePath, 60 * 10);
  if (error) return null;
  return data.signedUrl;
}
