/**
 * Fila da análise de crédito da primeira venda (regra da #761).
 *
 * O pedido nasce com `credit_status = 'aguardando_credito'`, a solicitação sai
 * por `credit_outbox` -> `credit-dispatch` e o veredito volta por
 * `receive-credit-decision`. Sem esta visão, um envio `dead` (callback do
 * Finance indisponível) ou um pedido parado só aparecia como um selo dentro do
 * detalhe do próprio pedido — nenhuma tela operacional mostrava a fila.
 *
 * Leitura: `orders` (RLS admin/gestor) e `credit_outbox` (policy
 * `credit_outbox_admin_read`). Nada é escrito aqui — a decisão é do Financeiro
 * e entra pelo endpoint autenticado `receive-credit-decision`.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CreditOutboxStatus = 'pending' | 'processing' | 'delivered' | 'dead';

export interface PendingCreditOrder {
  id: string;
  order_number: string;
  total: number;
  created_at: string;
  client_name: string | null;
  client_cnpj: string | null;
  outbox_status: CreditOutboxStatus | null;
  outbox_attempts: number;
  outbox_last_error: string | null;
  outbox_next_attempt_at: string | null;
  outbox_delivered_at: string | null;
}

export interface CreditAnalysisTotals {
  awaiting: number;
  inFlight: number;
  delivered: number;
  failed: number;
}

export interface CreditAnalysis {
  orders: PendingCreditOrder[];
  totals: CreditAnalysisTotals;
}

interface OutboxRow {
  order_id: string;
  status: string;
  attempts: number | null;
  last_error: string | null;
  next_attempt_at: string | null;
  delivered_at: string | null;
}

const OUTBOX_COLUMNS =
  'order_id, status, attempts, last_error, next_attempt_at, delivered_at';

export async function fetchCreditAnalysis(): Promise<CreditAnalysis> {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, total, created_at, clients(name, cnpj)')
    .eq('credit_status', 'aguardando_credito')
    .order('created_at', { ascending: true });

  if (ordersError) throw ordersError;

  const rows = orders ?? [];
  const ids = rows.map(row => row.id);
  let outbox: OutboxRow[] = [];

  if (ids.length > 0) {
    const { data, error } = await supabase
      .from('credit_outbox')
      .select(OUTBOX_COLUMNS)
      .in('order_id', ids)
      .order('created_at', { ascending: false });
    if (error) throw error;
    outbox = (data ?? []) as OutboxRow[];
  }

  // Uma linha por (order_id, event); o mais recente é o que interessa.
  const latest = new Map<string, OutboxRow>();
  for (const row of outbox) {
    if (!latest.has(row.order_id)) latest.set(row.order_id, row);
  }

  const totals: CreditAnalysisTotals = {
    awaiting: rows.length,
    inFlight: 0,
    delivered: 0,
    failed: 0,
  };

  const enriched = rows.map(row => {
    const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
    const item = latest.get(row.id);
    const status = (item?.status as CreditOutboxStatus | undefined) ?? null;
    if (status === 'dead') totals.failed += 1;
    else if (status === 'delivered') totals.delivered += 1;
    else if (status) totals.inFlight += 1;

    return {
      id: row.id,
      order_number: row.order_number,
      total: Number(row.total),
      created_at: row.created_at,
      client_name: client?.name ?? null,
      client_cnpj: client?.cnpj ?? null,
      outbox_status: status,
      outbox_attempts: item?.attempts ?? 0,
      outbox_last_error: item?.last_error ?? null,
      outbox_next_attempt_at: item?.next_attempt_at ?? null,
      outbox_delivered_at: item?.delivered_at ?? null,
    } satisfies PendingCreditOrder;
  });

  return { orders: enriched, totals };
}

export function useCreditAnalysis() {
  return useQuery({
    queryKey: ['admin', 'credit-analysis'],
    queryFn: fetchCreditAnalysis,
    refetchInterval: 60_000,
    staleTime: 15_000,
  });
}
