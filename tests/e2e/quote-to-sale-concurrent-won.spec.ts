import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import {
  ORC_PATTERN,
  cleanupQuote,
  getSeqLast,
  seedQuote,
  type ConversionPayload,
} from './helpers/quote-to-sale-helpers';

/**
 * E2E: 5 chamadas simultâneas no path 'won' (ORC-*).
 * Valida: sequence +1 exato, 1 ORC-*, 4 idempotentes, 1 sale.
 */
test.describe('Concorrência x5 (path won → ORC-*)', () => {
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

    const seed = await seedQuote(client, {
      status: 'won',
      total: 999,
      label: 'E2E Concurrent Won x5',
    });
    quoteId = seed.quoteId;
    expect(seed.preExistingOrderId).toBeNull(); // won não dispara trigger
  });

  test.afterAll(async () => {
    await cleanupQuote(client, quoteId, { strict: true });
  });

  test('5 RPCs paralelas em won → 1 ORC-*, sequence +1, 4 idempotentes', async () => {
    const call = () =>
      client.rpc('fn_convert_quote_to_sale' as never, { _quote_id: quoteId } as never);

    const seqBefore = await getSeqLast(client);
    const results = await Promise.all(Array.from({ length: N }, call));
    for (const r of results) expect(r.error).toBeNull();

    const payloads = results.map((r) => r.data as ConversionPayload);
    const first = payloads[0];
    for (const p of payloads) {
      expect(p.order_id).toBe(first.order_id);
      expect(p.order_number).toBe(first.order_number);
    }
    expect(first.order_number).toMatch(ORC_PATTERN);
    expect(payloads.filter((p) => p.idempotent).length).toBeGreaterThanOrEqual(N - 1);

    const seqAfter = await getSeqLast(client);
    expect(seqAfter).toBe(seqBefore + 1);

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

    const { count: dup } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_number', first.order_number);
    expect(dup).toBe(1);
  });
});
