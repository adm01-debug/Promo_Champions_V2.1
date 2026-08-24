import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TaskDifficulty } from '@/components/admin/task-console/taskConsoleHelpers';

export interface TaskCatalogItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: TaskDifficulty;
  xp_reward: number;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskCatalogInput = Omit<TaskCatalogItem, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export const useTaskCatalog = () => {
  const qc = useQueryClient();

  const list = useQuery<TaskCatalogItem[]>({
    queryKey: ['task-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_catalog')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as TaskCatalogItem[];
    },
  });

  const create = useMutation({
    mutationFn: async (input: TaskCatalogInput) => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('task_catalog')
        .insert({ ...input, created_by: u.user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-catalog'] });
      toast.success('Tarefa criada no catálogo');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<TaskCatalogInput> & { id: string }) => {
      const { error } = await supabase.from('task_catalog').update(input).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-catalog'] });
      toast.success('Tarefa atualizada');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('task_catalog').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-catalog'] });
      toast.success('Tarefa removida');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...list, create, update, remove };
};
