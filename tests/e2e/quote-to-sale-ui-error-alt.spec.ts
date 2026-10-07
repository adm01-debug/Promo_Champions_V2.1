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
 * E2E: aprovar o orçamento pelo botão "Aprovar" do card e só então
 * converter via dialog — deve exibir a mesma mensagem PT-BR mapeada
 * para o código [TOTAL_MISMATCH].
 *
 * O que esta spec cobre de diferente da spec primária é o caminho até a
 * conversão: a transição de status no card dispara o trigger
 * convert_quote_to_order (documentado na asserção orderCount=1 e na
 * limpeza do afterAll). O tratamento de erro em si é o mesmo do dialog —
 * não existe um handler alternativo a ser exercitado aqui.
 */
test.describe('UI alternativa: TOTAL_MISMATCH via ação do card', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  let quoteId: string;
  const EXPECTED = CONVERT_QUOTE_ERROR_MESSAGES.TOTAL_MISMATCH;

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
        client_name: 'E2E UI Alt TotalMismatch',
        title: 'E2E UI Alt Total Mismatch',
        total_value: 90,
        subtotal: 90,
        status: 'sent',
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
    await cleanupQuote(client, quoteId, { clientNames: ['E2E UI Alt TotalMismatch'] });
  });

  test('fluxo alternativo exibe toast padronizado de TOTAL_MISMATCH', async ({
    page,
    context,
  }) => {
    // Intercepta toasts do sonner para garantir que o texto exato foi emitido
    // (fallback resiliente caso o menu alternativo esteja atrás de outro
    // trigger visual).
    const toasts: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().startsWith('[toast]'))
        toasts.push(msg.text());
    });

    await context.addInitScript(([key, json]) => window.localStorage.setItem(key, json), [
      STORAGE_KEY,
      SESSION_JSON,
    ] as const);

    await page.goto('/orcamentos', { waitUntil: 'domcontentloaded' });

    const row = page.getByText('E2E UI Alt Total Mismatch').first();
    await row.waitFor({ state: 'visible', timeout: 15_000 });

    // Fluxo alternativo real do card: aprova a quote 'sent' pelo botão do
    // card e só depois abre o dialog (via "Detalhes") para converter.
    const card = row.locator(
      'xpath=ancestor::div[.//button[contains(normalize-space(.), "Detalhes")]][1]'
    );

    await card.getByRole('button', { name: /^Aprovar$/i }).click();
    // Aguarda a transição de status concluir (botão some do card).
    await expect(card.getByRole('button', { name: /^Aprovar$/i })).toHaveCount(0, {
      timeout: 15_000,
    });

    await card.getByRole('button', { name: /Detalhes/i }).click();
    const convertBtn = page.getByRole('button', { name: /Converter em venda/i });
    await expect(convertBtn).toBeVisible();
    await convertBtn.click();

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

    // Efeito colateral documentado: aprovar dispara convert_quote_to_order,
    // que cria o pedido mesmo quando a conversão falha depois (limpo no
    // afterAll). A asserção evita esconder mudanças nesse comportamento.
    const { count: orderCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(orderCount).toBe(1);
  });
});
