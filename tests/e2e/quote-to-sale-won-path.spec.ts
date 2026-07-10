import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import { cleanupQuote, convert, getSeqLast, seedQuote } from './helpers/quote-to-sale-helpers';

/**
 * E2E: Path de criação nova (status='won'), único caminho que gera
 * `ORC-YYYYMMDD-NNNNNNNN` e avança `orders_conversion_seq`.
 *
 * Este spec preenche o gap: os demais specs semeiam approved, que dispara
 * o trigger legado `trg_convert_quote_to_order` (PED-*), então o path
 * canônico da RPC nunca era exercitado em E2E.
 */
test.describe('Path novo (won): RPC cria ORC-* e avança sequence', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  const createdQuoteIds: string[] = [];

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);
  });

  test.afterAll(async () => {
    for (const id of createdQuoteIds) await cleanupQuote(client, id);
  });

  test('won: 1 conversão gera ORC-* e sequence +1', async () => {
    const seed = await seedQuote(client, {
      status: 'won',
      total: 512,
      label: 'E2E Won Single',
    });
    createdQuoteIds.push(seed.quoteId);
    expect(seed.preExistingOrderId).toBeNull();

    const before = await getSeqLast(client);

    const { payload, error } = await convert(client, seed.quoteId);
    expect(error).toBeNull();
    expect(payload).not.toBeNull();
    expect(payload!.order_number).toMatch(/^ORC-\d{8}-\d{8}$/);
    expect(payload!.reused_order).toBe(false);
    expect(payload!.idempotent === true).toBe(false);

    const after = await getSeqLast(client);
    expect(after).toBe(before + 1);

    // Idempotência: 2ª chamada devolve mesmo ORC-*, sequence intacta
    const { payload: p2 } = await convert(client, seed.quoteId);
    expect(p2!.order_id).toBe(payload!.order_id);
    expect(p2!.order_number).toBe(payload!.order_number);
    expect(p2!.idempotent).toBe(true);
    expect(await getSeqLast(client)).toBe(after);
  });

  test('won x3 quotes independentes: sequence avança exatamente +3, números únicos', async () => {
    const before = await getSeqLast(client);
    const numbers: string[] = [];
    for (let i = 0; i < 3; i++) {
      const seed = await seedQuote(client, {
        status: 'won',
        total: 100 + i,
        label: `E2E Won Multi ${i}`,
      });
      createdQuoteIds.push(seed.quoteId);
      const { payload, error } = await convert(client, seed.quoteId);
      expect(error).toBeNull();
      expect(payload!.order_number).toMatch(/^ORC-\d{8}-\d{8}$/);
      numbers.push(payload!.order_number);
    }
    const after = await getSeqLast(client);
    expect(after).toBe(before + 3);
    expect(new Set(numbers).size).toBe(3);
  });
});
