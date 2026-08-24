import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import {
  ORC_PATTERN,
  cleanupQuote,
  convert,
  getSeqLast,
  seedQuote,
} from './helpers/quote-to-sale-helpers';

/**
 * E2E: `fn_backfill_orders_conversion_seq` (admin) — sequence NUNCA regride,
 * é idempotente, e novos ORC-* continuam monotônicos após o backfill.
 *
 * IMPORTANTE: usamos status='won' para exercitar o path que produz ORC-*
 * (approved dispara trigger → PED-*, sequence não avança, não teríamos o
 * que validar aqui).
 */
test.describe('Backfill orders_conversion_seq: reexecução segura', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  const quoteIds: string[] = [];

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);
  });

  test.afterAll(async () => {
    for (const id of quoteIds) await cleanupQuote(client, id, { strict: true });
  });

  test('reexecução mantém last_value monotônico e ORC-* únicos', async () => {
    const beforeVal = await getSeqLast(client);

    const b1 = await client.rpc('fn_backfill_orders_conversion_seq' as never);
    if (b1.error && /FORBIDDEN/.test(b1.error.message)) {
      test.skip(true, 'Usuário E2E não é admin.');
    }
    expect(b1.error).toBeNull();
    const r1 = b1.data as { previous_value: number; new_value: number; legacy_max: number };
    expect(r1.new_value).toBeGreaterThanOrEqual(beforeVal);
    expect(r1.new_value).toBeGreaterThanOrEqual(r1.legacy_max);

    // Cria 3 conversões via path 'won' (ORC-*) após o backfill
    const numbers: string[] = [];
    for (let i = 0; i < 3; i++) {
      const seed = await seedQuote(client, {
        status: 'won',
        total: 100 + i,
        label: `E2E Backfill Won ${i}`,
      });
      quoteIds.push(seed.quoteId);
      const { payload, error } = await convert(client, seed.quoteId);
      expect(error).toBeNull();
      expect(payload!.order_number).toMatch(ORC_PATTERN);
      numbers.push(payload!.order_number);
    }
    expect(new Set(numbers).size).toBe(3);

    const counters = numbers.map((n) => Number(n.split('-')[2]));
    for (let i = 1; i < counters.length; i++) {
      expect(counters[i]).toBeGreaterThan(counters[i - 1]);
    }

    const afterVal = await getSeqLast(client);
    const b2 = await client.rpc('fn_backfill_orders_conversion_seq' as never);
    expect(b2.error).toBeNull();
    const r2 = b2.data as { previous_value: number; new_value: number };
    expect(r2.new_value).toBeGreaterThanOrEqual(afterVal);
  });
});
