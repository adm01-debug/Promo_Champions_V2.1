import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  HAS_AUTH,
  SESSION_JSON,
  STORAGE_KEY,
  SUPABASE_ANON,
  SUPABASE_URL,
  skipReason,
} from './helpers/auth';
import { CONVERT_QUOTE_ERROR_MESSAGES } from '../../src/hooks/useQuotes';

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
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
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
    await client.from('quote_items').delete().eq('quote_id', quoteId);
    await client.from('quotes').delete().eq('id', quoteId);
  });

  test('exibe toast PT-BR mapeado para TOTAL_MISMATCH e não cria sale', async ({
    page,
    context,
  }) => {
    await context.addInitScript(
      ([key, json]) => window.localStorage.setItem(key, json),
      [STORAGE_KEY, SESSION_JSON] as const,
    );

    await page.goto('http://localhost:8080/orcamentos', { waitUntil: 'domcontentloaded' });

    const quoteCard = page.getByText('E2E UI Total Mismatch').first();
    await quoteCard.waitFor({ state: 'visible', timeout: 15_000 });
    await quoteCard.click();

    const convertBtn = page.getByRole('button', { name: /Converter em venda/i });
    await expect(convertBtn).toBeVisible();
    await convertBtn.click();

    // Toast do sonner com a mensagem exata mapeada por CONVERT_QUOTE_ERROR_MESSAGES.TOTAL_MISMATCH
    await expect(page.getByText(EXPECTED_MESSAGE, { exact: true }).first()).toBeVisible({
      timeout: 10_000,
    });

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
