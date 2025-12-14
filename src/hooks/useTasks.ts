import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSystemSoundSettings } from '@/hooks/useSystemSoundSettings';
import { useInvalidateCache } from '@/hooks/useInvalidateCache';
import { updateItemInArray, removeItemFromArray } from '@/hooks/useOptimisticUpdate';

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskType = 'call' | 'meeting' | 'follow_up' | 'email' | 'proposal' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  salesperson_id: string | null;
  sale_id: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  task_type: TaskType;
  due_date: string;
  due_time: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  salesperson?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  sale?: {
    id: string;
    client_name: string;
    product_name: string;
  };
}

export function useTasks(salespersonId?: string) {
  return useQuery({
    queryKey: ['tasks', salespersonId],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          salesperson:salespeople(id, name, avatar_url),
          sale:sales(id, client_name, product_name)
        `)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: true });

      if (salespersonId) {
        query = query.eq('salesperson_id', salespersonId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useTodayTasks(salespersonId?: string) {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['tasks', 'today', salespersonId],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          salesperson:salespeople(id, name, avatar_url),
          sale:sales(id, client_name, product_name)
        `)
        .eq('due_date', today)
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('priority', { ascending: true })
        .order('due_time', { ascending: true, nullsFirst: false });

      if (salespersonId) {
        query = query.eq('salesperson_id', salespersonId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { invalidateDomain } = useInvalidateCache();
  const { toast } = useToast();
  const { playSoundForCategory } = useSystemSoundSettings();

  return useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string;
      salesperson_id?: string;
      sale_id?: string;
      priority?: TaskPriority;
      task_type?: TaskType;
      due_date?: string;
      due_time?: string;
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      
      // Optimistically add task
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        title: newTask.title,
        description: newTask.description || null,
        salesperson_id: newTask.salesperson_id || null,
        sale_id: newTask.sale_id || null,
        priority: newTask.priority || 'medium',
        status: 'pending',
        task_type: newTask.task_type || 'other',
        due_date: newTask.due_date || new Date().toISOString().split('T')[0],
        due_time: newTask.due_time || null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData<Task[]>(['tasks'], (old) => 
        old ? [optimisticTask, ...old] : [optimisticTask]
      );
      
      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      toast({ title: 'Erro ao criar tarefa', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Tarefa criada com sucesso!' });
      playSoundForCategory('newTask');
    },
    onSettled: () => {
      invalidateDomain('tasks');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { invalidateDomain } = useInvalidateCache();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        updateItemInArray(old, id, updates)
      );
      
      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      toast({ title: 'Erro ao atualizar tarefa', variant: 'destructive' });
    },
    onSettled: () => {
      invalidateDomain('tasks');
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { invalidateDomain } = useInvalidateCache();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed' as TaskStatus,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        updateItemInArray(old, taskId, { 
          status: 'completed' as TaskStatus, 
          completed_at: new Date().toISOString() 
        })
      );
      
      return { previousTasks };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      toast({ title: 'Erro ao concluir tarefa', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Tarefa concluída!' });
    },
    onSettled: () => {
      invalidateDomain('tasks');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { invalidateDomain } = useInvalidateCache();
  const { toast } = useToast();

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
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        removeItemFromArray(old, taskId)
      );
      
      return { previousTasks };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      toast({ title: 'Erro ao remover tarefa', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Tarefa removida!' });
    },
    onSettled: () => {
      invalidateDomain('tasks');
    },
  });
}
