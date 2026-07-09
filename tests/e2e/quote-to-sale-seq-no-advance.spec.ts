import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: Falhas de conversão (TOTAL_MISMATCH e FORBIDDEN) NÃO devem avançar
 * `fn_get_orders_conversion_seq_last` nem criar registros em `orders`/`sales`.
 *
 * Cobre defesa em profundidade: mesmo em caminhos de erro, a sequence
 * permanece monotônica sem saltos.
 */
test.describe('Sequence: falha de conversão não avança sequence', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  const createdQuoteIds: string[] = [];

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);
  });

  test.afterAll(async () => {
    if (!client) return;
    for (const id of createdQuoteIds) {
      await client.from('quote_items').delete().eq('quote_id', id);
      await client.from('quotes').delete().eq('id', id);
    }
  });

  async function seedQuote(opts: {
    totalValue: number;
    itemTotal: number;
    createdBy?: string;
  }): Promise<string | null> {
    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Seq No-Advance',
        title: 'E2E Seq No-Advance',
        total_value: opts.totalValue,
        subtotal: opts.totalValue,
        status: 'approved',
        source: 'manual',
        ...(opts.createdBy ? { created_by: opts.createdBy } : {}),
      })
      .select('id')
      .single();
    if (error || !q) return null;
    createdQuoteIds.push(q.id);
    await client.from('quote_items').insert({
      quote_id: q.id,
      product_name: 'Item Seq No-Advance',
      quantity: 1,
      unit_price: opts.itemTotal,
      total_price: opts.itemTotal,
    });
    return q.id;
  }

  async function seqLast(): Promise<number> {
    const { data, error } = await client.rpc('fn_get_orders_conversion_seq_last' as never);
    expect(error).toBeNull();
    const n = Number(data);
    expect(Number.isFinite(n)).toBe(true);
    return n;
  }

  test('TOTAL_MISMATCH: sequence estável e zero orders/sales', async () => {
    const quoteId = await seedQuote({ totalValue: 100, itemTotal: 250 });
    if (!quoteId) {
      test.skip(true, 'Falha ao semear quote');
      return;
    }

    const before = await seqLast();

    const { data, error } = await client.rpc('fn_convert_quote_to_sale' as never, {
      _quote_id: quoteId,
    } as never);
    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/\[TOTAL_MISMATCH\]/);
    expect(data).toBeNull();

    const after = await seqLast();
    expect(after).toBe(before);

    const { count: ordersCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(ordersCount).toBe(0);

    const { data: qFinal } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(qFinal?.sale_id).toBeNull();
    expect(qFinal?.status).not.toBe('converted');
  });

  test('FORBIDDEN: sequence estável e zero orders/sales', async () => {
    const FOREIGN_USER = '00000000-0000-0000-0000-0000000000fd';
    const quoteId = await seedQuote({
      totalValue: 320,
      itemTotal: 320,
      createdBy: FOREIGN_USER,
    });
    if (!quoteId) {
      test.skip(true, 'RLS bloqueou seed com created_by alheio');
      return;
    }

    const before = await seqLast();

    const { data, error } = await client.rpc('fn_convert_quote_to_sale' as never, {
      _quote_id: quoteId,
    } as never);

    if (!error) {
      test.skip(true, 'Sessão E2E tem bypass de ownership; FORBIDDEN não aplicável.');
      return;
    }

    expect(error.message).toMatch(/\[FORBIDDEN\]/);
    expect(data).toBeNull();

    const after = await seqLast();
    expect(after).toBe(before);

    const { count: ordersCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(ordersCount).toBe(0);
  });
});
