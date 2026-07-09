import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: Duas chamadas SEQUENCIAIS da RPC no mesmo quote — sem concorrência.
 *
 * Valida idempotência determinística: o segundo call retorna EXATAMENTE
 * o mesmo `order_id` e `order_number` da primeira conversão, com
 * `idempotent: true`, e nenhum registro adicional é criado.
 */
test.describe('Idempotência sequencial: 2 conversões seguidas do mesmo quote', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  let quoteId: string;

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);

    const total = 555;
    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Idem Sequencial',
        title: 'E2E Idem Sequencial',
        total_value: total,
        subtotal: total,
        status: 'approved',
        source: 'manual',
      })
      .select('id')
      .single();
    if (error || !q) throw new Error(`Falha ao criar quote: ${error?.message}`);
    quoteId = q.id;

    await client.from('quote_items').insert({
      quote_id: quoteId,
      product_name: 'Item Idem Sequencial',
      quantity: 3,
      unit_price: 185,
      total_price: total,
    });
  });

  test.afterAll(async () => {
    if (!client || !quoteId) return;
    const { data: orders } = await client.from('orders').select('id').eq('quote_id', quoteId);
    for (const o of orders ?? []) await client.from('orders').delete().eq('id', o.id);
    const { data: q } = await client
      .from('quotes')
      .select('sale_id')
      .eq('id', quoteId)
      .maybeSingle();
    if (q?.sale_id) await client.from('sales').delete().eq('id', q.sale_id);
    await client.from('quote_items').delete().eq('quote_id', quoteId);
    await client.from('quotes').delete().eq('id', quoteId);
  });

  test('2 RPCs sequenciais devolvem mesmo order_id/order_number sem duplicar', async ({
    checkpoint,
  }) => {
    await checkpoint('antes-conversao');
    const { data: r1, error: e1 } = await client.rpc('fn_convert_quote_to_sale' as never, {
      _quote_id: quoteId,
    } as never);
    expect(e1).toBeNull();
    const p1 = r1 as { order_id: string; order_number: string; idempotent?: boolean };
    expect(p1.order_id).toBeTruthy();
    expect(p1.order_number).toMatch(/^ORC-\d{8}-\d{8}$/);

    const { data: r2, error: e2 } = await client.rpc('fn_convert_quote_to_sale' as never, {
      _quote_id: quoteId,
    } as never);
    expect(e2).toBeNull();
    const p2 = r2 as { order_id: string; order_number: string; idempotent?: boolean };

    expect(p2.order_id).toBe(p1.order_id);
    expect(p2.order_number).toBe(p1.order_number);
    expect(p2.idempotent).toBe(true);

    const { data: orders } = await client
      .from('orders')
      .select('id, order_number')
      .eq('quote_id', quoteId);
    expect(orders?.length).toBe(1);

    const { count: dupOrderNumber } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_number', p1.order_number);
    expect(dupOrderNumber).toBe(1);

    const { count: salesCount } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(salesCount).toBe(1);
    await checkpoint('depois-conversao');
  });
});
