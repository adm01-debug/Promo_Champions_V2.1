import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePendingApprovals = () => {
  const qc = useQueryClient();

  const approve = useMutation({
    mutationFn: async (input: { assignmentId: string; xpAmount: number; reason?: string }) => {
      const { data, error } = await supabase.rpc('grant_task_xp', {
        _assignment_id: input.assignmentId,
        _xp_amount: input.xpAmount,
        _reason: input.reason || 'Tarefa aprovada',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-assignments'] });
      qc.invalidateQueries({ queryKey: ['xp-adjustments'] });
      toast.success('Tarefa aprovada e XP creditado');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: async (input: { assignmentId: string; reason?: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('task_assignments')
        .update({
          status: 'rejected',
          reviewed_by: u.user?.id,
          reviewed_at: new Date().toISOString(),
          submission_note: input.reason ?? null,
        })
        .eq('id', input.assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-assignments'] });
      toast.success('Submissão rejeitada');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { approve, reject };
};
