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
 * E2E: Reenvio sequencial — 3 chamadas em série. Regressão BUG#1: todas
 * as chamadas idempotentes devem devolver `order_number` populado.
 */
test.describe('Idempotência: reenviar conversão 3x', () => {
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

    const seed = await seedQuote(client, {
      status: 'approved',
      total: 340,
      label: 'E2E Reenvio',
    });
    quoteId = seed.quoteId;
  });

  test.afterAll(async () => {
    await cleanupQuote(client, quoteId, { strict: true });
  });

  test('3 chamadas sequenciais: 1 real + 2 idempotentes, todas com order_number', async () => {
    const { payload: p1, error: e1 } = await convert(client, quoteId);
    expect(e1).toBeNull();
    expect(p1!.order_number).toMatch(ORDER_NUMBER_REGEX);

    const { payload: p2, error: e2 } = await convert(client, quoteId);
    expect(e2).toBeNull();
    expect(p2!.order_id).toBe(p1!.order_id);
    expect(p2!.order_number).toBe(p1!.order_number);
    expect(p2!.idempotent).toBe(true);

    const { payload: p3, error: e3 } = await convert(client, quoteId);
    expect(e3).toBeNull();
    expect(p3!.order_id).toBe(p1!.order_id);
    expect(p3!.order_number).toBe(p1!.order_number);
    expect(p3!.idempotent).toBe(true);

    const { count: ordersCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(ordersCount).toBe(1);

    const { data: qFinal } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(qFinal?.status).toBe('converted');
    const { count: salesCount } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('id', qFinal!.sale_id!);
    expect(salesCount).toBe(1);
  });
});
