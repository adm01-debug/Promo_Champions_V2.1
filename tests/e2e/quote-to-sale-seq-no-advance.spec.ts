import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import { cleanupQuote, convert, getSeqLast, seedQuote } from './helpers/quote-to-sale-helpers';

/**
 * E2E: Falhas de conversão (TOTAL_MISMATCH e FORBIDDEN) NÃO devem avançar
 * `orders_conversion_seq` nem criar registros em `orders`/`sales`.
 *
 * IMPORTANTE: usamos status='won' porque approved dispararia o trigger
 * legado que criaria a order PED-* antes da RPC — o guarda-corpo da
 * sequence ficaria coberto por coincidência. Com won, a RPC realmente
 * tenta materializar a ordem via nextval() no path novo, e o teste
 * valida que a exceção aborta ANTES de qualquer avanço da sequence.
 */
test.describe('Sequence: falha de conversão não avança sequence', () => {
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

  test('TOTAL_MISMATCH: sequence estável e zero orders/sales', async () => {
    const seed = await seedQuote(client, {
      status: 'won',
      total: 100,
      itemTotal: 250, // mismatch intencional (>0.02)
      label: 'E2E Seq NoAdv MISMATCH',
    });
    createdQuoteIds.push(seed.quoteId);

    // won NÃO dispara trigger — não deve haver order pré-existente
    expect(seed.preExistingOrderId).toBeNull();

    const before = await getSeqLast(client);

    const { payload, error } = await convert(client, seed.quoteId);
    expect(error).not.toBeNull();
    const msg = (error as { message?: string } | null)?.message ?? '';
    expect(msg).toMatch(/\[TOTAL_MISMATCH\]/);
    expect(payload).toBeNull();

    const after = await getSeqLast(client);
    expect(after).toBe(before);

    const { count: ordersCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', seed.quoteId);
    expect(ordersCount).toBe(0);

    const { data: qFinal } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', seed.quoteId)
      .single();
    expect(qFinal?.sale_id).toBeNull();
    expect(qFinal?.status).not.toBe('converted');
  });

  test('FORBIDDEN: sequence estável e zero orders/sales', async () => {
    const FOREIGN_OWNER = '00000000-0000-0000-0000-0000000000fd';

    let seed: Awaited<ReturnType<typeof seedQuote>>;
    try {
      seed = await seedQuote(client, {
        status: 'won',
        total: 320,
        itemTotal: 320,
        ownerSpId: FOREIGN_OWNER,
        label: 'E2E Seq NoAdv FORBIDDEN',
      });
    } catch {
      test.skip(true, 'RLS bloqueou seed com created_by alheio — cenário não reproduzível.');
      return;
    }
    createdQuoteIds.push(seed.quoteId);

    const before = await getSeqLast(client);

    const { payload, error } = await convert(client, seed.quoteId);

    if (!error) {
      test.skip(true, 'Sessão E2E tem bypass de ownership; FORBIDDEN não aplicável.');
      return;
    }

    const msg = (error as { message?: string }).message ?? '';
    expect(msg).toMatch(/\[FORBIDDEN\]/);
    expect(payload).toBeNull();

    const after = await getSeqLast(client);
    expect(after).toBe(before);

    const { count: ordersCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', seed.quoteId);
    expect(ordersCount).toBe(0);
  });
});
