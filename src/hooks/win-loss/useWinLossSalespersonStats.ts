import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { chunkedIn } from '@/lib/supabase/chunkedIn';
import {
  aggregateBySalesperson,
  type SalespersonStat,
} from '@/hooks/win-loss/useWinLossAggregations';
import type { WLAnalysisRow } from '@/hooks/win-loss/useWinLossData';

export const useSalespersonWinLossStats = (
  rows: WLAnalysisRow[] | undefined
): { data: SalespersonStat[]; isLoading: boolean } => {
  const ids = (rows ?? []).map(r => r.sale_id);
  const idsKey = Array.from(new Set(ids)).sort().join(',');
  const { data: sales = [], isLoading: l1 } = useQuery({
    queryKey: ['wl-sp-sales', idsKey],
    queryFn: async () => {
      if (!ids.length) return [] as Array<{ id: string; salesperson_id: string | null }>;
      return await chunkedIn<{ id: string; salesperson_id: string | null }>(
        ids,
        (chunk) => supabase.from('sales').select('id,salesperson_id').in('id', chunk as string[]),
        { parallel: true, label: 'wl-sp-sales' },
      );
    },
    enabled: ids.length > 0,
  });
  const spIds = Array.from(new Set(sales.map(s => s.salesperson_id).filter(Boolean) as string[]));
  const spIdsKey = [...spIds].sort().join(',');
  const { data: people = [], isLoading: l2 } = useQuery({
    queryKey: ['wl-sp-people', spIdsKey],
    queryFn: async () => {
      if (!spIds.length) return [] as Array<{ id: string | null; name: string | null }>;
      return await chunkedIn<{ id: string | null; name: string | null }>(
        spIds,
        (chunk) => supabase.from('salespeople_public').select('id,name').in('id', chunk as string[]),
        { parallel: true, label: 'wl-sp-people' },
      );
    },
    enabled: spIds.length > 0,
  });

  const salesMap = new Map<string, string>(sales.map(s => [s.id, s.salesperson_id ?? '']));
  const nameMap = new Map<string, string>(people.map(p => [p.id ?? '', p.name ?? '']));
  const stats = rows ? aggregateBySalesperson(rows, salesMap, nameMap) : [];
  return { data: stats, isLoading: l1 || l2 };
};
