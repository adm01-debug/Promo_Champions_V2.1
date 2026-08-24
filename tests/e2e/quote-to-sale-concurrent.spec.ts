import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import {
  ORDER_NUMBER_REGEX,
  cleanupQuote,
  getSeqLast,
  seedQuote,
  type ConversionPayload,
} from './helpers/quote-to-sale-helpers';

/**
 * E2E: Duas chamadas simultâneas da RPC (versão baseline; ver
 * quote-to-sale-concurrent-x5 para carga maior e concurrent-won para o
 * caminho ORC-*).
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

    const seed = await seedQuote(client, {
      status: 'approved',
      total: 480,
      label: 'E2E Concurrent x2',
    });
    quoteId = seed.quoteId;
  });

  test.afterAll(async () => {
    await cleanupQuote(client, quoteId, { strict: true });
  });

  test('duas RPCs em paralelo produzem 1 sale + 1 order sem colisão', async () => {
    const call = () =>
      client.rpc('fn_convert_quote_to_sale' as never, { _quote_id: quoteId } as never);

    const seqBefore = await getSeqLast(client);

    const [r1, r2] = await Promise.all([call(), call()]);
    expect(r1.error).toBeNull();
    expect(r2.error).toBeNull();

    const results = [r1.data, r2.data] as ConversionPayload[];
    expect(results[0].order_id).toBe(results[1].order_id);
    expect(results[0].order_number).toBe(results[1].order_number);
    expect(results[0].order_number).toMatch(ORDER_NUMBER_REGEX);
    expect(Boolean(results[0].idempotent) || Boolean(results[1].idempotent)).toBe(true);

    const seqAfter = await getSeqLast(client);
    const wasReused = results.some((p) => p.reused_order === true);
    if (wasReused || results[0].order_number.startsWith('PED-')) {
      expect(seqAfter).toBe(seqBefore);
    } else {
      expect(seqAfter).toBe(seqBefore + 1);
    }

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
    expect(qFinal?.sale_id).toBeTruthy();
    expect(qFinal?.status).toBe('converted');

    const { count: salesCount } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('id', qFinal!.sale_id!);
    expect(salesCount).toBe(1);

    const { count: dup } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_number', results[0].order_number);
    expect(dup).toBe(1);
  });
});
