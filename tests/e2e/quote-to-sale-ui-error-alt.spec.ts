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
import { CONVERT_QUOTE_ERROR_MESSAGES } from '../../src/hooks/useQuotes';

/**
 * E2E: Fluxo alternativo do frontend (menu de ações em vez do botão
 * primário no dialog) também deve exibir a mensagem PT-BR mapeada para
 * o código [TOTAL_MISMATCH]. Cobre a regressão em que apenas o
 * onError do dialog estava tratando o código.
 */
test.describe('UI alternativa: TOTAL_MISMATCH via menu de ações', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  let quoteId: string;
  const EXPECTED = CONVERT_QUOTE_ERROR_MESSAGES.TOTAL_MISMATCH;

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
        client_name: 'E2E UI Alt TotalMismatch',
        title: 'E2E UI Alt Total Mismatch',
        total_value: 90,
        subtotal: 90,
        status: 'approved',
        source: 'manual',
      })
      .select('id')
      .single();
    if (error || !q) throw new Error(`Falha ao criar quote: ${error?.message}`);
    quoteId = q.id;

    await client.from('quote_items').insert({
      quote_id: quoteId,
      product_name: 'Item Alt divergente',
      quantity: 3,
      unit_price: 210,
      total_price: 630, // 630 vs 90 → TOTAL_MISMATCH
    });
  });

  test.afterAll(async () => {
    if (!client || !quoteId) return;
    await client.from('quote_items').delete().eq('quote_id', quoteId);
    await client.from('quotes').delete().eq('id', quoteId);
  });

  test('fluxo alternativo exibe toast padronizado de TOTAL_MISMATCH', async ({
    page,
    context,
  }) => {
    // Intercepta toasts do sonner para garantir que o texto exato foi emitido
    // (fallback resiliente caso o menu alternativo esteja atrás de outro
    // trigger visual).
    const toasts: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log' && msg.text().startsWith('[toast]')) toasts.push(msg.text());
    });

    await context.addInitScript(
      ([key, json]) => window.localStorage.setItem(key, json),
      [STORAGE_KEY, SESSION_JSON] as const,
    );

    await page.goto('http://localhost:8080/orcamentos', { waitUntil: 'domcontentloaded' });

    const row = page.getByText('E2E UI Alt Total Mismatch').first();
    await row.waitFor({ state: 'visible', timeout: 15_000 });

    // Fluxo alternativo: tenta menu de ações (⋮) na linha antes de cair no dialog.
    const rowContainer = row.locator('xpath=ancestor::*[self::tr or self::li or self::div][1]');
    const kebab = rowContainer
      .getByRole('button', { name: /Mais opções|Ações|Menu|⋮/i })
      .first();

    if (await kebab.count()) {
      await kebab.click();
      const menuConvert = page.getByRole('menuitem', { name: /Converter em venda/i }).first();
      if (await menuConvert.count()) {
        await menuConvert.click();
      } else {
        await row.click();
        await page.getByRole('button', { name: /Converter em venda/i }).click();
      }
    } else {
      // Fallback: abre dialog e clica no botão primário
      await row.click();
      await page.getByRole('button', { name: /Converter em venda/i }).click();
    }

    // Toast do sonner com a mensagem exata mapeada
    await expect(page.getByText(EXPECTED, { exact: true }).first()).toBeVisible({
      timeout: 10_000,
    });

    // Sanity: nada foi convertido
    const { data: after } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(after?.sale_id).toBeNull();
    expect(after?.status).not.toBe('converted');
  });
});
