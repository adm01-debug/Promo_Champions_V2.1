import { useMemo } from "react";
import type { WLAnalysisRow } from "./useWinLossData";

export interface WLKpis {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  avgCycleWon: number;
  avgCycleLost: number;
  avgAmountWon: number;
  forecastWinRate: number;
}

const avg = (arr: number[]): number =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export const useWLKpis = (rows: WLAnalysisRow[] | undefined): WLKpis => {
  return useMemo(() => {
    const list = rows ?? [];
    const wins = list.filter(r => r.outcome === "won");
    const losses = list.filter(r => r.outcome === "lost");
    const total = wins.length + losses.length;
    const winRate = total ? (wins.length / total) * 100 : 0;
    // Forecast: weight last 14d analyses 2x
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14);
    const recent = list.filter(r => new Date(r.analyzed_at) >= cutoff);
    const recentWinRate = recent.length
      ? (recent.filter(r => r.outcome === "won").length / recent.length) * 100
      : winRate;
    const forecastWinRate = winRate * 0.4 + recentWinRate * 0.6;
    return {
      total,
      wins: wins.length,
      losses: losses.length,
      winRate,
      avgCycleWon: avg(wins.map(r => Number(r.cycle_days) || 0).filter(n => n > 0)),
      avgCycleLost: avg(losses.map(r => Number(r.cycle_days) || 0).filter(n => n > 0)),
      avgAmountWon: avg(wins.map(r => Number(r.amount) || 0).filter(n => n > 0)),
      forecastWinRate,
    };
  }, [rows]);
};

export interface TrendPoint { period: string; wins: number; losses: number; winRate: number }

export const useWLTrend = (rows: WLAnalysisRow[] | undefined, granularity: "week" | "month" = "month"): TrendPoint[] => {
  return useMemo(() => {
    const map = new Map<string, { wins: number; losses: number }>();
    (rows ?? []).forEach(r => {
      const d = new Date(r.analyzed_at);
      let key: string;
      if (granularity === "week") {
        const onejan = new Date(d.getFullYear(), 0, 1);
        const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
        key = `${d.getFullYear()}-S${String(week).padStart(2, "0")}`;
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }
      const cur = map.get(key) ?? { wins: 0, losses: 0 };
      if (r.outcome === "won") cur.wins++; else cur.losses++;
      map.set(key, cur);
    });
    return Array.from(map.entries())
      .map(([period, v]) => ({
        period,
        wins: v.wins,
        losses: v.losses,
        winRate: v.wins + v.losses ? (v.wins / (v.wins + v.losses)) * 100 : 0,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [rows, granularity]);
};

export interface SalespersonStat {
  salespersonId: string;
  name: string;
  total: number;
  winRate: number;
  avgCycle: number;
  avgAmountWon: number;
  topWinReason: string;
  topLossReason: string;
  topCompetitor: string;
}

const top = (xs: (string | null | undefined)[]): string => {
  const m = new Map<string, number>();
  xs.forEach(x => { if (x) m.set(x, (m.get(x) ?? 0) + 1); });
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
};

export const aggregateBySalesperson = (
  rows: WLAnalysisRow[],
  salesMap: Map<string, string>, // sale_id -> salesperson_id
  spNames: Map<string, string>,  // salesperson_id -> name
): SalespersonStat[] => {
  const grouped = new Map<string, WLAnalysisRow[]>();
  rows.forEach(r => {
    const sp = salesMap.get(r.sale_id);
    if (!sp) return;
    const arr = grouped.get(sp) ?? [];
    arr.push(r);
    grouped.set(sp, arr);
  });
  return Array.from(grouped.entries())
    .map(([sp, list]) => {
      const wins = list.filter(r => r.outcome === "won");
      const losses = list.filter(r => r.outcome === "lost");
      const total = wins.length + losses.length;
      return {
        salespersonId: sp,
        name: spNames.get(sp) ?? "—",
        total,
        winRate: total ? (wins.length / total) * 100 : 0,
        avgCycle: avg(list.map(r => Number(r.cycle_days) || 0).filter(n => n > 0)),
        avgAmountWon: avg(wins.map(r => Number(r.amount) || 0).filter(n => n > 0)),
        topWinReason: top(wins.map(r => r.primary_reason)),
        topLossReason: top(losses.map(r => r.primary_reason)),
        topCompetitor: top(losses.map(r => r.competitor)),
      };
    })
    .sort((a, b) => b.winRate - a.winRate);
};

export interface CompetitorStat {
  name: string;
  encounters: number;
  losses: number;
  wins: number;
  winRateVs: number;
  avgLostAmount: number;
  topReason: string;
}

export const aggregateByCompetitor = (rows: WLAnalysisRow[]): CompetitorStat[] => {
  const grouped = new Map<string, WLAnalysisRow[]>();
  rows.forEach(r => {
    if (!r.competitor) return;
    const arr = grouped.get(r.competitor) ?? [];
    arr.push(r);
    grouped.set(r.competitor, arr);
  });
  return Array.from(grouped.entries())
    .map(([name, list]) => {
      const losses = list.filter(r => r.outcome === "lost");
      const wins = list.filter(r => r.outcome === "won");
      return {
        name,
        encounters: list.length,
        losses: losses.length,
        wins: wins.length,
        winRateVs: list.length ? (wins.length / list.length) * 100 : 0,
        avgLostAmount: avg(losses.map(r => Number(r.amount) || 0).filter(n => n > 0)),
        topReason: top(losses.map(r => r.primary_reason)),
      };
    })
    .sort((a, b) => b.encounters - a.encounters);
};

export interface ReasonMatrixCell { reason: string; stage: string; count: number }

export const aggregateReasonMatrix = (rows: WLAnalysisRow[]): ReasonMatrixCell[] => {
  const m = new Map<string, number>();
  rows.filter(r => r.outcome === "lost").forEach(r => {
    const k = `${r.primary_reason ?? "—"}||${r.lost_stage ?? "—"}`;
    m.set(k, (m.get(k) ?? 0) + 1);
  });
  return Array.from(m.entries()).map(([k, count]) => {
    const [reason, stage] = k.split("||");
    return { reason, stage, count };
  });
};
