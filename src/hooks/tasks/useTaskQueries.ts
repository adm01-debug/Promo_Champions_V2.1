import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import { getLocalISODate } from '@/utils/dateHelpers';
import type { TaskRecord, TaskPriority, TaskType, TaskStatus } from './types';

const TASK_SELECT = `*, sale:sales(client_name, product_name), salesperson:salespeople(name, avatar_url)`;

const mapTask = (task: Record<string, unknown>): TaskRecord =>
  ({
    ...task,
    priority: task.priority as TaskPriority,
    task_type: task.task_type as TaskType,
    status: task.status as TaskStatus,
  }) as TaskRecord;

export const useTasks = (userId?: string) => {
  return useQuery<TaskRecord[]>({
    queryKey: ['tasks', userId],
    queryFn: async (): Promise<TaskRecord[]> => {
      // Mesmo padrão de useActivities (limit 1000): sem janela, o histórico
      // completo de tarefas concluídas viria junto e o PostgREST truncaria
      // silenciosamente em 1000 de qualquer forma.
      let query = supabase
        .from('tasks')
        .select(TASK_SELECT)
        .order('due_date', { ascending: true })
        .limit(1000);

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
      const today = getLocalISODate();

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
