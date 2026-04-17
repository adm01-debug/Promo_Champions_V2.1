import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SequenceEnrollment {
  id: string;
  sequence_id: string;
  contact_id: string;
  contact_type: string;
  status: string;
  current_step: number;
  next_action_at: string | null;
  started_at: string;
  last_executed_at: string | null;
  completed_at: string | null;
  exit_reason: string | null;
  optimized_for_at: string | null;
  auto_paused_at: string | null;
  auto_pause_reason: string | null;
}

export interface SequenceStepExecution {
  id: string;
  enrollment_id: string;
  step_id: string;
  executed_at: string;
  status: string;
  channel: string | null;
  error_message: string | null;
  engagement: Record<string, unknown>;
}

export function useSequenceEnrollments(sequenceId: string | undefined) {
  return useQuery({
    queryKey: ["sequence-enrollments", sequenceId],
    queryFn: async () => {
      if (!sequenceId) return [];
      const { data, error } = await supabase
        .from("sequence_enrollments")
        .select("*")
        .eq("sequence_id", sequenceId)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SequenceEnrollment[];
    },
    enabled: !!sequenceId,
  });
}

export function useEnrollmentExecutions(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ["sequence-executions", enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) return [];
      const { data, error } = await supabase
        .from("sequence_step_executions")
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .order("executed_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SequenceStepExecution[];
    },
    enabled: !!enrollmentId,
  });
}
