/**
 * fetchAllRows — percorre uma query PostgREST em janelas de `.range()` até
 * esgotar o resultado, superando o teto de ~1000 linhas por request do
 * PostgREST. Útil para agregados client-side que não podem truncar (ex.:
 * resumo de markup da seleção atual).
 *
 * `makeQuery` deve devolver uma query nova a cada chamada (os builders do
 * supabase-js são de uso único) SEM `.range()` — a função aplica a janela.
 */
export interface FetchAllRowsOptions {
  /** Linhas por request (padrão 1000 — teto prático do PostgREST). */
  pageSize?: number;
  /** Trava de segurança contra loops (padrão 10_000 linhas). */
  maxRows?: number;
}

interface QueryError {
  message: string;
}

interface RangeableQuery {
  range(
    from: number,
    to: number
  ): PromiseLike<{ data: unknown; error: QueryError | null }>;
}

export async function fetchAllRows<Row>(
  makeQuery: () => RangeableQuery,
  { pageSize = 1000, maxRows = 10_000 }: FetchAllRowsOptions = {}
): Promise<Row[]> {
  const rows: Row[] = [];

  for (let offset = 0; offset < maxRows; offset += pageSize) {
    const { data, error } = await makeQuery().range(offset, offset + pageSize - 1);
    if (error) throw error;

    const batch = (data ?? []) as Row[];
    rows.push(...batch);
    if (batch.length < pageSize) break;
  }

  return rows;
}
