import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SequenceEnrollment {
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

export function useSequenceEnrollments(sequenceId: string | undefined) {
  return useQuery({
    queryKey: ['sequence-enrollments', sequenceId],
    queryFn: async () => {
      if (!sequenceId) return [];
      const { data, error } = await supabase
        .from('sequence_enrollments')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('started_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as SequenceEnrollment[];
    },
    enabled: !!sequenceId,
  });
}
