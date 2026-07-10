/**
 * Helpers compartilhados pelos specs quote-to-sale.
 *
 * Realidade do banco (crítico entender):
 *
 *  - Trigger `trg_convert_quote_to_order` cria automaticamente uma order
 *    `PED-*` para todo INSERT/UPDATE de `quotes` que aterrissa em
 *    `status='approved'`. Portanto quotes semeados com approved SEMPRE
 *    já têm uma order pré-existente quando a RPC é chamada.
 *
 *  - Status `won` e `accepted` NÃO disparam o trigger; a RPC entra no
 *    path de criação nova e gera `ORC-YYYYMMDD-NNNNNNNN`. Esse é o único
 *    caminho onde `orders_conversion_seq` avança.
 *
 *  - Regex `ORDER_NUMBER_REGEX` aceita ambos os prefixos.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export const ORDER_NUMBER_REGEX = /^(ORC|PED)-/;
export const ORC_PATTERN = /^ORC-\d{8}-\d{8}$/;
export const PED_PATTERN = /^PED-/;

export type ConversionPayload = {
  sale_id: string;
  order_id: string;
  order_number: string;
  idempotent?: boolean;
  reused_order?: boolean;
  items_count?: number;
};

export type SeedResult = {
  quoteId: string;
  preExistingOrderId: string | null;
  preExistingOrderNumber: string | null;
};

/**
 * Semeia um quote + 1 quote_item e, quando o status dispara o trigger legado,
 * retorna a order pré-existente para asserts de reuso.
 */
export async function seedQuote(
  client: SupabaseClient,
  opts: {
    status: 'draft' | 'approved' | 'accepted' | 'won';
    total: number;
    itemTotal?: number; // default = total
    ownerSpId?: string;
    withItems?: boolean; // default true
    label?: string;
  },
): Promise<SeedResult> {
  const total = opts.total;
  const itemTotal = opts.itemTotal ?? total;
  const label = opts.label ?? 'E2E Quote';

  const insertPayload: Record<string, unknown> = {
    client_name: label,
    title: label,
    total_value: total,
    subtotal: total,
    status: opts.status,
    source: 'manual',
  };
  if (opts.ownerSpId) insertPayload.created_by = opts.ownerSpId;

  const { data: q, error } = await client
    .from('quotes')
    .insert(insertPayload)
    .select('id')
    .single();

  if (error || !q) throw new Error(`seedQuote: falha ao criar quote: ${error?.message}`);

  if (opts.withItems !== false) {
    const { error: iErr } = await client.from('quote_items').insert({
      quote_id: q.id,
      product_name: `${label} · item`,
      quantity: 1,
      unit_price: itemTotal,
      total_price: itemTotal,
    });
    if (iErr) throw new Error(`seedQuote: falha ao inserir item: ${iErr.message}`);
  }

  // Trigger legado pode ter criado uma order PED-*
  const { data: preOrders } = await client
    .from('orders')
    .select('id, order_number')
    .eq('quote_id', q.id)
    .order('created_at', { ascending: true })
    .limit(1);
  const preOrder = preOrders?.[0] ?? null;

  return {
    quoteId: q.id,
    preExistingOrderId: preOrder?.id ?? null,
    preExistingOrderNumber: preOrder?.order_number ?? null,
  };
}

/**
 * Cleanup determinístico. Ordem crítica para evitar bloqueios de FK:
 *   1. Ler `quotes.sale_id` (referência opcional para sales)
 *   2. Nullificar `quotes.sale_id` para liberar a FK
 *   3. Deletar `sales` (não há FK reversa quote_id em sales)
 *   4. Deletar `orders` (FK quote_id -> quotes)
 *   5. Deletar `quote_items`
 *   6. Deletar `quotes`
 * Se `strict=true`, verifica ao final que não sobraram linhas.
 */
export async function cleanupQuote(
  client: SupabaseClient,
  quoteId: string | null | undefined,
  opts: { strict?: boolean } = {},
): Promise<void> {
  if (!quoteId) return;

  const { data: q } = await client
    .from('quotes')
    .select('sale_id')
    .eq('id', quoteId)
    .maybeSingle();

  if (q?.sale_id) {
    await client.from('quotes').update({ sale_id: null }).eq('id', quoteId);
    await client.from('sales').delete().eq('id', q.sale_id);
  }

  await client.from('orders').delete().eq('quote_id', quoteId);
  await client.from('quote_items').delete().eq('quote_id', quoteId);
  await client.from('quotes').delete().eq('id', quoteId);

  if (opts.strict) {
    const { count: remQuotes } = await client
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('id', quoteId);
    if ((remQuotes ?? 0) > 0) throw new Error(`cleanupQuote: quote ${quoteId} não removido`);
    const { count: remOrders } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    if ((remOrders ?? 0) > 0) throw new Error(`cleanupQuote: orders órfãs para ${quoteId}`);
  }
}

export async function getSeqLast(client: SupabaseClient): Promise<number> {
  const { data, error } = await client.rpc('fn_get_orders_conversion_seq_last' as never);
  if (error) throw new Error(`getSeqLast: ${error.message}`);
  const n = Number(data);
  if (!Number.isFinite(n)) throw new Error(`getSeqLast: retorno inválido ${data}`);
  return n;
}

export async function convert(
  client: SupabaseClient,
  quoteId: string,
): Promise<{ payload: ConversionPayload | null; error: unknown }> {
  const { data, error } = await client.rpc('fn_convert_quote_to_sale' as never, {
    _quote_id: quoteId,
  } as never);
  return { payload: (data as ConversionPayload | null) ?? null, error };
}
