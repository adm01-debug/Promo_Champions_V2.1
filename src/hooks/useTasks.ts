import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { CACHE_TIMES } from '@/constants';

// Re-export Task type for components
export type { Task } from '@/types';

// Task types matching database enums
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
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
}

export const useTasks = (userId?: string) => {
  return useQuery<TaskRecord[]>({
    queryKey: ['tasks', userId],
    queryFn: async (): Promise<TaskRecord[]> => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (userId) {
        query = query.eq('salesperson_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as TaskRecord[];
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
        .select('*')
        .eq('due_date', today)
        .order('due_time', { ascending: true });

      if (userId) {
        query = query.eq('salesperson_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as TaskRecord[];
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
          ...input,
          task_type: input.task_type || 'other',
          priority: input.priority || 'medium',
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaskRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
