import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * E2E: Aprovação de orçamento → Converter em venda.
 * Valida:
 *   1. Botão "Converter em venda" aparece quando status = approved e sem sale_id.
 *   2. Clique cria 1 registro em `sales` e 1 em `orders` vinculados ao quote.
 *   3. Segunda invocação da RPC é idempotente (não cria segunda venda/pedido).
 *   4. UI atualiza mostrando badge "Convertido em venda".
 *
 * Requer sessão Supabase injetada (LOVABLE_BROWSER_AUTH_STATUS=injected).
 * Skip gracioso se ausente para não quebrar CI sem auth.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON ?? '';
const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY ?? '';

const HAS_AUTH = Boolean(SUPABASE_URL && SUPABASE_ANON && SESSION_JSON && STORAGE_KEY);

test.describe('Fluxo: aprovar orçamento e converter em venda', () => {
  test.skip(!HAS_AUTH, 'Sessão Supabase gerenciada não injetada; pulando E2E autenticado.');

  let client: SupabaseClient;
  let quoteId: string;

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as {
      access_token: string;
      refresh_token: string;
    };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);

    // Seed: orçamento aprovado com 1 item, total consistente.
    const total = 250.0;
    const { data: quote, error: qErr } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Cliente Convert',
        title: 'E2E Orçamento Convert',
        total_value: total,
        subtotal: total,
        status: 'approved',
        source: 'manual',
      })
      .select('id')
      .single();
    if (qErr || !quote) throw new Error(`Falha ao criar quote: ${qErr?.message}`);
    quoteId = quote.id;

    const { error: iErr } = await client.from('quote_items').insert({
      quote_id: quoteId,
      product_name: 'Brinde E2E',
      quantity: 2,
      unit_price: 125.0,
      total_price: total,
    });
    if (iErr) throw new Error(`Falha ao criar quote_items: ${iErr.message}`);
  });

  test.afterAll(async () => {
    if (!client || !quoteId) return;
    // Cleanup em cascata; orders/order_items são apagados via FK CASCADE ao remover a order.
    const { data: order } = await client
      .from('orders')
      .select('id')
      .eq('quote_id', quoteId)
      .maybeSingle();
    if (order?.id) await client.from('orders').delete().eq('id', order.id);

    const { data: quote } = await client
      .from('quotes')
      .select('sale_id')
      .eq('id', quoteId)
      .maybeSingle();
    if (quote?.sale_id) await client.from('sales').delete().eq('id', quote.sale_id);

    await client.from('quote_items').delete().eq('quote_id', quoteId);
    await client.from('quotes').delete().eq('id', quoteId);
  });

  test('converte via UI e é idempotente na segunda chamada', async ({ page, context }) => {
    // Restaura sessão no browser
    await context.addInitScript(
      ([key, json]) => {
        window.localStorage.setItem(key, json);
      },
      [STORAGE_KEY, SESSION_JSON] as const,
    );

    await page.goto('http://localhost:8080/orcamentos', { waitUntil: 'domcontentloaded' });

    // Localiza o card do orçamento e abre o detalhe
    const quoteCard = page.getByText('E2E Orçamento Convert').first();
    await quoteCard.waitFor({ state: 'visible', timeout: 15_000 });
    await quoteCard.click();

    // Botão visível e conversão
    const convertBtn = page.getByRole('button', { name: /Converter em venda/i });
    await expect(convertBtn).toBeVisible();
    await convertBtn.click();

    // Aguarda toast de sucesso
    await expect(page.getByText(/Convertido em venda|Pedido ORC-/i).first())
      .toBeVisible({ timeout: 10_000 });

    // Valida no banco: exatamente 1 sale e 1 order
    const { data: quoteAfter } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(quoteAfter?.sale_id).toBeTruthy();
    expect(quoteAfter?.status).toBe('converted');

    const { count: salesCount } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('id', quoteAfter!.sale_id!);
    expect(salesCount).toBe(1);

    const { data: orders } = await client
      .from('orders')
      .select('id, order_number')
      .eq('quote_id', quoteId);
    expect(orders?.length).toBe(1);
    expect(orders?.[0].order_number).toMatch(/^ORC-\d{8}-[A-F0-9]{6}$/);

    // Idempotência: nova chamada direta na RPC não duplica
    const first = orders![0].id;
    const { data: retry, error: retryErr } = await client.rpc(
      'fn_convert_quote_to_sale' as never,
      { _quote_id: quoteId } as never,
    );
    expect(retryErr).toBeNull();
    expect((retry as { idempotent: boolean; order_id: string }).idempotent).toBe(true);
    expect((retry as { order_id: string }).order_id).toBe(first);

    const { count: ordersCountAfter } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(ordersCountAfter).toBe(1);
  });
});
