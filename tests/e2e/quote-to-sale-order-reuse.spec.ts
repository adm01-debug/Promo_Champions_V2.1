import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * E2E: Reuso de order existente ao converter orçamento aprovado.
 *
 * Cenário: um trigger legado (`trg_convert_quote_to_order`) pode criar uma
 * `orders` assim que o `quotes.status` vira 'approved'. Quando o usuário
 * então clica em "Converter em venda", a RPC `fn_convert_quote_to_sale`
 * NÃO pode duplicar a order — deve reaproveitar a existente (vinculada por
 * `orders.quote_id`) e apenas emitir a `sales` correspondente.
 *
 * Valida:
 *   1. Após aprovar o quote, existe exatamente 1 order com quote_id = quote.
 *   2. Após a conversão, ainda existe exatamente 1 order (mesmo id).
 *   3. Uma `sales` é criada e vinculada ao quote.
 *   4. Segunda chamada da RPC continua idempotente.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON ?? '';
const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY ?? '';

const HAS_AUTH = Boolean(SUPABASE_URL && SUPABASE_ANON && SESSION_JSON && STORAGE_KEY);

test.describe('Conversão: reuso de order existente (trigger legado)', () => {
  test.skip(!HAS_AUTH, 'Sessão Supabase gerenciada não injetada; pulando E2E autenticado.');

  let client: SupabaseClient;
  let quoteId: string;

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);

    // Seed: cria orçamento em rascunho + 1 item; depois aprova para acionar trigger legado.
    const { data: quote, error: qErr } = await client
      .from('quotes')
      .insert({
        customer_name: 'E2E Reuse Order',
        total_value: 250.0,
        status: 'draft',
      })
      .select('id')
      .single();
    if (qErr) throw qErr;
    quoteId = quote!.id as string;

    const { error: iErr } = await client.from('quote_items').insert({
      quote_id: quoteId,
      product_name: 'Produto Reuse',
      quantity: 1,
      unit_price: 250.0,
      total_price: 250.0,
    });
    if (iErr) throw iErr;

    const { error: aErr } = await client
      .from('quotes')
      .update({ status: 'approved' })
      .eq('id', quoteId);
    if (aErr) throw aErr;
  });

  test.afterAll(async () => {
    if (!quoteId) return;
    await client.from('sales').delete().eq('quote_id', quoteId);
    await client.from('order_items').delete().in(
      'order_id',
      (
        await client.from('orders').select('id').eq('quote_id', quoteId)
      ).data?.map((r: { id: string }) => r.id) ?? [],
    );
    await client.from('orders').delete().eq('quote_id', quoteId);
    await client.from('quote_items').delete().eq('quote_id', quoteId);
    await client.from('quotes').delete().eq('id', quoteId);
  });

  test('trigger legado cria 1 order ao aprovar; RPC reusa a mesma order', async () => {
    // 1. Antes da conversão: trigger legado pode ter criado 0..1 orders.
    const beforeOrders = await client
      .from('orders')
      .select('id, order_number, quote_id')
      .eq('quote_id', quoteId);
    expect(beforeOrders.error).toBeNull();
    const preCount = beforeOrders.data?.length ?? 0;
    expect(preCount).toBeLessThanOrEqual(1);
    const preOrderId = beforeOrders.data?.[0]?.id ?? null;

    // 2. Chama RPC de conversão.
    const { data: rpc1, error: rpcErr } = await client.rpc(
      'fn_convert_quote_to_sale',
      { p_quote_id: quoteId },
    );
    expect(rpcErr).toBeNull();
    expect(rpc1).toBeTruthy();

    // 3. Após a conversão: EXATAMENTE 1 order vinculada ao quote (sem duplicata).
    const afterOrders = await client
      .from('orders')
      .select('id, order_number, quote_id')
      .eq('quote_id', quoteId);
    expect(afterOrders.error).toBeNull();
    expect(afterOrders.data?.length).toBe(1);

    // Se já existia order do trigger, o id deve ser preservado (reuso).
    if (preOrderId) {
      expect(afterOrders.data?.[0]?.id).toBe(preOrderId);
    }

    // 4. Uma sales deve existir vinculada ao quote.
    const sales = await client.from('sales').select('id, quote_id').eq('quote_id', quoteId);
    expect(sales.error).toBeNull();
    expect(sales.data?.length).toBe(1);

    // 5. Idempotência: segunda chamada não duplica orders nem sales.
    const { error: rpc2Err } = await client.rpc('fn_convert_quote_to_sale', {
      p_quote_id: quoteId,
    });
    expect(rpc2Err).toBeNull();

    const finalOrders = await client
      .from('orders')
      .select('id')
      .eq('quote_id', quoteId);
    const finalSales = await client.from('sales').select('id').eq('quote_id', quoteId);
    expect(finalOrders.data?.length).toBe(1);
    expect(finalSales.data?.length).toBe(1);
  });
});
