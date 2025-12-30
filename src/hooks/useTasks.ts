import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import { toast } from 'sonner';

// Task types matching database enums
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'call' | 'email' | 'meeting' | 'follow_up' | 'other' | 'proposal';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  due_time: string | null;
  sale_id: string | null;
  salesperson_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  sale?: { client_name: string; product_name?: string };
  salesperson?: { name: string; avatar_url?: string };
}

// Re-export Task as TaskRecord for backward compatibility
export type Task = TaskRecord;

export const useTasks = (userId?: string) => {
  return useQuery<TaskRecord[]>({
    queryKey: ['tasks', userId],
    queryFn: async (): Promise<TaskRecord[]> => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          sale:sales(client_name, product_name),
          salesperson:salespeople(name, avatar_url)
        `)
        .order('due_date', { ascending: true });

      if (userId) {
        query = query.eq('salesperson_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(task => ({
        ...task,
        priority: task.priority as TaskPriority,
        task_type: task.task_type as TaskType,
        status: task.status as TaskStatus,
      })) as TaskRecord[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useTodayTasks = (userId?: string) => {
  return useQuery<TaskRecord[]>({
    queryKey: ['tasks', 'today', userId],
    queryFn: async (): Promise<TaskRecord[]> => {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('tasks')
        .select(`
          *,
          sale:sales(client_name, product_name),
          salesperson:salespeople(name, avatar_url)
        `)
        .eq('due_date', today)
        .neq('status', 'completed')
        .order('due_time', { ascending: true });

      if (userId) {
        query = query.eq('salesperson_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(task => ({
        ...task,
        priority: task.priority as TaskPriority,
        task_type: task.task_type as TaskType,
        status: task.status as TaskStatus,
      })) as TaskRecord[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

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
      const updateData: Record<string, unknown> = {
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
    // Optimistic update
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
    // Optimistic update
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
    // Optimistic update
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
