import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TimelineEventType = "activity" | "stage_change" | "task_completed" | "outcome" | "chat";

export interface DealTimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  // For activities
  activity_type?: string;
  outcome?: string;
  contact_name?: string;
  notes?: string;
  duration_minutes?: number;
  // For stage changes
  from_stage?: string;
  to_stage?: string;
  duration_in_stage?: number;
  // For tasks
  task_title?: string;
  task_type?: string;
  task_description?: string;
  // For deal outcomes
  deal_outcome?: string;
  deal_reason?: string;
  // For chat history
  chat_question?: string;
  chat_response?: string;
  chat_type?: string;
}

export function useDealTimeline(saleId: string | null) {
  return useQuery({
    queryKey: ["deal-timeline", saleId],
    queryFn: async (): Promise<DealTimelineEvent[]> => {
      if (!saleId) return [];

      const [activitiesRes, stageRes, tasksRes, outcomesRes, chatRes] = await Promise.all([
        supabase
          .from("activities")
          .select("id, activity_type, outcome, contact_name, notes, duration_minutes, created_at")
          .eq("sale_id", saleId)
          .order("created_at", { ascending: false }),
        supabase
          .from("deal_stage_history")
          .select("id, stage, entered_at, exited_at")
          .eq("sale_id", saleId)
          .order("entered_at", { ascending: false }),
        supabase
          .from("tasks")
          .select("id, title, task_type, description, completed_at")
          .eq("sale_id", saleId)
          .eq("status", "completed")
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false }),
        supabase
          .from("deal_outcomes")
          .select("id, outcome, reason, notes, created_at")
          .eq("sale_id", saleId)
          .order("created_at", { ascending: false }),
        supabase
          .from("deal_chat_history")
          .select("id, question, response, question_type, created_at")
          .eq("deal_id", saleId)
          .order("created_at", { ascending: false }),
      ]);

      if (activitiesRes.error) throw activitiesRes.error;
      if (stageRes.error) throw stageRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const events: DealTimelineEvent[] = [];

      // Activities
      for (const act of activitiesRes.data || []) {
        events.push({
          id: act.id,
          type: "activity",
          timestamp: act.created_at,
          activity_type: act.activity_type,
          outcome: act.outcome,
          contact_name: act.contact_name || undefined,
          notes: act.notes || undefined,
          duration_minutes: act.duration_minutes || undefined,
        });
      }

      // Stage changes
      const stages = stageRes.data || [];
      for (let i = 0; i < stages.length; i++) {
        const current = stages[i];
        const next = stages[i + 1];
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

      // Completed tasks
      for (const task of tasksRes.data || []) {
        events.push({
          id: task.id,
          type: "task_completed",
          timestamp: task.completed_at!,
          task_title: task.title,
          task_type: task.task_type,
          task_description: task.description || undefined,
        });
      }

      // Deal outcomes
      for (const out of outcomesRes.data || []) {
        events.push({
          id: out.id,
          type: "outcome",
          timestamp: out.created_at,
          deal_outcome: out.outcome,
          deal_reason: out.reason,
          notes: out.notes || undefined,
        });
      }

      // Chat history
      for (const chat of chatRes.data || []) {
        events.push({
          id: chat.id,
          type: "chat",
          timestamp: chat.created_at,
          chat_question: chat.question,
          chat_response: chat.response || undefined,
          chat_type: chat.question_type,
        });
      }

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return events;
    },
    enabled: !!saleId,
  });
}
