import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sale, CreateSaleInput } from '@/types/sales';
import { SALE_STATUS_LABELS } from '@/constants';
import { fetchAllRows } from '@/lib/supabase/fetchAllRows';
import type { PostgrestLike } from '@/lib/supabase/chunkedIn';
import {
  summarizeMarkup,
  type MarkupSummary,
  type MarkupTier,
} from '@/lib/markupHelpers';

/** Colunas da view `sales_with_markup` usadas pelo card de venda (sem `*`). */
const SALES_LIST_COLUMNS = `
  id,
  client_id,
  client_name,
  product_id,
  product_name,
  sku,
  amount,
  status,
  salesperson_id,
  sdr_id,
  closer_id,
  created_at,
  updated_at,
  markup_pct,
  margin_amount,
  unit_cost,
  total_cost,
  cost_source,
  cost_synced_at,
  client:clients(name),
  product:products(id, name, price, sku)
`;

export type SalesSortKey =
  | 'date_desc'
  | 'date_asc'
  | 'value_desc'
  | 'value_asc'
  | 'client_asc'
  | 'markup_desc'
  | 'markup_asc';

export interface SalesPageQuery {
  searchTerm?: string;
  /** ''/undefined = todas exceto 'lost'; 'lost' = apenas perdidas; demais = eq. */
  status?: string;
  markupTier?: MarkupTier | '';
  sortBy?: SalesSortKey;
  /** Página 1-based. */
  page?: number;
  pageSize?: number;
}

export interface SalesPage {
  rows: Sale[];
  total: number;
}

export type SalesListFilters = Pick<
  SalesPageQuery,
  'searchTerm' | 'status' | 'markupTier'
>;

const buildSalesListQuery = (select: string, filters: SalesListFilters) => {
  let query = supabase.from('sales_with_markup').select(select, { count: 'exact' });

  const safe = (filters.searchTerm ?? '').replace(/[,()*]/g, ' ').trim();
  if (safe) {
    query = query.or(`client_name.ilike.%${safe}%,product_name.ilike.%${safe}%`);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  } else {
    // Comportamento da página: perdidas só aparecem quando filtradas.
    query = query.neq('status', 'lost');
  }

  switch (filters.markupTier) {
    case 'excellent':
      query = query.gte('markup_pct', 40);
      break;
    case 'healthy':
      query = query.gte('markup_pct', 20).lt('markup_pct', 40);
      break;
    case 'critical':
      query = query.lt('markup_pct', 20);
      break;
    case 'unknown':
      query = query.is('markup_pct', null);
      break;
  }

  return query;
};

const SALES_SORT_COLUMNS: Record<SalesSortKey, { column: string; ascending: boolean }> = {
  date_desc: { column: 'created_at', ascending: false },
  date_asc: { column: 'created_at', ascending: true },
  value_desc: { column: 'amount', ascending: false },
  value_asc: { column: 'amount', ascending: true },
  client_asc: { column: 'client_name', ascending: true },
  markup_desc: { column: 'markup_pct', ascending: false },
  markup_asc: { column: 'markup_pct', ascending: true },
};

type SaleRow = Record<string, unknown> & {
  id: string;
  client?: { name?: string } | null;
  product?: { name?: string; sku?: string } | null;
  client_name?: string;
  product_name?: string;
  amount?: number;
  status: string;
  created_at: string;
  client_id?: string;
  product_id?: string;
  salesperson_id?: string;
  sku?: string;
  ai_prediction_score?: number;
  ai_prediction_reasoning?: string;
  whatsapp_status?: string;
  whatsapp_last_interaction?: string;
  markup_pct?: number | null;
  margin_amount?: number | null;
  unit_cost?: number | null;
  total_cost?: number | null;
  cost_source?: string | null;
  cost_synced_at?: string | null;
};

const mapSaleRow = (sale: SaleRow): Sale => ({
  id: sale.id.substring(0, 8).toUpperCase(),
  fullId: sale.id,
  cliente: sale.client?.name || sale.client_name || '',
  produto: sale.product?.name || sale.product_name || '',
  valor: Number(sale.amount || 0),
  status: sale.status,
  statusLabel: SALE_STATUS_LABELS[sale.status] || sale.status,
  data: format(new Date(sale.created_at), 'dd/MM/yyyy', { locale: ptBR }),
  created_at: sale.created_at,
  client_id: sale.client_id,
  product_id: sale.product_id,
  salesperson_id: sale.salesperson_id,
  sku: sale.sku || sale.product?.sku,
  ai_prediction_score: sale.ai_prediction_score,
  ai_prediction_reasoning: sale.ai_prediction_reasoning,
  whatsapp_status: sale.whatsapp_status,
  whatsapp_last_interaction: sale.whatsapp_last_interaction,
  markup_pct: sale.markup_pct ?? null,
  margin_amount: sale.margin_amount ?? null,
  unit_cost: sale.unit_cost ?? null,
  total_cost: sale.total_cost ?? null,
  cost_source: sale.cost_source ?? null,
  cost_synced_at: sale.cost_synced_at ?? null,
});

export const salesService = {
  async getSales(searchTerm?: string): Promise<Sale[]> {
    let query = supabase
      .from('sales_with_markup')
      .select(
        `
        *,
        client:clients(name),
        product:products(id, name, price, sku)
      `
      )
      .order('created_at', { ascending: false })
      .limit(100);

    if (searchTerm) {
      // PostgREST .or() parses commas/parentheses as separators; strip them from user input.
      const safe = searchTerm.replace(/[,()*]/g, ' ').trim();
      if (safe) {
        query = query.or(`client_name.ilike.%${safe}%,product_name.ilike.%${safe}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return ((data || []) as SaleRow[]).map(mapSaleRow);
  },

  /** Página server-side da lista /vendas (range + count + select explícito). */
  async getSalesPage({
    searchTerm = '',
    status = '',
    markupTier = '',
    sortBy = 'date_desc',
    page = 1,
    pageSize = 10,
  }: SalesPageQuery = {}): Promise<SalesPage> {
    const sort = SALES_SORT_COLUMNS[sortBy] ?? SALES_SORT_COLUMNS.date_desc;
    const from = (Math.max(1, page) - 1) * pageSize;

    const { data, error, count } = await buildSalesListQuery(SALES_LIST_COLUMNS, {
      searchTerm,
      status,
      markupTier,
    })
      // Ordenação client-side anterior colocava nulls por último em markup.
      .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    return {
      // eslint-disable-next-line no-restricted-syntax
      rows: ((data || []) as unknown as SaleRow[]).map(mapSaleRow),
      total: count ?? 0,
    };
  },

  /**
   * Resumo de rentabilidade da seleção atual (mesmos filtros de `getSalesPage`),
   * calculado sobre TODAS as linhas filtradas — não só a página visível.
   * Seleciona apenas `markup_pct` e percorre janelas de `.range()`.
   */
  async getSalesMarkupSummary(filters: SalesListFilters): Promise<MarkupSummary> {
    const rows = await fetchAllRows<{ markup_pct: number | null }>(
      (from, to) =>
        // eslint-disable-next-line no-restricted-syntax
        buildSalesListQuery('markup_pct', filters)
          .order('id', { ascending: true })
          .range(from, to) as unknown as PostgrestLike<{ markup_pct: number | null }>
    );
    return summarizeMarkup(rows.map(r => r.markup_pct));
  },

  async createSale(input: CreateSaleInput) {
    const { data, error } = await supabase
      .from('sales')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
