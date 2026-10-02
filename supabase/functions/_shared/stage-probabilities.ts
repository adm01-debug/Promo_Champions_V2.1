// Fonte única de probabilidade por estágio/status de venda para edge functions.
//
// Lê public.stage_probabilities (seed em
// migrations/20261001220000_stage_probabilities.sql) com cache em memória por
// isolado. Se a tabela ainda não existir ou vier vazia, usa o fallback abaixo —
// que espelha o seed da migration — para não quebrar deploys fora de ordem.
//
// Escala: fração 0-1 (igual à coluna probability). Consumidores que trabalham
// em percentual 0-100 multiplicam por 100 no ponto de uso.

export interface StageProbabilityClient {
  from(table: string): {
    select(columns: string): PromiseLike<{
      data: Array<{ stage: string; probability: number }> | null;
      error: { message?: string } | null;
    }>;
  };
}

export const STAGE_PROBABILITY_FALLBACK: Record<string, number> = {
  lead: 0.05,
  open: 0.1,
  pending: 0.1,
  prospecting: 0.15,
  qualified: 0.25,
  in_progress: 0.3,
  proposal: 0.5,
  negotiation: 0.75,
  cancelled: 0,
  lost: 0,
  completed: 1,
  closed: 1,
  won: 1,
};

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: Record<string, number> | null = null;
let cacheAt = 0;

export async function getStageProbabilities(
  client: StageProbabilityClient,
): Promise<Record<string, number>> {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) return cache;

  const { data, error } = await client
    .from("stage_probabilities")
    .select("stage, probability");

  if (error || !data || data.length === 0) {
    return cache ?? STAGE_PROBABILITY_FALLBACK;
  }

  cache = Object.fromEntries(
    data.map((row) => [row.stage, Number(row.probability)]),
  );
  cacheAt = Date.now();
  return cache;
}
