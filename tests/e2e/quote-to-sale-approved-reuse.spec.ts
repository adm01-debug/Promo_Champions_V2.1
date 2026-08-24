import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import {
  ORDER_NUMBER_REGEX,
  cleanupQuote,
  convert,
  getSeqLast,
  seedQuote,
} from './helpers/quote-to-sale-helpers';

/**
 * E2E: Fluxo approved (trigger legado cria PED-*) → RPC de conversão.
 *
 * Valida que:
 *   1. Ao criar quote com status='approved', o trigger `trg_convert_quote_to_order`
 *      SEMPRE cria uma order `PED-*` (não é opcional).
 *   2. A RPC `fn_convert_quote_to_sale` REUSA essa order (mesmo id/order_number).
 *   3. `reused_order=true`, `orders_conversion_seq` NÃO avança.
 *   4. Uma única `sales` é criada, mesmo em chamadas subsequentes (idempotente).
 *   5. A 2ª chamada devolve o mesmo `order_number` (regressão do BUG#1).
 */
test.describe('Fluxo approved: reuso exato de order existente', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  let quoteId: string;
  let preExistingOrderId: string | null;
  let preExistingOrderNumber: string | null;

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);

    const seed = await seedQuote(client, {
      status: 'approved',
      total: 615,
      itemTotal: 615,
      label: 'E2E Approved Reuse',
    });
    quoteId = seed.quoteId;
    preExistingOrderId = seed.preExistingOrderId;
    preExistingOrderNumber = seed.preExistingOrderNumber;
  });

  test.afterAll(async () => {
    await cleanupQuote(client, quoteId);
  });

  test('approved cria PED-*; RPC reusa exatamente a mesma order/order_number', async () => {
    // 1. Trigger legado precondição: existe order PED-* para o quote
    expect(preExistingOrderId).toBeTruthy();
    expect(preExistingOrderNumber).toBeTruthy();
    expect(preExistingOrderNumber).toMatch(ORDER_NUMBER_REGEX);

    // 2. Snapshot sequence antes da RPC
    const seqBefore = await getSeqLast(client);

    // 3. Primeira RPC → deve reusar
    const { payload: p1, error: e1 } = await convert(client, quoteId);
    expect(e1).toBeNull();
    expect(p1).not.toBeNull();
    expect(p1!.order_id).toBe(preExistingOrderId);
    expect(p1!.order_number).toBe(preExistingOrderNumber);
    expect(p1!.reused_order).toBe(true);
    expect(p1!.idempotent === true).toBe(false);

    // 4. Sequence NÃO avança em reuso
    const seqMid = await getSeqLast(client);
    expect(seqMid).toBe(seqBefore);

    // 5. Estado consolidado: 1 order, 1 sale, quote convertido
    const postOrders = await client
      .from('orders')
      .select('id, order_number')
      .eq('quote_id', quoteId);
    expect(postOrders.data?.length).toBe(1);
    expect(postOrders.data![0].id).toBe(p1!.order_id);

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

    // 6. Idempotência (regressão BUG#1): 2ª chamada devolve order_number
    const { payload: p2, error: e2 } = await convert(client, quoteId);
    expect(e2).toBeNull();
    expect(p2!.order_id).toBe(p1!.order_id);
    expect(p2!.order_number).toBe(p1!.order_number);
    expect(p2!.idempotent).toBe(true);

    // 7. Nenhuma duplicação após 2ª chamada
    const finalOrders = await client.from('orders').select('id').eq('quote_id', quoteId);
    expect(finalOrders.data?.length).toBe(1);

    const { count: dupOrderNumber } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_number', p1!.order_number);
    expect(dupOrderNumber).toBe(1);

    const { count: salesCount2 } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(salesCount2).toBe(1);

    // 8. Sequence permanece intacta após 2ª chamada
    const seqAfter = await getSeqLast(client);
    expect(seqAfter).toBe(seqBefore);
  });
});
