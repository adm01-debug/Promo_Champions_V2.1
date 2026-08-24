import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: Bloqueio de conversão quando `total_value` diverge da soma dos itens.
 *
 * Semeia um orçamento com total_value=100 mas item somando 250, chama a RPC
 * e valida que o erro é padronizado como `[TOTAL_MISMATCH]`, sem criar sale.
 */
test.describe('Validação: total_value divergente da soma dos itens', () => {
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

    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Total Mismatch',
        title: 'E2E Invalid Total',
        total_value: 100, // divergente proposital
        subtotal: 100,
        status: 'approved',
        source: 'manual',
      })
      .select('id')
      .single();
    if (error || !q) throw new Error(`Falha ao criar quote: ${error?.message}`);
    quoteId = q.id;

    await client.from('quote_items').insert({
      quote_id: quoteId,
      product_name: 'Item divergente',
      quantity: 1,
      unit_price: 250,
      total_price: 250, // soma 250 vs total 100
    });
  });

  test.afterAll(async () => {
    if (!client || !quoteId) return;
    const { data: orders } = await client.from('orders').select('id').eq('quote_id', quoteId);
    for (const o of orders ?? []) await client.from('orders').delete().eq('id', o.id);
    const { data: q } = await client.from('quotes').select('sale_id').eq('id', quoteId).maybeSingle();
    if (q?.sale_id) await client.from('sales').delete().eq('id', q.sale_id);
    await client.from('quote_items').delete().eq('quote_id', quoteId);
    await client.from('quotes').delete().eq('id', quoteId);
  });

  test('RPC bloqueia conversão com código [TOTAL_MISMATCH]', async () => {
    const { data, error } = await client.rpc('fn_convert_quote_to_sale' as never, {
      _quote_id: quoteId,
    } as never);

    // A RPC deve levantar exceção com prefixo padronizado.
    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/\[TOTAL_MISMATCH\]/);
    expect(data).toBeNull();

    // Nenhuma sale criada
    const { data: quoteAfter } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(quoteAfter?.sale_id).toBeNull();
    expect(quoteAfter?.status).not.toBe('converted');
  });
});
