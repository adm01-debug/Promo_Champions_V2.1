import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import type { TaskRecord, TaskPriority, TaskType, TaskStatus } from './types';

const TASK_SELECT = `*, sale:sales(client_name, product_name), salesperson:salespeople(name, avatar_url)`;

const mapTask = (task: Record<string, unknown>): TaskRecord => ({
  ...task,
  priority: task.priority as TaskPriority,
  task_type: task.task_type as TaskType,
  status: task.status as TaskStatus,
} as TaskRecord);

export const useTasks = (userId?: string) => {
  return useQuery<TaskRecord[]>({
    queryKey: ['tasks', userId],
    queryFn: async (): Promise<TaskRecord[]> => {
      let query = supabase
        .from('tasks')
        .select(TASK_SELECT)
        .order('due_date', { ascending: true });

      if (userId) {
        query = query.eq('salesperson_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapTask);
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
        .select(TASK_SELECT)
        .eq('due_date', today)
        .neq('status', 'completed')
        .order('due_time', { ascending: true });

      if (userId) {
        query = query.eq('salesperson_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapTask);
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
