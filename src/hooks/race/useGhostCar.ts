import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";
import type { RaceSeason } from "@/hooks/race/useRaceSeason";

export type GhostStatus = 'ahead' | 'behind' | 'tied' | 'no-data';

export interface GhostCarResult {
  status: GhostStatus;
  ghostProgress: number;
  myProgress: number;
  delta: number; // pp (myProgress - ghostProgress) * 100
  bestSeasonName: string | null;
}

interface Params {
  mySalespersonId?: string;
  currentSeason?: RaceSeason | null;
  leaderboard: RaceLeaderboardEntry[];
}

interface FinishedSeasonRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  final_progress: number;
}

/**
 * Calcula o ritmo histórico (PR pessoal) do usuário e onde o ghost car estaria agora.
 * Usa a melhor season anterior (maior progresso final) como referência linear de ritmo.
 */
export function useGhostCar({ mySalespersonId, currentSeason, leaderboard }: Params): GhostCarResult {
  const { data: history = [] } = useQuery({
    queryKey: ['ghost-car-history', mySalespersonId],
    enabled: !!mySalespersonId,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<FinishedSeasonRow[]> => {
      if (!mySalespersonId) return [];
      // Busca seasons finalizadas e o último progresso registrado do usuário em cada uma
      const { data: seasons, error } = await supabase
        .from('race_seasons')
        .select('id, name, start_date, end_date, status')
        .eq('status', 'finished')
        .order('end_date', { ascending: false })
        .limit(10);
      if (error || !seasons?.length) return [];

      const results: FinishedSeasonRow[] = [];
      for (const s of seasons) {
        const { data: lb } = await supabase
          .from('race_leaderboard_view')
          .select('progress, salesperson_id')
          .eq('season_id', s.id)
          .eq('salesperson_id', mySalespersonId)
          .maybeSingle();
        if (lb?.progress !== undefined && lb?.progress !== null) {
          results.push({
            id: s.id,
            name: s.name,
            start_date: s.start_date,
            end_date: s.end_date,
            final_progress: Number(lb.progress),
          });
        }
      }
      return results;
    },
  });

  return useMemo<GhostCarResult>(() => {
    const myEntry = leaderboard.find((e) => e.salesperson_id === mySalespersonId);
    const myProgress = Number(myEntry?.progress ?? 0);

    if (!mySalespersonId || !currentSeason || history.length === 0) {
      return { status: 'no-data', ghostProgress: 0, myProgress, delta: 0, bestSeasonName: null };
    }

    // Best PR = maior progresso final
    const best = history.reduce((acc, cur) => (cur.final_progress > acc.final_progress ? cur : acc), history[0]);

    // Tempo decorrido na season atual (0..1)
    const start = new Date(currentSeason.start_date).getTime();
    const end = new Date(currentSeason.end_date).getTime();
    const now = Date.now();
    const totalMs = Math.max(1, end - start);
    const elapsedFrac = Math.max(0, Math.min(1, (now - start) / totalMs));

    // Ghost progress = ritmo linear do PR projetado no tempo atual
    const ghostProgress = best.final_progress * elapsedFrac;
    const delta = (myProgress - ghostProgress) * 100;

    let status: GhostStatus = 'tied';
    if (delta > 1) status = 'ahead';
    else if (delta < -1) status = 'behind';

    return {
      status,
      ghostProgress: Math.max(0, Math.min(1, ghostProgress)),
      myProgress,
      delta,
      bestSeasonName: best.name,
    };
  }, [history, mySalespersonId, currentSeason, leaderboard]);
}
