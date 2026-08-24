import { useMemo } from 'react';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";

export interface WhatIfScenario {
  label: string;
  delta: number;
  newTotal: number;
  newRank: number;
  positionsGained: number;
  description: string;
}

interface Opts {
  entries: RaceLeaderboardEntry[];
  currentUserSalespersonId?: string;
}

/**
 * Simula 3 cenários (conservador, realista, agressivo) projetando quantas
 * posições o piloto sobe ao adicionar um delta de vendas hoje.
 */
export function useRaceWhatIf({ entries, currentUserSalespersonId }: Opts): WhatIfScenario[] {
  return useMemo(() => {
    if (!currentUserSalespersonId || entries.length === 0) return [];
    const sorted = [...entries].sort((a, b) => Number(b.total_sales) - Number(a.total_sales));
    const me = sorted.find((e) => e.salesperson_id === currentUserSalespersonId);
    if (!me) return [];

    const myTotal = Number(me.total_sales) || 0;
    const leaderTotal = Number(sorted[0].total_sales) || 1;
    // Baselines proporcionais ao gap até líder (mínimos pisos para não dar 0).
    const gap = Math.max(0, leaderTotal - myTotal);
    const base = Math.max(gap * 0.15, leaderTotal * 0.02, 500);

    const deltas = [
      { label: 'Conservador', mult: 1, desc: 'Ritmo seguro de hoje' },
      { label: 'Realista', mult: 2.5, desc: 'Empurrão com 2-3 fechamentos' },
      { label: 'Agressivo', mult: 5, desc: 'Dia épico de pista' },
    ];

    return deltas.map(({ label, mult, desc }) => {
      const delta = Math.round(base * mult);
      const newTotal = myTotal + delta;
      const reSorted = sorted
        .map((e) => ({
          id: e.salesperson_id,
          total: e.salesperson_id === currentUserSalespersonId ? newTotal : Number(e.total_sales),
        }))
        .sort((a, b) => b.total - a.total);
      const newRank = reSorted.findIndex((r) => r.id === currentUserSalespersonId) + 1;
      const currentRank = sorted.findIndex((e) => e.salesperson_id === currentUserSalespersonId) + 1;
      return {
        label,
        delta,
        newTotal,
        newRank,
        positionsGained: Math.max(0, currentRank - newRank),
        description: desc,
      };
    });
  }, [entries, currentUserSalespersonId]);
}
