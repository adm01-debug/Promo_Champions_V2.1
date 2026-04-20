import { useMemo } from "react";
import type { SalespersonStat } from "./useWinLossAggregations";

export type ScoreTier = "diamante" | "ouro" | "prata" | "bronze";

export interface SalespersonScore {
  salespersonId: string;
  score: number; // 0-100
  tier: ScoreTier;
  factors: { winRate: number; cycle: number; ticket: number };
}

const tierFor = (s: number): ScoreTier => {
  if (s >= 85) return "diamante";
  if (s >= 70) return "ouro";
  if (s >= 50) return "prata";
  return "bronze";
};

export const tierLabel: Record<ScoreTier, string> = {
  diamante: "Diamante",
  ouro: "Ouro",
  prata: "Prata",
  bronze: "Bronze",
};

export const tierClasses: Record<ScoreTier, string> = {
  diamante: "border-cyan-500/40 text-cyan-700 bg-cyan-500/5",
  ouro: "border-amber-500/40 text-amber-700 bg-amber-500/5",
  prata: "border-slate-400/40 text-slate-700 bg-slate-400/5",
  bronze: "border-orange-700/40 text-orange-800 bg-orange-700/5",
};

/**
 * Combines win rate (50%) + ticket (25%) + cycle efficiency (25%) → 0-100.
 * Pure derivation from existing stats — no extra query.
 */
export function useWinLossSalespersonScore(stats: SalespersonStat[]): Map<string, SalespersonScore> {
  return useMemo(() => {
    const map = new Map<string, SalespersonScore>();
    if (!stats.length) return map;

    const maxTicket = Math.max(...stats.map((s) => s.avgAmountWon || 0), 1);
    // Lower cycle is better — use inverse normalization
    const cycles = stats.map((s) => s.avgCycle || 0).filter((n) => n > 0);
    const minCycle = cycles.length ? Math.min(...cycles) : 0;
    const maxCycle = cycles.length ? Math.max(...cycles) : 0;
    const cycleSpan = Math.max(maxCycle - minCycle, 1);

    stats.forEach((s) => {
      const wr = Math.max(0, Math.min(100, s.winRate || 0));
      const ticketNorm = ((s.avgAmountWon || 0) / maxTicket) * 100;
      const cycleNorm =
        s.avgCycle && cycles.length ? Math.max(0, 100 - ((s.avgCycle - minCycle) / cycleSpan) * 100) : 50;

      const score = Math.round(wr * 0.5 + ticketNorm * 0.25 + cycleNorm * 0.25);
      map.set(s.salespersonId, {
        salespersonId: s.salespersonId,
        score,
        tier: tierFor(score),
        factors: { winRate: wr, cycle: cycleNorm, ticket: ticketNorm },
      });
    });

    return map;
  }, [stats]);
}
