import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import { cleanupQuote, convert, seedQuote } from './helpers/quote-to-sale-helpers';

/**
 * E2E: audit_logs de convert_quote_to_sale (regressão BUG#3).
 *
 * Antes da correção, o INSERT na tabela audit_logs referenciava colunas
 * inexistentes (`resource_type`, `resource_id`, `user_id`) e era engolido
 * pelo bloco `EXCEPTION WHEN OTHERS THEN NULL` — 100% dos eventos sumiam
 * silenciosamente. Este spec garante que a auditoria agora é gravada
 * com os campos corretos.
 *
 * Cobre 3 caminhos:
 *   1. Reuso de order (approved → PED-*): reused_order=true
 *   2. Criação nova (won → ORC-*):        reused_order=false
 *   3. Idempotente:                       branch idempotent não grava (log
 *      já foi criado na conversão original — não deve duplicar)
 */
test.describe('audit_logs: convert_quote_to_sale grava histórico corretamente', () => {
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
    for (const id of createdQuoteIds) await cleanupQuote(client, id);
  });

  async function fetchAuditRows(quoteId: string) {
    const { data, error } = await client
      .from('audit_logs')
      .select('id, action, entity_type, entity_id, metadata')
      .eq('action', 'convert_quote_to_sale')
      .eq('entity_id', quoteId);
    if (error) throw new Error(`audit fetch: ${error.message}`);
    return data ?? [];
  }

  test('reuso (approved/PED-*): grava audit com order_number e reused_order=true', async () => {
    const seed = await seedQuote(client, {
      status: 'approved',
      total: 210,
      label: 'E2E Audit Reuse',
    });
    createdQuoteIds.push(seed.quoteId);

    const { payload, error } = await convert(client, seed.quoteId);
    expect(error).toBeNull();
    expect(payload).not.toBeNull();

    const rows = await fetchAuditRows(seed.quoteId);
    expect(rows.length).toBe(1);
    const row = rows[0];
    expect(row.entity_type).toBe('quote');
    const md = row.metadata as Record<string, unknown>;
    expect(md.order_id).toBe(payload!.order_id);
    expect(md.order_number).toBe(payload!.order_number);
    expect(md.sale_id).toBe(payload!.sale_id);
    expect(md.reused_order).toBe(true);
    expect(Number(md.total_value)).toBe(210);
    expect(Number(md.item_count)).toBeGreaterThanOrEqual(1);
  });

  test('criação (won/ORC-*): grava audit com order_number e reused_order=false', async () => {
    const seed = await seedQuote(client, {
      status: 'won',
      total: 430,
      label: 'E2E Audit Create',
    });
    createdQuoteIds.push(seed.quoteId);
    expect(seed.preExistingOrderId).toBeNull(); // won não dispara trigger

    const { payload, error } = await convert(client, seed.quoteId);
    expect(error).toBeNull();
    expect(payload!.order_number).toMatch(/^ORC-\d{8}-\d{8}$/);

    const rows = await fetchAuditRows(seed.quoteId);
    expect(rows.length).toBe(1);
    const md = rows[0].metadata as Record<string, unknown>;
    expect(md.order_number).toBe(payload!.order_number);
    expect(md.reused_order).toBe(false);
    expect(md.sale_id).toBe(payload!.sale_id);
  });

  test('idempotente: 2ª chamada NÃO grava audit_log duplicado', async () => {
    const seed = await seedQuote(client, {
      status: 'won',
      total: 88,
      label: 'E2E Audit Idem',
    });
    createdQuoteIds.push(seed.quoteId);

    await convert(client, seed.quoteId);
    await convert(client, seed.quoteId); // idempotente
    await convert(client, seed.quoteId); // idempotente

    const rows = await fetchAuditRows(seed.quoteId);
    expect(rows.length).toBe(1); // única entrada, criada na 1ª conversão
  });
});
