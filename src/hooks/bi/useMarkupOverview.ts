import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { summarizeMarkup, type MarkupSummary } from '@/lib/markupHelpers';

/**
 * Agrega a rentabilidade (markup %) das vendas em um período para o BI do gestor.
 *
 * Fonte: view `sales_with_markup` (mascara custos absolutos conforme permissão).
 * Vendas sem custo conhecido entram como "unknown" e não distorcem a média.
 */
export interface MarkupSellerRow {
  salespersonId: string;
  name: string;
  average: number | null;
  criticalCount: number;
  total: number;
}

export interface MarkupOverview {
  summary: MarkupSummary;
  sellers: MarkupSellerRow[];
}

interface SaleRow {
  salesperson_id: string | null;
  markup_pct: number | null;
}

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

      const rows = (salesRes.data ?? []) as SaleRow[];
      const nameById = new Map<string, string>(
        ((sellersRes.data ?? []) as Array<{ id: string; name: string }>).map((s) => [s.id, s.name]),
      );

      const summary = summarizeMarkup(rows.map((r) => r.markup_pct));

      const grouped = new Map<string, number[]>();
      const totals = new Map<string, number>();
      const criticals = new Map<string, number>();

      for (const row of rows) {
        const id = row.salesperson_id;
        if (!id) continue;
        totals.set(id, (totals.get(id) ?? 0) + 1);
        if (typeof row.markup_pct === 'number' && !Number.isNaN(row.markup_pct)) {
          const list = grouped.get(id) ?? [];
          list.push(row.markup_pct);
          grouped.set(id, list);
          if (row.markup_pct < 20) criticals.set(id, (criticals.get(id) ?? 0) + 1);
        }
      }

      const sellers: MarkupSellerRow[] = [...totals.entries()]
        .map(([id, total]) => {
          const values = grouped.get(id) ?? [];
          const average =
            values.length > 0
              ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
              : null;
          return {
            salespersonId: id,
            name: nameById.get(id) ?? 'Sem vendedor',
            average,
            criticalCount: criticals.get(id) ?? 0,
            total,
          };
        })
        .sort((a, b) => (b.average ?? -Infinity) - (a.average ?? -Infinity));

      return { summary, sellers };
    },
  });
}
