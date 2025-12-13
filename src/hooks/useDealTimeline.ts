import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DealTimelineEvent {
  id: string;
  type: "activity" | "stage_change";
  timestamp: string;
  // For activities
  activity_type?: string;
  outcome?: string;
  contact_name?: string;
  notes?: string;
  // For stage changes
  from_stage?: string;
  to_stage?: string;
  duration_in_stage?: number; // in hours
}

export function useDealTimeline(saleId: string | null) {
  return useQuery({
    queryKey: ["deal-timeline", saleId],
    queryFn: async (): Promise<DealTimelineEvent[]> => {
      if (!saleId) return [];

      // Fetch activities for this deal
      const { data: activities, error: actError } = await supabase
        .from("activities")
        .select("id, activity_type, outcome, contact_name, notes, created_at")
        .eq("sale_id", saleId)
        .order("created_at", { ascending: false });

      if (actError) throw actError;

      // Fetch stage history for this deal
      const { data: stageHistory, error: stageError } = await supabase
        .from("deal_stage_history")
        .select("id, stage, entered_at, exited_at")
        .eq("sale_id", saleId)
        .order("entered_at", { ascending: false });

      if (stageError) throw stageError;

      const events: DealTimelineEvent[] = [];

      // Add activities
      for (const act of activities || []) {
        events.push({
          id: act.id,
          type: "activity",
          timestamp: act.created_at,
          activity_type: act.activity_type,
          outcome: act.outcome,
          contact_name: act.contact_name || undefined,
          notes: act.notes || undefined,
        });
      }

      // Add stage changes
      const stages = stageHistory || [];
      for (let i = 0; i < stages.length; i++) {
        const current = stages[i];
        const next = stages[i + 1]; // Previous stage chronologically
        
        let durationHours: number | undefined;
        if (current.exited_at) {
          const entered = new Date(current.entered_at).getTime();
          const exited = new Date(current.exited_at).getTime();
          durationHours = Math.round((exited - entered) / (1000 * 60 * 60));
        }

        events.push({
          id: current.id,
          type: "stage_change",
          timestamp: current.entered_at,
          from_stage: next?.stage,
          to_stage: current.stage,
          duration_in_stage: durationHours,
        });
      }

      // Sort all events by timestamp descending
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return events;
    },
    enabled: !!saleId,
  });
}
