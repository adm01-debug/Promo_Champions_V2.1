import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: 5 chamadas simultâneas de `fn_convert_quote_to_sale` sobre o mesmo
 * orçamento. Verifica que:
 *   1. Nenhuma chamada falha (erro nulo em todas).
 *   2. Todas retornam o MESMO order_id e MESMO order_number.
 *   3. Pelo menos 4 chamadas retornam `idempotent: true` (só 1 cria).
 *   4. Existe exatamente 1 `orders` e 1 `sales` no banco.
 *   5. `order_number` é único no formato `ORC-YYYYMMDD-NNNNNNNN`.
 */
test.describe('Concorrência: 5 chamadas simultâneas da RPC', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  const N = 5;
  let client: SupabaseClient;
  let quoteId: string;

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);

    const total = 750;
    const { data: quote, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Concorrência x5',
        title: 'E2E Convert x5',
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
      product_name: 'Item x5',
      quantity: 5,
      unit_price: 150,
      total_price: total,
    });
    if (iErr) throw new Error(`Falha ao inserir item: ${iErr.message}`);
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

  test('5 RPCs em paralelo produzem 1 order + 1 sale sem colisão', async () => {
    const call = () =>
      client.rpc('fn_convert_quote_to_sale' as never, { _quote_id: quoteId } as never);

    const results = await Promise.all(Array.from({ length: N }, call));

    // Todas com sucesso
    for (const r of results) expect(r.error).toBeNull();

    const payloads = results.map(
      (r) => r.data as { order_id: string; order_number: string; idempotent?: boolean },
    );

    // Todos convergem para o mesmo order
    const firstOrderId = payloads[0].order_id;
    const firstOrderNumber = payloads[0].order_number;
    for (const p of payloads) {
      expect(p.order_id).toBe(firstOrderId);
      expect(p.order_number).toBe(firstOrderNumber);
    }
    expect(firstOrderNumber).toMatch(/^ORC-\d{8}-\d{8}$/);

    // Só 1 conversão real; N-1 idempotentes
    const idempotentCount = payloads.filter((p) => p.idempotent).length;
    expect(idempotentCount).toBeGreaterThanOrEqual(N - 1);

    // Verificação no banco: 1 order, 1 sale, order_number único
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

    const { count: dupCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_number', firstOrderNumber);
    expect(dupCount).toBe(1);
  });
});
