import { test, expect } from './helpers/quote-to-sale-fixtures';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HAS_AUTH, SESSION_JSON, SUPABASE_ANON, SUPABASE_URL, skipReason } from './helpers/auth';
import { cleanupQuote, convert, seedQuote } from './helpers/quote-to-sale-helpers';

/**
 * Contract test para `cleanupQuote`: garante que a ordem de deleção FK-safe
 * remove 100% dos filhos gerados por triggers (sale_notifications_audit,
 * follow_up_notifications, follow_up_audit_logs) sem deixar órfãos.
 *
 * Regressão: qualquer nova FK dependente de `sales` que não seja tratada
 * aqui deve quebrar este spec — bloqueando merge silencioso.
 */
test.describe('Contract: cleanupQuote não deixa órfãos após triggers', () => {
  test.skip(!HAS_AUTH, `Sessão E2E ausente: ${skipReason()}`);

  let client: SupabaseClient;
  let quoteId: string;
  let saleId: string | null = null;

  test.beforeAll(async () => {
    const session = JSON.parse(SESSION_JSON) as { access_token: string; refresh_token: string };
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    await client.auth.setSession(session);
  });

  test('cleanup remove sale_notifications_audit, follow_up_notifications e follow_up_audit_logs', async () => {
    const seed = await seedQuote(client, {
      status: 'won',
      total: 555,
      label: 'E2E Cleanup Contract',
    });
    quoteId = seed.quoteId;

    const { payload, error } = await convert(client, quoteId);
    expect(error).toBeNull();
    expect(payload?.sale_id).toBeTruthy();
    saleId = payload!.sale_id;

    // Executa cleanup
    await cleanupQuote(client, quoteId, { strict: true });

    // Invariantes pós-cleanup — nenhum filho residual
    for (const table of [
      'sale_notifications_audit',
      'follow_up_notifications',
      'follow_up_audit_logs',
    ] as const) {
      const { count } = await client
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('sale_id', saleId!);
      expect(count, `${table} deveria estar vazio após cleanup`).toBe(0);
    }

    const { count: salesRem } = await client
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('id', saleId!);
    expect(salesRem).toBe(0);

    const { count: quotesRem } = await client
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('id', quoteId);
    expect(quotesRem).toBe(0);
  });
});
