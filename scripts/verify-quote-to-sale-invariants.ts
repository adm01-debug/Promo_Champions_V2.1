/**
 * Verifica as 4 invariantes críticas do fluxo quote → sale em produção.
 *
 * Exit 0 → tudo OK. Exit 1 → JSON com violações detalhadas.
 *
 * Uso:
 *   VITE_SUPABASE_URL=... VITE_SUPABASE_PUBLISHABLE_KEY=... \
 *   E2E_TEST_EMAIL=... E2E_TEST_PASSWORD=... \
 *   bun run scripts/verify-quote-to-sale-invariants.ts
 *
 * Requer sessão autenticada (admin) porque as queries batem em `orders`,
 * `sales`, `quotes` — todas com RLS.
 */
import { createClient } from '@supabase/supabase-js';

type Violation = { check: string; count: number; sample?: unknown };

async function main(): Promise<void> {
  const url = process.env.VITE_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!url || !anon) {
    console.error('[invariants] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY ausentes');
    process.exit(2);
  }
  if (!email || !password) {
    console.error('[invariants] E2E_TEST_EMAIL / E2E_TEST_PASSWORD ausentes');
    process.exit(2);
  }

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: authErr } = await client.auth.signInWithPassword({ email, password });
  if (authErr) {
    console.error('[invariants] falha ao autenticar:', authErr.message);
    process.exit(2);
  }

  const violations: Violation[] = [];

  // 1) 0 order_number duplicados
  {
    const { data, error } = await client
      .from('orders')
      .select('order_number')
      .not('order_number', 'is', null);
    if (error) throw error;
    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const n = row.order_number as string;
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
    const dups = [...counts.entries()].filter(([, c]) => c > 1);
    if (dups.length) {
      violations.push({
        check: 'duplicate_order_number',
        count: dups.length,
        sample: dups.slice(0, 5),
      });
    }
  }

  // 2) 0 sales órfãos (sale sem quote apontando para ele)
  {
    const { data: sales, error } = await client
      .from('sales')
      .select('id')
      .limit(10000);
    if (error) throw error;
    const saleIds = (sales ?? []).map((s) => s.id as string);
    if (saleIds.length) {
      const { data: quotes } = await client
        .from('quotes')
        .select('sale_id')
        .not('sale_id', 'is', null);
      const referenced = new Set((quotes ?? []).map((q) => q.sale_id as string));
      const orphans = saleIds.filter((id) => !referenced.has(id));
      if (orphans.length) {
        violations.push({
          check: 'orphan_sales',
          count: orphans.length,
          sample: orphans.slice(0, 5),
        });
      }
    }
  }

  // 3) 0 quotes com > 1 order
  {
    const { data, error } = await client
      .from('orders')
      .select('quote_id')
      .not('quote_id', 'is', null);
    if (error) throw error;
    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const q = row.quote_id as string;
      counts.set(q, (counts.get(q) ?? 0) + 1);
    }
    const multi = [...counts.entries()].filter(([, c]) => c > 1);
    if (multi.length) {
      violations.push({
        check: 'quotes_with_multiple_orders',
        count: multi.length,
        sample: multi.slice(0, 5),
      });
    }
  }

  // 4) orders_conversion_seq monotônica vs max sufixo numérico dos ORC-*
  {
    const { data: seq, error: e1 } = await client.rpc(
      'fn_get_orders_conversion_seq_last' as never,
    );
    if (e1) throw e1;
    const seqLast = Number(seq);
    const { data: orcs, error: e2 } = await client
      .from('orders')
      .select('order_number')
      .like('order_number', 'ORC-%');
    if (e2) throw e2;
    let maxSuffix = 0;
    for (const row of orcs ?? []) {
      const parts = String(row.order_number).split('-');
      const n = Number(parts[2]);
      if (Number.isFinite(n) && n > maxSuffix) maxSuffix = n;
    }
    if (Number.isFinite(seqLast) && maxSuffix > seqLast) {
      violations.push({
        check: 'sequence_behind_max_order',
        count: maxSuffix - seqLast,
        sample: { seqLast, maxSuffix },
      });
    }
  }

  if (violations.length === 0) {
    console.log(JSON.stringify({ status: 'ok', checks: 4, violations: [] }, null, 2));
    process.exit(0);
  }

  console.error(JSON.stringify({ status: 'fail', violations }, null, 2));
  process.exit(1);
}

main().catch((err) => {
  console.error('[invariants] erro fatal:', err);
  process.exit(3);
});
