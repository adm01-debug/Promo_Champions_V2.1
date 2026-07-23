import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export interface ChurnTaskCompletionStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  overdueIds: string[];
}

/**
 * Métrica gerencial: % de tarefas geradas por alerta de churn concluídas
 * no período. Detecta via marcador `[auto:churn]` (criado pela edge
 * `detect-client-churn-alerts`). Filtro opcional por vendedor.
 */
export function useChurnTaskCompletion(days = 30, salespersonId?: string | null) {
  return useQuery<ChurnTaskCompletionStats>({
    queryKey: ['bi', 'churn-task-completion', days, salespersonId ?? 'all'],
    queryFn: async () => {
      const since = subDays(new Date(), days).toISOString();
      let query = supabase
        .from('tasks')
        .select('id,status,due_date,description,created_at,salesperson_id')
        .ilike('description', '%[auto:churn]%')
        .gte('created_at', since);
      if (salespersonId) query = query.eq('salesperson_id', salespersonId);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      const total = rows.length;
      const completed = rows.filter((t) => t.status === 'completed').length;
      const now = Date.now();
      const overdueRows = rows.filter(
        (t) => t.status !== 'completed' && t.due_date && new Date(t.due_date).getTime() < now,
      );
      const pending = total - completed;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      return {
        total,
        completed,
        pending,
        overdue: overdueRows.length,
        completionRate,
        overdueIds: overdueRows.map((r) => r.id),
      };
    },
    staleTime: 60_000,
  });
}

