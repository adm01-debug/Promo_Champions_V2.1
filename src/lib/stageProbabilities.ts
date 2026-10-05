import { supabase } from '@/integrations/supabase/client';

/**
 * Fonte única de probabilidade por estágio/status de venda.
 *
 * Lê public.stage_probabilities (migration 20261001220000) e mantém cache em
 * memória. Se a tabela ainda não existir ou vier vazia, usa o fallback — que
 * espelha o seed da migration — para não quebrar antes do deploy.
 *
 * Escala: fração 0-1 (igual à coluna probability).
 */

export interface StageProbabilityRow {
  stage: string;
  probability: number;
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

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: Record<string, number> | null = null;
let cacheAt = 0;
let inflight: Promise<Record<string, number>> | null = null;

export async function fetchStageProbabilities(): Promise<Record<string, number>> {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) return cache;
  inflight ??= (async () => {
    try {
      const { data, error } = await supabase
        // Tabela nova: entra em types.ts só após `supabase gen types` em prod.
        .from('stage_probabilities' as never)
        .select('stage, probability');
      if (error || !data || (data as unknown[]).length === 0) {
        return cache ?? STAGE_PROBABILITY_FALLBACK;
      }
      const rows = data as StageProbabilityRow[];
      cache = Object.fromEntries(rows.map(r => [r.stage, Number(r.probability)]));
      cacheAt = Date.now();
      return cache;
    } catch {
      return cache ?? STAGE_PROBABILITY_FALLBACK;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
