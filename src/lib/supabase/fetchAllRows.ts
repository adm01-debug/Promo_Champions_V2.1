/**
 * fetchAllRows — consome todas as páginas de uma query PostgREST.
 *
 * O PostgREST trunca respostas de lista em ~1000 linhas; uma query agregada
 * (ex.: 6 meses de vendas numa única consulta) que passe desse teto perde
 * linhas silenciosamente. Use em vez de `await query` quando o volume
 * esperado puder exceder o teto:
 *
 *   const rows = await fetchAllRows((from, to) =>
 *     supabase.from('sales').select('id, amount').gte('created_at', start).range(from, to)
 *   );
 */

import type { PostgrestLike } from './chunkedIn';

export interface FetchAllRowsOptions {
  pageSize?: number;
  label?: string;
}

export async function fetchAllRows<T>(
  runner: (from: number, to: number) => PostgrestLike<T>,
  opts: FetchAllRowsOptions = {}
): Promise<T[]> {
  const { pageSize = 1000, label = 'fetchAllRows' } = opts;

  const collected: T[] = [];
  let from = 0;
  for (;;) {
    const r = await runner(from, from + pageSize - 1);
    if (r.error) {
      throw new Error(`${label}: ${r.error.message ?? 'unknown error'}`);
    }
    const batch = r.data ?? [];
    collected.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return collected;
}
