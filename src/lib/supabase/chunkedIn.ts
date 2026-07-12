/**
 * chunkedIn — evita overflow de URL do PostgREST no cliente.
 *
 * O gateway PostgREST limita a URL em ~8KB. Um `?id=in.(uuid,uuid,...)` com
 * ~200 UUIDs já estoura, o edge derruba a conexão e o app recebe
 * "TypeError: Failed to fetch" ou 500 opaco.
 *
 * Uso:
 *   const rows = await chunkedIn<Row>(ids, (chunk) =>
 *     supabase.from("sales").select("*").in("id", chunk)
 *   );
 *
 * Chunk padrão 100 mantém a URL ~4KB. `parallel: true` dispara `Promise.all`
 * quando ordem não importa e o backend aguenta concorrência.
 */

export type PostgrestLike<T> = PromiseLike<{
  data: T[] | null;
  error: { message?: string } | null;
}>;

export interface ChunkedInOptions {
  chunkSize?: number;
  parallel?: boolean;
  label?: string;
}

export async function chunkedIn<T>(
  ids: readonly string[] | readonly number[],
  runner: (chunk: Array<string | number>) => PostgrestLike<T>,
  opts: ChunkedInOptions = {},
): Promise<T[]> {
  const { chunkSize = 100, parallel = false, label = "chunkedIn" } = opts;
  if (!ids || ids.length === 0) return [];

  const chunks: Array<Array<string | number>> = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize) as Array<string | number>);
  }

  const collected: T[] = [];
  if (parallel) {
    const results = await Promise.all(chunks.map((c) => runner(c)));
    for (const r of results) {
      if (r.error) throw new Error(`${label}: ${r.error.message ?? "unknown error"}`);
      if (r.data) collected.push(...r.data);
    }
    return collected;
  }

  for (const c of chunks) {
    const r = await runner(c);
    if (r.error) throw new Error(`${label}: ${r.error.message ?? "unknown error"}`);
    if (r.data) collected.push(...r.data);
  }
  return collected;
}
