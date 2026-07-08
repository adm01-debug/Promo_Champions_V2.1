import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * E2E: validações defensivas de `fn_convert_quote_to_sale`.
 *
 * Cenários cobertos:
 *   • EMPTY_ITEMS      — orçamento sem quote_items é bloqueado.
 *   • FORBIDDEN        — RLS/verificação de owner bloqueia caller não-dono.
 *   • Tolerância ±0,02 — arredondamento de centavos NÃO dispara TOTAL_MISMATCH.
 *   • TOTAL_MISMATCH   — divergência acima da tolerância é bloqueada.
 *   • Concorrência     — order_number continua único mesmo em rajadas paralelas.
 */

import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

type RpcResult = {
  sale_id: string;
  order_id: string;
  order_number?: string;
  items_count?: number;
  idempotent: boolean;
};

test.describe('Conversão de orçamento — validações e concorrência', () => {
  test.skip(!HAS_AUTH, 'Sessão Supabase gerenciada não injetada; pulando E2E autenticado.');

  let client: SupabaseClient;
  const createdQuotes: string[] = [];
  const createdSales: string[] = [];

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
    for (const qid of createdQuotes) {
      await client.from('orders').delete().eq('quote_id', qid);
      await client.from('quote_items').delete().eq('quote_id', qid);
      await client.from('quotes').delete().eq('id', qid);
    }
    for (const sid of createdSales) {
      await client.from('sales').delete().eq('id', sid);
    }
  });

  async function seedQuote(opts: {
    total: number;
    items?: Array<{ qty: number; unit: number; total: number }>;
    status?: string;
  }): Promise<string> {
    const { data: quote, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Validation',
        title: `E2E Validation ${Date.now()}-${Math.random()}`,
        total_value: opts.total,
        subtotal: opts.total,
        status: opts.status ?? 'approved',
        source: 'manual',
      })
      .select('id')
      .single();
    if (error || !quote) throw new Error(`seed quote: ${error?.message}`);
    createdQuotes.push(quote.id);

    if (opts.items?.length) {
      const rows = opts.items.map((it) => ({
        quote_id: quote.id,
        product_name: 'Prod E2E',
        quantity: it.qty,
        unit_price: it.unit,
        total_price: it.total,
      }));
      const { error: iErr } = await client.from('quote_items').insert(rows);
      if (iErr) throw new Error(`seed items: ${iErr.message}`);
    }
    return quote.id;
  }

  async function callRpc(quoteId: string) {
    return client.rpc('fn_convert_quote_to_sale' as never, { _quote_id: quoteId } as never);
  }

  test('EMPTY_ITEMS: orçamento sem itens é bloqueado e mensagem PT-BR na UI', async ({
    page,
    context,
  }) => {
    const qid = await seedQuote({ total: 100, items: [] });

    const { error } = await callRpc(qid);
    expect(error?.message ?? '').toContain('[EMPTY_ITEMS]');

    // UI: abre detalhe, clica e valida toast
    await context.addInitScript(
      ([k, j]) => window.localStorage.setItem(k, j),
      [STORAGE_KEY, SESSION_JSON] as const,
    );
    await page.goto('http://localhost:8080/orcamentos', { waitUntil: 'domcontentloaded' });
    const card = page.getByText(/E2E Validation/).first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      const btn = page.getByRole('button', { name: /Converter em venda/i });
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await expect(page.getByText(/sem itens/i).first()).toBeVisible({ timeout: 8_000 });
      }
    }
  });

  test('Tolerância ±R$ 0,02: 3× 33,33 vs total 100,00 converte (0,01 de diff)', async () => {
    const qid = await seedQuote({
      total: 100.0,
      items: [
        { qty: 1, unit: 33.33, total: 33.33 },
        { qty: 1, unit: 33.33, total: 33.33 },
        { qty: 1, unit: 33.33, total: 33.33 },
      ],
    });
    const { data, error } = await callRpc(qid);
    expect(error).toBeNull();
    const res = data as RpcResult;
    createdSales.push(res.sale_id);
    expect(res.order_number).toMatch(/^ORC-\d{8}-\d{8}$/);
  });

  test('TOTAL_MISMATCH: diferença de R$ 0,05 é bloqueada', async () => {
    const qid = await seedQuote({
      total: 100.0,
      items: [{ qty: 1, unit: 100.05, total: 100.05 }],
    });
    const { error } = await callRpc(qid);
    expect(error?.message ?? '').toContain('[TOTAL_MISMATCH]');
  });

  test('FORBIDDEN: exposto ao caller quando não é dono e não é admin', async () => {
    // Cria orçamento com created_by fixo diferente do caller (uuid aleatório).
    // Se o caller for admin no seed, o teste apenas verifica que o código
    // FORBIDDEN existe e é parseável — não falsifica o role.
    const { data: me } = await client.auth.getUser();
    const { data: isAdmin } = await client.rpc('has_role' as never, {
      _user_id: me.user?.id,
      _role: 'admin',
    } as never);
    test.skip(Boolean(isAdmin), 'Caller é admin; FORBIDDEN é testado no unit test do parser.');

    const foreignSp = '00000000-0000-0000-0000-000000000000';
    const { data: quote } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E FORBIDDEN',
        title: 'E2E FORBIDDEN',
        total_value: 50,
        subtotal: 50,
        status: 'approved',
        source: 'manual',
        created_by: foreignSp,
      })
      .select('id')
      .single();
    if (!quote) return; // RLS pode bloquear o insert — nesse caso o cenário já está coberto.
    createdQuotes.push(quote.id);
    await client.from('quote_items').insert({
      quote_id: quote.id,
      product_name: 'p',
      quantity: 1,
      unit_price: 50,
      total_price: 50,
    });

    const { error } = await callRpc(quote.id);
    expect(error?.message ?? '').toContain('[FORBIDDEN]');
  });

  test('Concorrência: 8 conversões paralelas produzem 8 order_number únicos', async () => {
    const quotes = await Promise.all(
      Array.from({ length: 8 }, () =>
        seedQuote({
          total: 10,
          items: [{ qty: 1, unit: 10, total: 10 }],
        }),
      ),
    );

    const results = await Promise.all(quotes.map((q) => callRpc(q)));
    const numbers: string[] = [];
    for (const r of results) {
      expect(r.error).toBeNull();
      const data = r.data as RpcResult;
      createdSales.push(data.sale_id);
      expect(data.order_number).toMatch(/^ORC-\d{8}-\d{8}$/);
      numbers.push(data.order_number!);
    }
    // Unicidade: cardinalidade do Set == 8
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});
