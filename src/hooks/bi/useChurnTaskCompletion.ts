import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export interface ChurnTaskCompletionStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

/**
 * Métrica gerencial: % de tarefas geradas por alerta de churn que foram concluídas
 * no período (janela padrão: últimos 30 dias). Detecta tarefas via marcador
 * `[auto:churn]` na descrição, criado por `detect-client-churn-alerts`.
 */
export function useChurnTaskCompletion(days = 30) {
  return useQuery<ChurnTaskCompletionStats>({
    queryKey: ['bi', 'churn-task-completion', days],
    queryFn: async () => {
      const since = subDays(new Date(), days).toISOString();
      const { data, error } = await supabase
        .from('tasks')
        .select('id,status,due_date,description,created_at')
        .ilike('description', '%[auto:churn]%')
        .gte('created_at', since);

      if (error) throw error;
      const rows = data ?? [];
      const total = rows.length;
      const completed = rows.filter((t) => t.status === 'completed').length;
      const now = Date.now();
      const overdue = rows.filter(
        (t) => t.status !== 'completed' && t.due_date && new Date(t.due_date).getTime() < now,
      ).length;
      const pending = total - completed;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      return { total, completed, pending, overdue, completionRate };
    },
    staleTime: 60_000,
  });
}
