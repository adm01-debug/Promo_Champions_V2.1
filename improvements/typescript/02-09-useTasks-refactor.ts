// Melhoria 2.9 - useTasks.ts REFATORADO
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string;
  due_date?: string;
  deal_id?: string;
}

interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  assigned_to?: string;
}

export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*');
      
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.priority) query = query.eq('priority', filters.priority);
      if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Task[];
    },
  });
};
