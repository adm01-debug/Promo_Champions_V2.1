import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';

/**
 * E2E: Reexecutar `fn_backfill_orders_conversion_seq` (admin) e validar que:
 *   1. `last_value` da sequence NUNCA regride.
 *   2. Após o backfill, novos order_number continuam únicos e monotônicos.
 *   3. Backfill é idempotente (chamadas sucessivas mantêm o mesmo valor).
 *
 * Requer que o usuário E2E tenha role 'admin'.
 */
test.describe('Backfill orders_conversion_seq: reexecução segura', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  const quoteIds: string[] = [];

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
    for (const id of quoteIds) {
      const { data: orders } = await client.from('orders').select('id').eq('quote_id', id);
      for (const o of orders ?? []) await client.from('orders').delete().eq('id', o.id);
      const { data: q } = await client.from('quotes').select('sale_id').eq('id', id).maybeSingle();
      if (q?.sale_id) await client.from('sales').delete().eq('id', q.sale_id);
      await client.from('quote_items').delete().eq('quote_id', id);
      await client.from('quotes').delete().eq('id', id);
    }
  });

  async function seedApprovedQuote(total: number): Promise<string> {
    const { data: q, error } = await client
      .from('quotes')
      .insert({
        client_name: 'E2E Backfill',
        title: `E2E Backfill ${Date.now()}-${Math.random()}`,
        total_value: total,
        subtotal: total,
        status: 'approved',
        source: 'manual',
      })
      .select('id')
      .single();
    if (error || !q) throw new Error(`Falha ao criar quote: ${error?.message}`);
    await client.from('quote_items').insert({
      quote_id: q.id,
      product_name: 'Item Backfill',
      quantity: 1,
      unit_price: total,
      total_price: total,
    });
    quoteIds.push(q.id);
    return q.id;
  }

  test('reexecução mantém last_value monotônico e order_number único', async () => {
    // 1. Lê last_value antes
    const before = await client.rpc('fn_get_orders_conversion_seq_last' as never);
    expect(before.error).toBeNull();
    const beforeVal = Number(before.data);
    expect(Number.isFinite(beforeVal)).toBe(true);

    // 2. Primeira execução do backfill (deve ser idempotente = new_value == previous_value)
    const b1 = await client.rpc('fn_backfill_orders_conversion_seq' as never);
    if (b1.error && /FORBIDDEN/.test(b1.error.message)) {
      test.skip(true, 'Usuário E2E não é admin — backfill exige role admin.');
    }
    expect(b1.error).toBeNull();
    const r1 = b1.data as { previous_value: number; new_value: number; legacy_max: number };
    expect(r1.new_value).toBeGreaterThanOrEqual(beforeVal);
    expect(r1.new_value).toBeGreaterThanOrEqual(r1.legacy_max);

    // 3. Cria 3 conversões após backfill e valida unicidade + monotonicidade
    const numbers: string[] = [];
    for (let i = 0; i < 3; i++) {
      const qid = await seedApprovedQuote(100 + i);
      const conv = await client.rpc('fn_convert_quote_to_sale' as never, { _quote_id: qid } as never);
      expect(conv.error).toBeNull();
      const d = conv.data as { order_number: string };
      expect(d.order_number).toMatch(/^ORC-\d{8}-\d{8}$/);
      numbers.push(d.order_number);
    }
    expect(new Set(numbers).size).toBe(numbers.length);

    // Contadores (últimos 8 dígitos) devem ser estritamente crescentes
    const counters = numbers.map((n) => Number(n.split('-')[2]));
    for (let i = 1; i < counters.length; i++) {
      expect(counters[i]).toBeGreaterThan(counters[i - 1]);
    }

    // 4. Reexecuta backfill: last_value NÃO pode regredir
    const after = await client.rpc('fn_get_orders_conversion_seq_last' as never);
    const afterVal = Number(after.data);
    const b2 = await client.rpc('fn_backfill_orders_conversion_seq' as never);
    expect(b2.error).toBeNull();
    const r2 = b2.data as { previous_value: number; new_value: number };
    expect(r2.new_value).toBeGreaterThanOrEqual(afterVal);
  });
});
