import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBulkApprovals = () => {
  const qc = useQueryClient();

  const bulkApprove = useMutation({
    mutationFn: async (input: { ids: string[]; xpOverrides?: Record<string, number> }) => {
      const { data, error } = await supabase.rpc('bulk_approve_assignments', {
        _ids: input.ids,
        _xp_overrides: (input.xpOverrides ?? {}) as never,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['task-assignments'] });
      qc.invalidateQueries({ queryKey: ['xp-adjustments'] });
      toast.success(`${count} aprovações processadas`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkReject = useMutation({
    mutationFn: async (input: { ids: string[]; reason?: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('task_assignments')
        .update({
          status: 'rejected',
          reviewed_by: u.user?.id,
          reviewed_at: new Date().toISOString(),
          submission_note: input.reason ?? null,
        })
        .in('id', input.ids);
      if (error) throw error;
      return input.ids.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['task-assignments'] });
      toast.success(`${count} submissões rejeitadas`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { bulkApprove, bulkReject };
};
