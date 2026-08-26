import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { chunkedIn } from '@/lib/supabase/chunkedIn';
import { subDays } from 'date-fns';

export interface ChurnOverdueBySellerRow {
  salesperson_id: string;
  name: string;
  overdue: number;
  total: number;
  completionRate: number;
}

/**
 * Ranking de vendedores com mais tarefas geradas por alertas de churn
 * atrasadas no período. Detecta via marcador `[auto:churn]`.
 */
export function useChurnOverdueBySeller(days = 30, limit = 5) {
  return useQuery<ChurnOverdueBySellerRow[]>({
    queryKey: ['bi', 'churn-overdue-by-seller', days, limit],
    queryFn: async () => {
      const since = subDays(new Date(), days).toISOString();
      const { data, error } = await supabase
        .from('tasks')
        .select('id,status,due_date,salesperson_id')
        .ilike('description', '%[auto:churn]%')
        .gte('created_at', since)
        .not('salesperson_id', 'is', null);
      if (error) throw error;

      const now = Date.now();
      const map = new Map<
        string,
        { total: number; overdue: number; completed: number }
      >();
      for (const t of data ?? []) {
        if (!t.salesperson_id) continue;
        const entry = map.get(t.salesperson_id) ?? {
          total: 0,
          overdue: 0,
          completed: 0,
        };
        entry.total += 1;
        if (t.status === 'completed') entry.completed += 1;
        else if (t.due_date && new Date(t.due_date).getTime() < now)
          entry.overdue += 1;
        map.set(t.salesperson_id, entry);
      }

      const ids = [...map.keys()];
      if (ids.length === 0) return [];

      const sellers = await chunkedIn<{ id: string; name: string | null }>(
        ids,
        (chunk) =>
          supabase
            .from('salespeople')
            .select('id,name')
            .in('id', chunk as string[]),
        { parallel: true, label: 'bi.churn-overdue-sellers' },
      );
      const nameMap = new Map(sellers.map((s) => [s.id, s.name]));

      return [...map.entries()]
        .map<ChurnOverdueBySellerRow>(([id, v]) => ({
          salesperson_id: id,
          name: nameMap.get(id) ?? 'Sem vendedor',
          overdue: v.overdue,
          total: v.total,
          completionRate: v.total > 0 ? (v.completed / v.total) * 100 : 0,
        }))
        .filter((r) => r.overdue > 0)
        .sort((a, b) => b.overdue - a.overdue)
        .slice(0, limit);
    },
    staleTime: 60_000,
  });
}
