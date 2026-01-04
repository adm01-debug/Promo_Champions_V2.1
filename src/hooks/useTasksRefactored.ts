import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
}

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) throw error;
      return data ?? [];
    }
  });
}
