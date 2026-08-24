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
 * E2E: Duas chamadas SEQUENCIAIS da RPC no mesmo quote — sem concorrência.
 *
 * Valida idempotência determinística: o segundo call retorna EXATAMENTE
 * o mesmo `order_id` e `order_number` da primeira conversão, com
 * `idempotent: true`, e nenhum registro adicional é criado.
 *
 * Cobre regressão do BUG#1 (branch idempotente devolvia order_number NULL).
 */
test.describe('Idempotência sequencial: 2 conversões seguidas do mesmo quote', () => {
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
      total: 555,
      itemTotal: 555,
      label: 'E2E Idem Sequencial',
    });
    quoteId = seed.quoteId;
  });

  test.afterAll(async () => {
    await cleanupQuote(client, quoteId);
  });

  test('2 RPCs sequenciais devolvem mesmo order_id/order_number sem duplicar', async ({
    checkpoint,
  }) => {
    await checkpoint('antes-conversao');

    const { payload: p1, error: e1 } = await convert(client, quoteId);
    expect(e1).toBeNull();
    expect(p1).not.toBeNull();
    expect(p1!.order_id).toBeTruthy();
    expect(p1!.order_number).toMatch(ORDER_NUMBER_REGEX);

    const { payload: p2, error: e2 } = await convert(client, quoteId);
    expect(e2).toBeNull();
    expect(p2).not.toBeNull();

    // Regressão BUG#1: order_number NÃO pode ser null/undefined no branch idempotente
    expect(p2!.order_id).toBe(p1!.order_id);
    expect(p2!.order_number).toBe(p1!.order_number);
    expect(p2!.order_number).toMatch(ORDER_NUMBER_REGEX);
    expect(p2!.idempotent).toBe(true);

    const { data: orders } = await client
      .from('orders')
      .select('id, order_number')
      .eq('quote_id', quoteId);
    expect(orders?.length).toBe(1);

    const { count: dupOrderNumber } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_number', p1!.order_number);
    expect(dupOrderNumber).toBe(1);

    const { count: salesCount } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(salesCount).toBe(1);

    await checkpoint('depois-conversao');
  });
});
