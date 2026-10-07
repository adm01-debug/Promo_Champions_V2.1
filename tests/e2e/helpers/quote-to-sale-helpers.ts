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
  }
): Promise<SeedResult> {
  const total = opts.total;
  const itemTotal = opts.itemTotal ?? total;
  const label = opts.label ?? 'E2E Quote';

  const insertPayload: Record<string, unknown> = {
    client_name: label,
    title: label,
    total_value: total,
    subtotal: total,
    // Insere como 'draft' para o trigger trg_convert_quote_to_order só
    // disparar no UPDATE, quando os items já existem (guard anti-sync-race
    // pula INSERT approved sem items).
    status: 'draft',
    source: 'manual',
  };
  if (opts.ownerSpId) {
    insertPayload.created_by = opts.ownerSpId;
  } else {
    // Sem ownerSpId explícito, atribui o vendedor do usuário autenticado:
    // a policy de quote_items exige dono (created_by) OU admin/manager —
    // sem isto o seed só funciona para sessões gestoras.
    const { data: spId } = await client.rpc('get_current_salesperson_id');
    if (spId) insertPayload.created_by = spId;
  }

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

  if (opts.status !== 'draft') {
    const { error: uErr } = await client
      .from('quotes')
      .update({ status: opts.status })
      .eq('id', q.id);
    if (uErr) throw new Error(`seedQuote: falha ao aprovar quote: ${uErr.message}`);
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
 *   1. Ler `quotes.sale_id`
 *   2. Localizar TODAS as sales criadas pelo teste — a linkada em
 *      `quotes.sale_id` E eventuais gêmeas: conversões concorrentes ou
 *      reenvios podem gravar mais de uma sale para a mesma quote, e só a
 *      última fica linkada. As demais só são localizáveis pelo
 *      `client_name` semeado — por isso `opts.clientNames` (prefixos) é
 *      obrigatório para specs que convertem de verdade. O match é
 *      case-sensitive e limitado a `created_at >= opts.since` (padrão:
 *      3h) para nunca tocar em vendas de outra spec ou de dados reais.
 *   3. Nullificar `quotes.sale_id` para liberar a FK
 *   4. Limpar filhos de `sales` que NÃO possuem ON DELETE CASCADE/SET NULL:
 *        - `sale_notifications_audit` (populada por tr_notify_sale_victory)
 *        - `follow_up_notifications`  (populada por tr_auto_followup_on_sale)
 *        - `follow_up_audit_logs`     (populada por triggers de follow-up)
 *      Sem isso, o DELETE em `sales` falha com foreign_key_violation.
 *   5. Deletar `sales` (demais filhos caem via CASCADE)
 *   6. Deletar `orders` (FK quote_id -> quotes é SET NULL, precisa delete explícito)
 *   7. Deletar `quotes` (CASCADE remove `quote_items`; delete explícito é defensivo)
 * Todos os DELETEs têm erro verificado — silenciar aqui deixava vendas de
 * teste órfãs em produção (invariante orphan_sales do CI).
 * Se `strict=true`, verifica ao final que não sobraram linhas.
 */
export async function cleanupQuote(
  client: SupabaseClient,
  quoteId: string | null | undefined,
  opts: { strict?: boolean; clientNames?: string[]; since?: string } = {}
): Promise<void> {
  if (!quoteId) return;

  const { data: q } = await client
    .from('quotes')
    .select('sale_id')
    .eq('id', quoteId)
    .maybeSingle();

  const saleIds = new Set<string>();
  if (q?.sale_id) saleIds.add(q.sale_id);

  const since = opts.since ?? new Date(Date.now() - 3 * 3600_000).toISOString();
  for (const prefix of opts.clientNames ?? []) {
    const { data: extra, error } = await client
      .from('sales')
      .select('id')
      .like('client_name', `${prefix}%`)
      .eq('source', 'quote_conversion')
      .gte('created_at', since);
    if (error)
      throw new Error(
        `cleanupQuote: falha ao listar sales '${prefix}%': ${error.message}`
      );
    for (const s of extra ?? []) saleIds.add(s.id as string);
  }

  if (saleIds.size > 0) {
    const ids = [...saleIds];
    if (q?.sale_id) {
      const { error } = await client
        .from('quotes')
        .update({ sale_id: null })
        .eq('id', quoteId);
      if (error)
        throw new Error(`cleanupQuote: falha ao nullificar sale_id: ${error.message}`);
    }
    // Filhos de sales sem CASCADE — precisam ser removidos antes do DELETE em sales.
    for (const t of [
      'sale_notifications_audit',
      'follow_up_notifications',
      'follow_up_audit_logs',
    ] as const) {
      const { error } = await client.from(t).delete().in('sale_id', ids);
      if (error) throw new Error(`cleanupQuote: falha ao limpar ${t}: ${error.message}`);
    }
    const { error } = await client.from('sales').delete().in('id', ids);
    if (error) throw new Error(`cleanupQuote: falha ao deletar sales: ${error.message}`);
  }

  const { error: oErr } = await client.from('orders').delete().eq('quote_id', quoteId);
  if (oErr) throw new Error(`cleanupQuote: falha ao deletar orders: ${oErr.message}`);
  const { error: iErr } = await client
    .from('quote_items')
    .delete()
    .eq('quote_id', quoteId);
  if (iErr)
    throw new Error(`cleanupQuote: falha ao deletar quote_items: ${iErr.message}`);
  const { error: qErr } = await client.from('quotes').delete().eq('id', quoteId);
  if (qErr) throw new Error(`cleanupQuote: falha ao deletar quote: ${qErr.message}`);

  if (opts.strict) {
    const { count: remQuotes } = await client
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('id', quoteId);
    if ((remQuotes ?? 0) > 0)
      throw new Error(`cleanupQuote: quote ${quoteId} não removido`);
    const { count: remOrders } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    if ((remOrders ?? 0) > 0)
      throw new Error(`cleanupQuote: orders órfãs para ${quoteId}`);
    if (saleIds.size > 0) {
      const { count: remSales } = await client
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .in('id', [...saleIds]);
      if ((remSales ?? 0) > 0)
        throw new Error(`cleanupQuote: sales órfãs para ${quoteId}`);
    }
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
  quoteId: string
): Promise<{ payload: ConversionPayload | null; error: unknown }> {
  const { data, error } = await client.rpc(
    'fn_convert_quote_to_sale' as never,
    {
      _quote_id: quoteId,
    } as never
  );
  return { payload: (data as ConversionPayload | null) ?? null, error };
}
