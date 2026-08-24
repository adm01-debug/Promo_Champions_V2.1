import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import {
  ORDER_NUMBER_REGEX,
  cleanupQuote,
  convert,
  seedQuote,
} from './helpers/quote-to-sale-helpers';

/**
 * E2E: Reuso de order existente ao converter orçamento aprovado.
 *
 * O trigger `trg_convert_quote_to_order` SEMPRE cria uma `orders` PED-*
 * quando o quote entra em `approved`. A RPC `fn_convert_quote_to_sale`
 * deve reusar essa order (mesmo id) e apenas emitir a `sales`.
 */
test.describe('Conversão: reuso de order existente (trigger legado)', () => {
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
      total: 250,
      label: 'E2E Reuse Order',
    });
    quoteId = seed.quoteId;
    preExistingOrderId = seed.preExistingOrderId;
    preExistingOrderNumber = seed.preExistingOrderNumber;
  });

  test.afterAll(async () => {
    await cleanupQuote(client, quoteId, { strict: true });
  });

  test('trigger cria 1 order ao aprovar; RPC reusa a mesma order', async () => {
    // Precondição: trigger produziu order PED-*
    expect(preExistingOrderId).toBeTruthy();
    expect(preExistingOrderNumber).toMatch(ORDER_NUMBER_REGEX);

    const { payload: p1, error: e1 } = await convert(client, quoteId);
    expect(e1).toBeNull();
    expect(p1).not.toBeNull();
    expect(p1!.order_id).toBe(preExistingOrderId);
    expect(p1!.order_number).toBe(preExistingOrderNumber);
    expect(p1!.reused_order).toBe(true);

    const afterOrders = await client
      .from('orders')
      .select('id')
      .eq('quote_id', quoteId);
    expect(afterOrders.data?.length).toBe(1);

    const { data: qFinal } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(qFinal?.sale_id).toBeTruthy();
    expect(qFinal?.status).toBe('converted');

    const { count: salesCount } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('id', qFinal!.sale_id!);
    expect(salesCount).toBe(1);

    // Idempotência
    const { payload: p2, error: e2 } = await convert(client, quoteId);
    expect(e2).toBeNull();
    expect(p2!.order_id).toBe(p1!.order_id);
    expect(p2!.order_number).toBe(p1!.order_number);
    expect(p2!.idempotent).toBe(true);

    const finalOrders = await client.from('orders').select('id').eq('quote_id', quoteId);
    expect(finalOrders.data?.length).toBe(1);
  });
});
