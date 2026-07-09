import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: Duas chamadas simultâneas da RPC `fn_convert_quote_to_sale`.
 *
 * Garante que sob concorrência:
 *   1. Apenas 1 registro em `sales` é criado.
 *   2. Apenas 1 registro em `orders` (mesmo id) é criado.
 *   3. `order_number` é único e no formato esperado.
 *   4. Uma das chamadas retorna `idempotent: true`.
 */
test.describe('Concorrência: duas conversões simultâneas', () => {
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

    const total = 480;
    const { data: quote, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Concorrência',
        title: 'E2E Concurrent Convert',
        total_value: total,
        subtotal: total,
        status: 'approved',
        source: 'manual',
      })
      .select('id')
      .single();
    if (error || !quote) throw new Error(`Falha ao criar quote: ${error?.message}`);
    quoteId = quote.id;

    const { error: iErr } = await client.from('quote_items').insert({
      quote_id: quoteId,
      product_name: 'Item Concorrente',
      quantity: 4,
      unit_price: 120,
      total_price: total,
    });
    if (iErr) throw new Error(`Falha ao inserir item: ${iErr.message}`);
  });

  test.afterAll(async () => {
    if (!client || !quoteId) return;
    const { data: orders } = await client.from('orders').select('id').eq('quote_id', quoteId);
    for (const o of orders ?? []) await client.from('orders').delete().eq('id', o.id);

    const { data: q } = await client.from('quotes').select('sale_id').eq('id', quoteId).maybeSingle();
    if (q?.sale_id) await client.from('sales').delete().eq('id', q.sale_id);

    await client.from('quote_items').delete().eq('quote_id', quoteId);
    await client.from('quotes').delete().eq('id', quoteId);
  });

  test('duas RPCs em paralelo produzem 1 sale + 1 order sem colisão', async () => {
    const call = () =>
      client.rpc('fn_convert_quote_to_sale' as never, { _quote_id: quoteId } as never);

    const [r1, r2] = await Promise.all([call(), call()]);

    expect(r1.error).toBeNull();
    expect(r2.error).toBeNull();

    const results = [r1.data, r2.data] as Array<{
      order_id: string;
      order_number: string;
      idempotent?: boolean;
    }>;

    // Ambas devem apontar para o mesmo order_id e order_number
    expect(results[0].order_id).toBe(results[1].order_id);
    expect(results[0].order_number).toBe(results[1].order_number);

    // Pelo menos uma foi idempotente
    expect(Boolean(results[0].idempotent) || Boolean(results[1].idempotent)).toBe(true);

    // Verificação no banco: exatamente 1 order e 1 sale
    const { count: ordersCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(ordersCount).toBe(1);

    const { data: quoteFinal } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(quoteFinal?.sale_id).toBeTruthy();
    expect(quoteFinal?.status).toBe('converted');

    const { count: salesCount } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('id', quoteFinal!.sale_id!);
    expect(salesCount).toBe(1);

    // order_number no formato ORC-YYYYMMDD-NNNNNNNN e único
    expect(results[0].order_number).toMatch(/^ORC-\d{8}-\d{8}$/);
    const { count: dupCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_number', results[0].order_number);
    expect(dupCount).toBe(1);
  });
});
