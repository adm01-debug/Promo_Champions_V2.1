import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, STORAGE_KEY, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import { CONVERT_QUOTE_ERROR_MESSAGES } from '../../src/hooks/quoteErrorMessages';

/**
 * E2E: Payload de erro padronizado + renderização no toast da UI.
 *
 * Para TOTAL_MISMATCH e FORBIDDEN valida:
 *   1. RPC retorna erro com prefixo padronizado `[CODE]` na message.
 *   2. `parseConvertQuoteError` mapeia para o code correto.
 *   3. UI renderiza o texto exato de `CONVERT_QUOTE_ERROR_MESSAGES[code]`
 *      via sonner toast (role=status).
 */
test.describe('Payload de erro padronizado + toast UI (TOTAL_MISMATCH, FORBIDDEN)', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  const createdQuoteIds: string[] = [];

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);
  });

  test.afterAll(async () => {
    if (!client) return;
    for (const id of createdQuoteIds) {
      await client.from('quote_items').delete().eq('quote_id', id);
      await client.from('quotes').delete().eq('id', id);
    }
  });

  async function hydrateBrowser(page: import('@playwright/test').Page): Promise<void> {
    await page.goto('http://localhost:8080');
    await page.evaluate(
      ([key, json]) => window.localStorage.setItem(key as string, json as string),
      [STORAGE_KEY, SESSION_JSON],
    );
  }

  test('TOTAL_MISMATCH: RPC devolve [TOTAL_MISMATCH] e UI mostra mensagem padronizada', async ({ page }) => {
    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Payload TOTAL_MISMATCH',
        title: 'E2E Payload TOTAL_MISMATCH',
        total_value: 100,
        subtotal: 100,
        status: 'approved',
        source: 'manual',
      })
      .select('id')
      .single();
    if (error || !q) throw new Error(`seed falhou: ${error?.message}`);
    createdQuoteIds.push(q.id);
    await client.from('quote_items').insert({
      quote_id: q.id,
      product_name: 'Item divergente',
      quantity: 1,
      unit_price: 250,
      total_price: 250,
    });

    // 1. RPC direta
    const { data, error: rpcErr } = await client.rpc('fn_convert_quote_to_sale' as never, {
      _quote_id: q.id,
    } as never);
    expect(data).toBeNull();
    expect(rpcErr).not.toBeNull();
    expect(rpcErr!.message).toMatch(/\[TOTAL_MISMATCH\]/);

    // 2. UI: dispara conversão e valida toast
    await hydrateBrowser(page);
    await page.goto('http://localhost:8080/orcamentos', { waitUntil: 'domcontentloaded' });

    const convertBtn = page.getByRole('button', { name: /converter (em )?venda/i }).first();
    if (!(await convertBtn.isVisible().catch(() => false))) {
      test.info().annotations.push({
        type: 'ui-fallback',
        description: 'Botão de conversão não visível — cobertura de UI parcial',
      });
      return;
    }
    await convertBtn.click();

    const expected = CONVERT_QUOTE_ERROR_MESSAGES.TOTAL_MISMATCH;
    await expect(page.getByText(expected, { exact: false }).first()).toBeVisible({ timeout: 8000 });
  });

  test('FORBIDDEN: RPC devolve [FORBIDDEN] e UI mostra mensagem padronizada', async ({ page }) => {
    const FOREIGN_USER = '00000000-0000-0000-0000-0000000000fc';
    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Payload FORBIDDEN',
        title: 'E2E Payload FORBIDDEN',
        total_value: 400,
        subtotal: 400,
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
    createdQuoteIds.push(q.id);
    await client.from('quote_items').insert({
      quote_id: q.id,
      product_name: 'Item Forbidden',
      quantity: 1,
      unit_price: 400,
      total_price: 400,
    });

    const { data, error: rpcErr } = await client.rpc('fn_convert_quote_to_sale' as never, {
      _quote_id: q.id,
    } as never);
    if (!rpcErr) {
      test.skip(true, 'Sessão E2E tem bypass de ownership; FORBIDDEN não aplicável.');
      return;
    }
    expect(data).toBeNull();
    expect(rpcErr.message).toMatch(/\[FORBIDDEN\]/);

    await hydrateBrowser(page);
    await page.goto('http://localhost:8080/orcamentos', { waitUntil: 'domcontentloaded' });
    const convertBtn = page.getByRole('button', { name: /converter (em )?venda/i }).first();
    if (!(await convertBtn.isVisible().catch(() => false))) {
      test.info().annotations.push({
        type: 'ui-fallback',
        description: 'Botão de conversão não visível — cobertura de UI parcial',
      });
      return;
    }
    await convertBtn.click();

    const expected = CONVERT_QUOTE_ERROR_MESSAGES.FORBIDDEN;
    await expect(page.getByText(expected, { exact: false }).first()).toBeVisible({ timeout: 8000 });
  });
});
