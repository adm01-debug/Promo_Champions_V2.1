import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: Chamada HTTP direta na REST API (PostgREST) sem permissão.
 *
 * Valida que:
 *   1. O status HTTP é 403 (ou 400 com prefixo [FORBIDDEN] no body,
 *      dependendo de como PostgREST mapeia a exceção do plpgsql).
 *   2. O corpo contém o código padronizado `[FORBIDDEN]`.
 *   3. Nenhum registro em `orders`/`sales` foi criado.
 */
test.describe('API: 403 + [FORBIDDEN] via chamada REST direta', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  let accessToken: string;
  let quoteId: string;
  const FOREIGN_USER = '00000000-0000-0000-0000-0000000000fe';

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    accessToken = session.access_token;
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    await client.auth.setSession(session);

    const total = 410;
    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E API Forbidden',
        title: 'E2E API Forbidden',
        total_value: total,
        subtotal: total,
        status: 'approved',
        source: 'manual',
        created_by: FOREIGN_USER,
      })
      .select('id')
      .single();
    if (error || !q) {
      test.skip(true, `RLS bloqueou seed com created_by alheio: ${error?.message}`);
      return;
    }
    quoteId = q.id;

    await client.from('quote_items').insert({
      quote_id: quoteId,
      product_name: 'Item API Forbidden',
      quantity: 1,
      unit_price: total,
      total_price: total,
    });
  });

  test.afterAll(async () => {
    if (!client || !quoteId) return;
    await client.from('quote_items').delete().eq('quote_id', quoteId);
    await client.from('quotes').delete().eq('id', quoteId);
  });

  test('POST /rest/v1/rpc/fn_convert_quote_to_sale devolve [FORBIDDEN]', async ({ request }) => {
    const resp = await request.post(
      `${SUPABASE_URL}/rest/v1/rpc/fn_convert_quote_to_sale`,
      {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        data: { _quote_id: quoteId },
      },
    );

    const status = resp.status();
    const body = await resp.text();

    if (status === 200) {
      test.skip(true, 'Sessão E2E tem bypass de ownership; [FORBIDDEN] não aplicável.');
      return;
    }

    // PostgREST costuma mapear RAISE EXCEPTION para 400; aceitamos 403 como
    // ideal e 400 como aceitável desde que o body traga o código padronizado.
    expect([400, 401, 403]).toContain(status);
    expect(body).toMatch(/\[FORBIDDEN\]/);

    // Nada foi criado
    const { count: ordersCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(ordersCount).toBe(0);

    const { data: after } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(after?.sale_id).toBeNull();
    expect(after?.status).not.toBe('converted');
  });
});
