import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TaskAssignmentStatus } from '@/components/admin/task-console/taskConsoleHelpers';

export interface TaskAssignmentRecord {
  id: string;
  catalog_id: string;
  assigned_to: string;
  assigned_by: string;
  due_date: string | null;
  status: TaskAssignmentStatus;
  submission_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  xp_granted: number | null;
  created_at: string;
  catalog?: {
    title: string;
    description: string | null;
    difficulty: string;
    xp_reward: number;
    category: string;
  };
}

export const useTaskAssignments = (filters?: { mine?: boolean; userId?: string }) => {
  const qc = useQueryClient();

  const list = useQuery<TaskAssignmentRecord[]>({
    queryKey: ['task-assignments', filters],
    queryFn: async () => {
      let q = supabase
        .from('task_assignments')
        .select('*, catalog:task_catalog(title, description, difficulty, xp_reward, category)')
        .order('created_at', { ascending: false });
      if (filters?.userId) q = q.eq('assigned_to', filters.userId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as TaskAssignmentRecord[];
    },
  });

  const assign = useMutation({
    mutationFn: async (input: {
      catalog_id: string;
      assigned_to_list: string[];
      due_date?: string | null;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error('Não autenticado');
      const rows = input.assigned_to_list.map((uid) => ({
        catalog_id: input.catalog_id,
        assigned_to: uid,
        assigned_by: u.user!.id,
        due_date: input.due_date ?? null,
      }));
      const { error } = await supabase.from('task_assignments').insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-assignments'] });
      toast.success('Tarefas atribuídas');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async (input: { id: string; status: TaskAssignmentStatus; note?: string }) => {
      const { error } = await supabase
        .from('task_assignments')
        .update({ status: input.status, submission_note: input.note ?? null })
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-assignments'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...list, assign, updateStatus };
};
