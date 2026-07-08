import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: Fluxo draft → approved (dispara trigger legado) → RPC de conversão.
 *
 * Valida que:
 *   1. Ao mudar status para 'approved', o trigger legado pode criar 1 order.
 *   2. A RPC `fn_convert_quote_to_sale` REUSA a mesma order (id/order_number).
 *   3. Uma única `sales` é criada, mesmo em chamadas subsequentes (idempotente).
 *   4. Nenhuma duplicata de orders/sales em nenhum momento.
 */
test.describe('Fluxo approved: reuso exato de order existente', () => {
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

    const total = 615;
    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Approved Reuse',
        title: 'E2E Approved Reuse',
        total_value: total,
        subtotal: total,
        status: 'draft',
        source: 'manual',
      })
      .select('id')
      .single();
    if (error || !q) throw new Error(`Falha ao criar quote: ${error?.message}`);
    quoteId = q.id;

    await client.from('quote_items').insert({
      quote_id: quoteId,
      product_name: 'Item Approved Reuse',
      quantity: 3,
      unit_price: 205,
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

  test('approved cria order; RPC reusa exatamente a mesma order/order_number', async () => {
    // 1. Approve → possível criação via trigger legado
    const { error: upErr } = await client
      .from('quotes')
      .update({ status: 'approved' })
      .eq('id', quoteId);
    expect(upErr).toBeNull();

    // Aguarda propagação do trigger
    await new Promise((r) => setTimeout(r, 500));

    const preOrders = await client
      .from('orders')
      .select('id, order_number')
      .eq('quote_id', quoteId);
    expect(preOrders.error).toBeNull();
    expect((preOrders.data?.length ?? 0)).toBeLessThanOrEqual(1);
    const preOrder = preOrders.data?.[0] ?? null;

    // 2. RPC de conversão
    const { data: rpc1, error: rpc1Err } = await client.rpc(
      'fn_convert_quote_to_sale' as never,
      { _quote_id: quoteId } as never,
    );
    expect(rpc1Err).toBeNull();
    const payload1 = rpc1 as { order_id: string; order_number: string; idempotent?: boolean };

    // 3. Se havia order pré-existente, RPC deve reusar id + order_number
    if (preOrder) {
      expect(payload1.order_id).toBe(preOrder.id);
      expect(payload1.order_number).toBe(preOrder.order_number);
    }

    // 4. Estado consolidado: 1 order, 1 sale, quote convertido
    const postOrders = await client
      .from('orders')
      .select('id, order_number')
      .eq('quote_id', quoteId);
    expect(postOrders.data?.length).toBe(1);
    expect(postOrders.data![0].id).toBe(payload1.order_id);

    const { data: qMid } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(qMid?.sale_id).toBeTruthy();
    expect(qMid?.status).toBe('converted');

    const { count: salesCount1 } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('id', qMid!.sale_id!);
    expect(salesCount1).toBe(1);

    // 5. Idempotência: 2ª chamada não duplica nada
    const { data: rpc2, error: rpc2Err } = await client.rpc(
      'fn_convert_quote_to_sale' as never,
      { _quote_id: quoteId } as never,
    );
    expect(rpc2Err).toBeNull();
    const payload2 = rpc2 as { order_id: string; order_number: string; idempotent?: boolean };
    expect(payload2.order_id).toBe(payload1.order_id);
    expect(payload2.order_number).toBe(payload1.order_number);
    expect(payload2.idempotent).toBe(true);

    const finalOrders = await client
      .from('orders')
      .select('id')
      .eq('quote_id', quoteId);
    expect(finalOrders.data?.length).toBe(1);

    const { count: dupOrderNumber } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_number', payload1.order_number);
    expect(dupOrderNumber).toBe(1);

    const { count: salesCount2 } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(salesCount2).toBe(1);
  });
});
