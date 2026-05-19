import { useMemo } from 'react';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";

export type NextGoalMode = 'hunting' | 'defending' | 'leader-only' | 'idle';

export interface NextGoalResult {
  mode: NextGoalMode;
  me?: RaceLeaderboardEntry;
  target?: RaceLeaderboardEntry;
  gapAmount: number;
  gapPercent: number; // 0-100, how close we are to overtaking (or being overtaken)
  seasonProgress: number; // 0-100
  seasonRemaining: number;
  isCloseToOvertake: boolean; // gapPercent >= 95 (very close)
}

/**
 * Computes the next motivational goal for the logged-in pilot:
 * - "hunting": chasing the pilot directly above
 * - "defending": leader being chased by P2
 * - "leader-only": leader with no challengers
 * - "idle": pilot not in leaderboard
 */
export function useNextGoal(
  entries: RaceLeaderboardEntry[],
  currentUserSalespersonId?: string,
  goalAmount = 0,
): NextGoalResult {
  return useMemo(() => {
    const sorted = [...entries].sort((a, b) => Number(b.total_sales) - Number(a.total_sales));
    const meIdx = currentUserSalespersonId
      ? sorted.findIndex((e) => e.salesperson_id === currentUserSalespersonId)
      : -1;
    const me = meIdx >= 0 ? sorted[meIdx] : undefined;
    const mySales = me ? Number(me.total_sales) : 0;
    const seasonProgress = goalAmount > 0 ? Math.min(100, (mySales / goalAmount) * 100) : 0;
    const seasonRemaining = Math.max(0, goalAmount - mySales);

    if (!me) {
      return {
        mode: 'idle' as const,
        gapAmount: 0,
        gapPercent: 0,
        seasonProgress: 0,
        seasonRemaining: goalAmount,
        isCloseToOvertake: false,
      };
    }

    // Hunting: there's someone above
    if (meIdx > 0) {
      const target = sorted[meIdx - 1];
      const targetSales = Number(target.total_sales);
      const gapAmount = Math.max(0, targetSales - mySales);
      const gapPercent = targetSales > 0 ? Math.min(100, (mySales / targetSales) * 100) : 100;
      return {
        mode: 'hunting' as const,
        me,
        target,
        gapAmount,
        gapPercent,
        seasonProgress,
        seasonRemaining,
        isCloseToOvertake: gapPercent >= 95,
      };
    }

    // Defending P1
    const challenger = sorted[1];
    if (challenger) {
      const challengerSales = Number(challenger.total_sales);
      const gapAmount = Math.max(0, mySales - challengerSales);
      const gapPercent = mySales > 0 ? Math.min(100, (challengerSales / mySales) * 100) : 0;
      return {
        mode: 'defending' as const,
        me,
        target: challenger,
        gapAmount,
        gapPercent,
        seasonProgress,
        seasonRemaining,
        isCloseToOvertake: gapPercent >= 95,
      };
    }

    return {
      mode: 'leader-only' as const,
      me,
      gapAmount: 0,
      gapPercent: 0,
      seasonProgress,
      seasonRemaining,
      isCloseToOvertake: false,
    };
  }, [entries, currentUserSalespersonId, goalAmount]);
}
