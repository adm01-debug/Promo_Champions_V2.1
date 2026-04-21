import { useMemo } from "react";
import type { WLAnalysisRow } from "./useWinLossData";

export interface SeasonStats {
  label: string;
  total: number;
  wins: number;
  winRate: number;
  totalAmount: number;
  avgCycle: number;
}

export interface SeasonComparison {
  current: SeasonStats;
  previous: SeasonStats;
  deltas: {
    winRate: number;
    totalAmount: number;
    avgCycle: number;
    total: number;
  };
}

const inRange = (iso: string | null, start: Date, end: Date) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
};

const computeStats = (rows: WLAnalysisRow[], label: string): SeasonStats => {
  const total = rows.length;
  const wins = rows.filter(r => r.outcome === "won").length;
  const totalAmount = rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const cycles = rows.map(r => Number(r.cycle_days) || 0).filter(v => v > 0);
  const avgCycle = cycles.length ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 0;
  return { label, total, wins, winRate: total ? (wins / total) * 100 : 0, totalAmount, avgCycle };
};

export const useSeasonComparison = (rows: WLAnalysisRow[], salespersonId: string | null): SeasonComparison => {
  return useMemo(() => {
    const now = new Date();
    const currentQ = Math.floor(now.getMonth() / 3);
    const startCurrent = new Date(now.getFullYear(), currentQ * 3, 1);
    const endCurrent = new Date(now.getFullYear(), currentQ * 3 + 3, 1);
    const startPrev = new Date(now.getFullYear(), currentQ * 3 - 3, 1);
    const endPrev = startCurrent;

    const filtered = salespersonId ? rows.filter(r => r.salesperson_id === salespersonId) : rows;
    const cur = filtered.filter(r => inRange(r.analyzed_at, startCurrent, endCurrent));
    const prev = filtered.filter(r => inRange(r.analyzed_at, startPrev, endPrev));

    const current = computeStats(cur, `${startCurrent.getFullYear()}·Q${currentQ + 1}`);
    const previous = computeStats(prev, `${startPrev.getFullYear()}·Q${(currentQ + 4) % 4 || 4}`);

    return {
      current,
      previous,
      deltas: {
        winRate: current.winRate - previous.winRate,
        totalAmount: current.totalAmount - previous.totalAmount,
        avgCycle: current.avgCycle - previous.avgCycle,
        total: current.total - previous.total,
      },
    };
  }, [rows, salespersonId]);
};
