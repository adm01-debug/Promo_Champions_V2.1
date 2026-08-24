import { useMemo } from 'react';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";

export interface RacePrediction {
  salesperson_id: string;
  currentRank: number;
  projectedRank: number;
  projectedTotal: number;
  paceDaily: number;
  trend: 'up' | 'down' | 'stable';
  deltaRanks: number; // positive = ganhando posições, negative = perdendo
}

interface SeasonRange {
  start_date?: string;
  end_date?: string;
}

const MS_PER_DAY = 86_400_000;

function clampDays(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * Projeta posição final da season com base no ritmo atual de cada piloto.
 * Linear: paceDaily = total / daysElapsed; projected = total + pace * daysRemaining.
 */
export function useRacePredictions(
  entries: RaceLeaderboardEntry[],
  season?: SeasonRange,
): Map<string, RacePrediction> {
  return useMemo(() => {
    const map = new Map<string, RacePrediction>();
    if (!entries.length || !season?.start_date || !season?.end_date) return map;

    const now = Date.now();
    const start = new Date(season.start_date).getTime();
    const end = new Date(season.end_date).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return map;

    const daysElapsed = clampDays((now - start) / MS_PER_DAY);
    const daysRemaining = Math.max(0, (end - now) / MS_PER_DAY);

    // Rank atual por total_sales
    const sortedCurrent = [...entries].sort(
      (a, b) => Number(b.total_sales) - Number(a.total_sales),
    );
    const currentRankMap = new Map<string, number>();
    sortedCurrent.forEach((e, i) => currentRankMap.set(e.salesperson_id, i + 1));

    // Projeção
    const projections = sortedCurrent.map((e) => {
      const total = Number(e.total_sales);
      const paceDaily = total / daysElapsed;
      const projectedTotal = total + paceDaily * daysRemaining;
      return { entry: e, paceDaily, projectedTotal };
    });

    // Re-rank por projeção
    const sortedProjected = [...projections].sort(
      (a, b) => b.projectedTotal - a.projectedTotal,
    );

    sortedProjected.forEach((p, i) => {
      const projectedRank = i + 1;
      const currentRank = currentRankMap.get(p.entry.salesperson_id) ?? projectedRank;
      const deltaRanks = currentRank - projectedRank; // positivo = subiu
      const trend: RacePrediction['trend'] =
        deltaRanks > 0 ? 'up' : deltaRanks < 0 ? 'down' : 'stable';

      map.set(p.entry.salesperson_id, {
        salesperson_id: p.entry.salesperson_id,
        currentRank,
        projectedRank,
        projectedTotal: p.projectedTotal,
        paceDaily: p.paceDaily,
        trend,
        deltaRanks,
      });
    });

    return map;
  }, [entries, season?.start_date, season?.end_date]);
}
