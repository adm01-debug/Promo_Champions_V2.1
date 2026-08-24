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
 * E2E: 5 chamadas simultâneas de `fn_convert_quote_to_sale` sobre o mesmo
 * orçamento. Verifica que:
 *   1. Nenhuma chamada falha (erro nulo em todas).
 *   2. Todas retornam o MESMO order_id e MESMO order_number.
 *   3. Pelo menos 4 chamadas retornam `idempotent: true` (só 1 cria/consolida).
 *   4. Existe exatamente 1 `orders` e 1 `sales` no banco.
 *   5. `order_number` casa com `ORDER_NUMBER_REGEX` (aceita PED-* do trigger
 *      legado E ORC- do path novo).
 *   6. Se o trigger criou order pré-existente (status='approved'), a
 *      sequence NÃO avança. Caso contrário (path novo), avança exatamente +1.
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

    const seed = await seedQuote(client, {
      status: 'approved',
      total: 750,
      label: 'E2E Concorrência x5',
    });
    quoteId = seed.quoteId;
  });

  test.afterAll(async () => {
    await cleanupQuote(client, quoteId);
  });

  test('5 RPCs em paralelo produzem 1 order + 1 sale sem colisão', async () => {
    const call = () =>
      client.rpc('fn_convert_quote_to_sale' as never, { _quote_id: quoteId } as never);

    const seqBefore = await getSeqLast(client);

    const results = await Promise.all(Array.from({ length: N }, call));

    for (const r of results) expect(r.error).toBeNull();

    const payloads = results.map((r) => r.data as ConversionPayload);

    // Convergência total
    const firstOrderId = payloads[0].order_id;
    const firstOrderNumber = payloads[0].order_number;
    for (const p of payloads) {
      expect(p.order_id).toBe(firstOrderId);
      expect(p.order_number).toBe(firstOrderNumber);
    }
    expect(firstOrderNumber).toMatch(ORDER_NUMBER_REGEX);

    // Somente 1 conversão real; N-1 idempotentes
    const idempotentCount = payloads.filter((p) => p.idempotent).length;
    expect(idempotentCount).toBeGreaterThanOrEqual(N - 1);

    // Sequence: só avança quando o path novo (ORC-*) foi exercitado
    const seqAfter = await getSeqLast(client);
    const wasReused = payloads.some((p) => p.reused_order === true);
    if (wasReused || firstOrderNumber.startsWith('PED-')) {
      expect(seqAfter).toBe(seqBefore);
    } else {
      expect(seqAfter).toBe(seqBefore + 1);
    }

    // Banco: 1 order, 1 sale, order_number único
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
