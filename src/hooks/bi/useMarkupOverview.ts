import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  aggregateMarkupOverview,
  type MarkupOverview,
  type MarkupSaleRow,
} from '@/lib/bi/markupOverviewHelpers';

export type { MarkupOverview, MarkupSellerRow } from '@/lib/bi/markupOverviewHelpers';

/**
 * Agrega a rentabilidade (markup %) das vendas em um período para o BI do gestor.
 * Fonte: view `sales_with_markup` (mascara custos absolutos conforme permissão).
 */
export function useMarkupOverview(days: number) {
  return useQuery<MarkupOverview>({
    queryKey: ['bi', 'markup-overview', days],
    staleTime: 2 * 60_000,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [salesRes, sellersRes] = await Promise.all([
        supabase
          .from('sales_with_markup')
          .select('salesperson_id, markup_pct')
          .gte('created_at', since.toISOString())
          .limit(5000),
        supabase.from('salespeople').select('id,name'),
      ]);

      if (salesRes.error) throw salesRes.error;
      if (sellersRes.error) throw sellersRes.error;

      const rows = (salesRes.data ?? []) as MarkupSaleRow[];
      const nameById = new Map<string, string>(
        ((sellersRes.data ?? []) as Array<{ id: string; name: string }>).map((s) => [s.id, s.name]),
      );

      return aggregateMarkupOverview(rows, nameById);
    },
  });
}
