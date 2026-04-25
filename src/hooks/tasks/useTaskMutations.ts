import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TableUpdate } from '@/lib/supabase/typed-payloads';
import type { TaskRecord, TaskType, TaskPriority, TaskStatus } from './types';

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      task_type?: TaskType;
      priority?: TaskPriority;
      due_date: string;
      due_time?: string;
      sale_id?: string;
      salesperson_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: input.title,
          description: input.description || null,
          task_type: input.task_type || 'other',
          priority: input.priority || 'medium',
          due_date: input.due_date,
          due_time: input.due_time || null,
          sale_id: input.sale_id || null,
          salesperson_id: input.salesperson_id || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar tarefa');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Omit<TaskRecord, 'sale' | 'salesperson'>> & { id: string }) => {
      const updateData: TableUpdate<'tasks'> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.task_type !== undefined) updateData.task_type = updates.task_type;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
      if (updates.due_time !== undefined) updateData.due_time = updates.due_time;
      if (updates.sale_id !== undefined) updateData.sale_id = updates.sale_id;
      if (updates.salesperson_id !== undefined) updateData.salesperson_id = updates.salesperson_id;
      if (updates.completed_at !== undefined) updateData.completed_at = updates.completed_at;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: TaskRecord[] | undefined) => {
        if (!old) return old;
        return old.map(task =>
          task.id === newData.id ? { ...task, ...newData } : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _newData, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
      toast.error('Erro ao atualizar tarefa');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: TaskRecord[] | undefined) => {
        if (!old) return old;
        return old.map(task =>
          task.id === taskId
            ? { ...task, status: 'completed' as TaskStatus, completed_at: new Date().toISOString() }
            : task
        );
      });

      return { previousTasks };
    },
    onSuccess: () => {
      toast.success('Tarefa concluída!');
    },
    onError: (_err, _taskId, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
      toast.error('Erro ao concluir tarefa');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: TaskRecord[] | undefined) => {
        if (!old) return old;
        return old.filter(task => task.id !== taskId);
      });

      return { previousTasks };
    },
    onSuccess: () => {
      toast.success('Tarefa excluída');
    },
    onError: (_err, _taskId, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
      toast.error('Erro ao excluir tarefa');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
