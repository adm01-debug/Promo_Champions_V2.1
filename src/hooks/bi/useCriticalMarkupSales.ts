import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CRITICAL_MARKUP_THRESHOLD } from '@/lib/bi/markupOverviewHelpers';

export interface CriticalMarkupSale {
  id: string;
  clientName: string;
  productName: string;
  amount: number;
  markupPct: number;
  createdAt: string;
}

interface Row {
  id: string;
  client_name: string | null;
  product_name: string | null;
  amount: number | null;
  markup_pct: number | null;
  created_at: string;
}

/**
 * Vendas recentes com markup abaixo do limiar crítico (< 20%).
 * Usadas para alertar o gestor sobre erosão de margem.
 */
export function useCriticalMarkupSales(days: number, limit = 10) {
  return useQuery<CriticalMarkupSale[]>({
    queryKey: ['bi', 'critical-markup-sales', days, limit],
    staleTime: 2 * 60_000,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from('sales_with_markup')
        .select('id, client_name, product_name, amount, markup_pct, created_at')
        .gte('created_at', since.toISOString())
        .not('markup_pct', 'is', null)
        .lt('markup_pct', CRITICAL_MARKUP_THRESHOLD)
        .order('markup_pct', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return ((data ?? []) as Row[]).map((r) => ({
        id: r.id,
        clientName: r.client_name ?? 'Cliente não informado',
        productName: r.product_name ?? 'Produto não informado',
        amount: Number(r.amount ?? 0),
        markupPct: Number(r.markup_pct ?? 0),
        createdAt: r.created_at,
      }));
    },
  });
}
