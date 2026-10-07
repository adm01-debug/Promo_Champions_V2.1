import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  HAS_AUTH,
  SESSION_JSON,
  STORAGE_KEY,
  SUPABASE_ANON,
  SUPABASE_URL,
  skipReason,
} from './helpers/auth';
import { CONVERT_QUOTE_ERROR_MESSAGES } from '../../src/hooks/quoteErrorMessages';
import { cleanupQuote } from './helpers/quote-to-sale-helpers';

/**
 * E2E: Frontend deve renderizar EXATAMENTE a mensagem PT-BR mapeada para
 * o código [TOTAL_MISMATCH] quando a RPC `fn_convert_quote_to_sale` falha
 * porque `total_value` diverge da soma dos `quote_items`.
 *
 * Também valida que nenhum `sales` é criado e o `status` do quote não muda.
 */
test.describe('UI: mensagem padronizada para [TOTAL_MISMATCH]', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  let quoteId: string;
  const EXPECTED_MESSAGE = CONVERT_QUOTE_ERROR_MESSAGES.TOTAL_MISMATCH;

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

    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E UI TotalMismatch',
        title: 'E2E UI Total Mismatch',
        total_value: 100,
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
      product_name: 'Item divergente UI',
      quantity: 1,
      unit_price: 500,
      total_price: 500, // 500 vs total 100 → TOTAL_MISMATCH
    });
  });

  test.afterAll(async () => {
    if (!client || !quoteId) return;
    await cleanupQuote(client, quoteId, { clientNames: ['E2E UI TotalMismatch'] });
  });

  test('exibe toast PT-BR mapeado para TOTAL_MISMATCH e não cria sale', async ({
    page,
    context,
    checkpoint,
    waitForNetworkIdle,
  }) => {
    await context.addInitScript(([key, json]) => window.localStorage.setItem(key, json), [
      STORAGE_KEY,
      SESSION_JSON,
    ] as const);

    await page.goto('/orcamentos', { waitUntil: 'domcontentloaded' });
    await waitForNetworkIdle();

    const quoteCard = page.getByText('E2E UI Total Mismatch').first();
    await quoteCard.waitFor({ state: 'visible', timeout: 15_000 });

    // O card não é clicável: o dialog abre pelo botão "Detalhes".
    const card = quoteCard.locator(
      'xpath=ancestor::div[.//button[contains(normalize-space(.), "Detalhes")]][1]'
    );
    await card.getByRole('button', { name: /Detalhes/i }).click();

    const convertBtn = page.getByRole('button', { name: /Converter em venda/i });
    await expect(convertBtn).toBeVisible();
    await checkpoint('antes-conversao');

    await convertBtn.click();

    // Toast do sonner com a mensagem exata mapeada por CONVERT_QUOTE_ERROR_MESSAGES.TOTAL_MISMATCH
    await expect(page.getByText(EXPECTED_MESSAGE, { exact: true }).first()).toBeVisible({
      timeout: 10_000,
    });
    await waitForNetworkIdle();
    await checkpoint('depois-conversao');

    // Confirma DB intacto
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
