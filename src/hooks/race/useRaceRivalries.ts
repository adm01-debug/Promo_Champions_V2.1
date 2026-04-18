import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RaceRivalry {
  season_id: string;
  rival_a: string;
  rival_b: string;
  swap_count: number;
  last_swap_at: string;
}

/**
 * Lista pares de vendedores com >= 3 trocas de posição na temporada.
 * View `race_rivalries_view` com security_invoker.
 */
export function useRaceRivalries(seasonId?: string) {
  return useQuery({
    queryKey: ['race-rivalries', seasonId],
    queryFn: async (): Promise<RaceRivalry[]> => {
      if (!seasonId) return [];
      // @ts-expect-error - view não tipada ainda em supabase types
      const { data, error } = await supabase
        .from('race_rivalries_view')
        .select('*')
        .eq('season_id', seasonId)
        .order('swap_count', { ascending: false });
      if (error) throw error;
      return (data ?? []) as RaceRivalry[];
    },
    enabled: !!seasonId,
    staleTime: 30_000,
  });
}

/** Verifica se duas pessoas formam uma rivalidade. */
export function isRivalryPair(rivalries: RaceRivalry[], a: string, b: string): RaceRivalry | undefined {
  const lo = a < b ? a : b;
  const hi = a < b ? b : a;
  return rivalries.find((r) => r.rival_a === lo && r.rival_b === hi);
}
