import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: Reenvio sequencial da mesma conversão.
 *
 * Chama `fn_convert_quote_to_sale` duas vezes em série sobre o mesmo quote
 * e valida que:
 *   1. Ambas retornam `order_id` e `order_number` idênticos.
 *   2. A segunda chamada é marcada como `idempotent: true`.
 *   3. Não há linhas adicionais em `orders` nem em `sales`.
 */
test.describe('Idempotência: reenviar conversão duas vezes', () => {
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

    const total = 340;
    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Reenvio',
        title: 'E2E Reenvio Duplo',
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
      product_name: 'Item Reenvio',
      quantity: 2,
      unit_price: 170,
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

  test('segunda chamada é idempotente e não cria order/sale extras', async () => {
    const call = () =>
      client.rpc('fn_convert_quote_to_sale' as never, { _quote_id: quoteId } as never);

    const first = await call();
    expect(first.error).toBeNull();
    const p1 = first.data as { order_id: string; order_number: string; idempotent?: boolean };
    expect(p1.order_id).toBeTruthy();
    expect(p1.order_number).toMatch(/^ORC-\d{8}-\d{8}$/);

    const second = await call();
    expect(second.error).toBeNull();
    const p2 = second.data as { order_id: string; order_number: string; idempotent?: boolean };

    expect(p2.order_id).toBe(p1.order_id);
    expect(p2.order_number).toBe(p1.order_number);
    expect(p2.idempotent).toBe(true);

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
  });
});
