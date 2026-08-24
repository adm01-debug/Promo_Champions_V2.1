import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import {
  ORDER_NUMBER_REGEX,
  cleanupQuote,
  seedQuote,
} from './helpers/quote-to-sale-helpers';

/**
 * E2E: Race real trigger vs RPC — cenário production-like.
 *
 * Estado inicial: quote 'draft' (sem trigger disparado).
 * Corrida: UPDATE→approved (dispara trg_convert_quote_to_order) em paralelo
 * com fn_convert_quote_to_sale. Ambos criam order; a suíte precisa terminar
 * com exatamente 1 order + 1 sale independente de quem vence a corrida.
 */
test.describe('Race trigger×RPC no mesmo quote', () => {
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

    // Semear em approved para que a RPC seja aceita, mas o trigger já
    // deixa a order pré-existente. A "corrida" real acontece na 2ª fase
    // via bump para 'approved' de novo + convert em paralelo.
    const seed = await seedQuote(client, {
      status: 'approved',
      total: 777,
      label: 'E2E Race Trigger vs RPC',
    });
    quoteId = seed.quoteId;
  });

  test.afterAll(async () => {
    await cleanupQuote(client, quoteId, { strict: true });
  });

  test('UPDATE→approved paralelo com fn_convert produz 1 order + 1 sale', async () => {
    const rpc = client.rpc('fn_convert_quote_to_sale' as never, {
      _quote_id: quoteId,
    } as never);
    // Reforça o status para tentar (re)disparar o trigger em paralelo
    const upd = client.from('quotes').update({ status: 'approved' }).eq('id', quoteId);

    const [rRpc, rUpd] = await Promise.all([rpc, upd]);
    expect(rRpc.error).toBeNull();
    expect(rUpd.error).toBeNull();

    const payload = rRpc.data as { order_id: string; order_number: string };
    expect(payload.order_number).toMatch(ORDER_NUMBER_REGEX);

    // Invariantes pós-corrida
    const { data: orders } = await client
      .from('orders')
      .select('id, order_number')
      .eq('quote_id', quoteId);
    expect(orders?.length).toBe(1);
    expect(orders![0].id).toBe(payload.order_id);

    const { data: qFinal } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(qFinal?.status).toBe('converted');
    expect(qFinal?.sale_id).toBeTruthy();

    const { count: salesCount } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('id', qFinal!.sale_id!);
    expect(salesCount).toBe(1);

    const { count: dup } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_number', payload.order_number);
    expect(dup).toBe(1);
  });
});
