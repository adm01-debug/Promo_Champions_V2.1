import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, STORAGE_KEY, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: approved (trigger legado) + botão UI disparados quase simultaneamente.
 *
 * Cenário race:
 *   - t0:   UPDATE quotes SET status='approved' (dispara trigger que pode
 *           criar `orders` para o quote).
 *   - t0+δ: clique no botão "Converter em venda" na UI (que chama a RPC
 *           `fn_convert_quote_to_sale`).
 *
 * Valida que:
 *   1. Exatamente 1 order acaba vinculada ao quote (trigger + RPC reusam).
 *   2. Se o trigger criou order pré-existente, RPC preserva id/order_number.
 *   3. Exatamente 1 sale é criada.
 *   4. order_number segue único no formato canônico.
 */
test.describe('Race: approved-trigger + botão UI no mesmo quote', () => {
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

    const total = 720;
    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Race Approved+UI',
        title: 'E2E Race Approved+UI',
        total_value: total,
        subtotal: total,
        status: 'draft',
        source: 'manual',
      })
      .select('id')
      .single();
    if (error || !q) throw new Error(`Falha ao criar quote: ${error?.message}`);
    quoteId = q.id;

    await client.from('quote_items').insert({
      quote_id: quoteId,
      product_name: 'Item Race Approved+UI',
      quantity: 4,
      unit_price: 180,
      total_price: total,
    });
  });

  test.afterAll(async () => {
    if (!client || !quoteId) return;
    const { data: orders } = await client.from('orders').select('id').eq('quote_id', quoteId);
    for (const o of orders ?? []) await client.from('orders').delete().eq('id', o.id);
    const { data: q } = await client
      .from('quotes')
      .select('sale_id')
      .eq('id', quoteId)
      .maybeSingle();
    if (q?.sale_id) await client.from('sales').delete().eq('id', q.sale_id);
    await client.from('quote_items').delete().eq('quote_id', quoteId);
    await client.from('quotes').delete().eq('id', quoteId);
  });

  test('approved + UI quase simultâneos → 1 order (reuso) + 1 sale', async ({ page }) => {
    // Hidrata sessão no browser
    await page.goto('http://localhost:8080');
    await page.evaluate(
      ([key, json]) => window.localStorage.setItem(key as string, json as string),
      [STORAGE_KEY, SESSION_JSON],
    );
    await page.goto('http://localhost:8080/orcamentos', { waitUntil: 'domcontentloaded' });

    // Race: UPDATE para approved em paralelo com clique da UI + fallback RPC.
    const approveP = client.from('quotes').update({ status: 'approved' }).eq('id', quoteId);

    const uiP = (async () => {
      const btn = page.getByRole('button', { name: /converter (em )?venda/i }).first();
      try {
        await btn.waitFor({ state: 'visible', timeout: 3000 });
        await btn.click();
        return { via: 'ui' };
      } catch {
        // Fallback: RPC via fetch autenticado no contexto do browser
        const session = JSON.parse(SESSION_JSON) as { access_token: string };
        await page.evaluate(
          async ({ url, anon, token, qId }) => {
            await fetch(`${url}/rest/v1/rpc/fn_convert_quote_to_sale`, {
              method: 'POST',
              headers: {
                apikey: anon,
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ _quote_id: qId }),
            });
          },
          { url: SUPABASE_URL, anon: SUPABASE_ANON, token: session.access_token, qId: quoteId },
        );
        return { via: 'fetch' };
      }
    })();

    const [approveRes] = await Promise.all([approveP, uiP]);
    expect(approveRes.error).toBeNull();

    // Garante convergência (trigger + UI/RPC concluem)
    await page.waitForTimeout(2000);

    // Chamada extra idempotente para consolidar estado se UI não completou
    const { data: r, error: rErr } = await client.rpc('fn_convert_quote_to_sale' as never, {
      _quote_id: quoteId,
    } as never);
    expect(rErr).toBeNull();
    const payload = r as { order_id: string; order_number: string; idempotent?: boolean };
    // Trigger legado (approved) cria PED-*; RPC pode devolver PED-* (reuso)
    // ou ORC-* (path novo em raras janelas). Ambos são válidos.
    expect(payload.order_number).toMatch(/^(ORC|PED)-/);

    // Estado final: 1 order, 1 sale, order_number único
    const { data: orders } = await client
      .from('orders')
      .select('id, order_number')
      .eq('quote_id', quoteId);
    expect(orders?.length).toBe(1);
    expect(orders![0].id).toBe(payload.order_id);
    expect(orders![0].order_number).toBe(payload.order_number);

    const { data: qFinal } = await client
      .from('quotes')
      .select('sale_id, status')
      .eq('id', quoteId)
      .single();
    expect(qFinal?.sale_id).toBeTruthy();
    expect(qFinal?.status).toBe('converted');

    const { count: salesCount } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);
    expect(salesCount).toBe(1);

    const { count: dupOrderNumber } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_number', payload.order_number);
    expect(dupOrderNumber).toBe(1);
  });
});
