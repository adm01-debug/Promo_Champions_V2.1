// Utilitário para evitar overflow de URL no PostgREST quando se usa `.in()` com
// arrays grandes de UUIDs.
//
// Contexto: PostgREST (via edge gateway) impõe um limite prático de ~8KB na URL.
// Uma cláusula `?id=in.(uuid1,uuid2,...)` com ~200 UUIDs já ultrapassa esse
// limite e o edge runtime derruba a conexão com
// `TypeError: error sending request`.
//
// Uso:
//   const rows = await chunkedIn<Sale>(ids, (chunk) =>
//     supabase.from("sales").select("*").in("id", chunk)
//   );
//
// Chunk padrão de 100 UUIDs mantém a URL confortavelmente abaixo do limite
// (~4KB) e ainda permite `Promise.all` implícito por chunk se necessário.

export type PostgrestLike<T> = PromiseLike<{
  data: T[] | null;
  error: { message?: string } | null;
}>;

export interface ChunkedInOptions {
  /** Tamanho do chunk. Padrão: 100. */
  chunkSize?: number;
  /** Se true, executa chunks em paralelo com Promise.all. Padrão: false (sequencial, mais gentil com o DB). */
  parallel?: boolean;
  /** Label opcional para mensagens de erro. */
  label?: string;
}

export async function chunkedIn<T>(
  ids: readonly string[],
  runner: (chunk: string[]) => PostgrestLike<T>,
  opts: ChunkedInOptions = {},
): Promise<T[]> {
  const { chunkSize = 100, parallel = false, label = "chunkedIn" } = opts;

  if (!ids || ids.length === 0) return [];

  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize));
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

  for (const chunk of chunks) {
    const r = await runner(chunk);
    if (r.error) throw new Error(`${label}: ${r.error.message ?? "unknown error"}`);
    if (r.data) collected.push(...r.data);
  }
  return collected;
}
