import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CadenceTaskRow {
  id: string;
  prospect_cadence_id: string;
  cadence_step_id: string;
  scheduled_date: string;
  status: string;
  completed_at: string | null;
  notes: string | null;
  step: {
    id: string;
    step_order: number;
    day_number: number;
    action_type: string;
    title: string;
    description: string | null;
    template_content: string | null;
  } | null;
}

export function useCadenceTasksByEnrollment(enrollmentId?: string) {
  return useQuery({
    queryKey: ["cadence-tasks-by-enrollment", enrollmentId],
    enabled: !!enrollmentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadence_tasks")
        .select(`
          id, prospect_cadence_id, cadence_step_id, scheduled_date, status, completed_at, notes,
          step:cadence_steps(id, step_order, day_number, action_type, title, description, template_content)
        `)
        .eq("prospect_cadence_id", enrollmentId!)
        .order("scheduled_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CadenceTaskRow[];
    },
  });
}
