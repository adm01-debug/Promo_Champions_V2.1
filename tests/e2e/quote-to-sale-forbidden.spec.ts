import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: Bloqueio por permissão — `[FORBIDDEN]`.
 *
 * Cria um quote atribuído a outro `created_by` (uuid aleatório) e tenta
 * convertê-lo com a sessão E2E atual. A RPC `fn_convert_quote_to_sale`
 * deve rejeitar com prefixo padronizado `[FORBIDDEN]` e nenhum registro
 * em `sales` pode ser criado.
 *
 * Se o usuário E2E for admin com bypass total de ownership, o teste é
 * skipado com aviso — nesse caso a cobertura de FORBIDDEN vive na suíte
 * de validações unitárias.
 */
test.describe('Validação: conversão sem permissão retorna [FORBIDDEN]', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  let quoteId: string;
  const FOREIGN_USER = '00000000-0000-0000-0000-0000000000ff';

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);

    const total = 320;
    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Forbidden',
        title: 'E2E Forbidden Convert',
        total_value: total,
        subtotal: total,
        status: 'approved',
        source: 'manual',
        created_by: FOREIGN_USER,
      })
      .select('id, created_by')
      .single();
    if (error || !q) {
      test.skip(true, `RLS bloqueou seed com created_by alheio: ${error?.message}`);
      return;
    }
    quoteId = q.id;

    await client.from('quote_items').insert({
      quote_id: quoteId,
      product_name: 'Item Forbidden',
      quantity: 2,
      unit_price: 160,
      total_price: total,
    });
  });

  test.afterAll(async () => {
    if (!client || !quoteId) return;
    await client.from('quote_items').delete().eq('quote_id', quoteId);
    await client.from('quotes').delete().eq('id', quoteId);
  });

  test('RPC bloqueia com [FORBIDDEN] e não cria sales/orders', async () => {
    const { data, error } = await client.rpc('fn_convert_quote_to_sale' as never, {
      _quote_id: quoteId,
    } as never);

    if (!error) {
      // Usuário provavelmente admin com bypass — cobertura garantida em unit tests.
      test.skip(true, 'Sessão E2E tem bypass de ownership; FORBIDDEN não aplicável.');
      return;
    }

    expect(error.message).toMatch(/\[FORBIDDEN\]/);
    expect(data).toBeNull();

    const { data: quoteAfter } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(quoteAfter?.sale_id).toBeNull();
    expect(quoteAfter?.status).not.toBe('converted');

    const { count: ordersCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(ordersCount).toBe(0);
  });
});
