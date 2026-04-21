import { useMemo } from "react";
import type { WLAnalysisRow } from "./useWinLossData";

export interface ICPCell {
  segment: string;
  bucket: string;
  total: number;
  wins: number;
  winRate: number;
}

const sizeBucket = (amount: number | null): string => {
  const v = Number(amount) || 0;
  if (v < 5_000) return "< R$5k";
  if (v < 20_000) return "R$5–20k";
  if (v < 50_000) return "R$20–50k";
  if (v < 100_000) return "R$50–100k";
  return "> R$100k";
};

export const useICPCorrelation = (rows: WLAnalysisRow[]) => {
  return useMemo(() => {
    const map = new Map<string, ICPCell>();
    rows.forEach(r => {
      const segment = r.segment || "—";
      const bucket = sizeBucket(r.amount as number | null);
      const key = `${segment}::${bucket}`;
      const existing = map.get(key) ?? { segment, bucket, total: 0, wins: 0, winRate: 0 };
      existing.total += 1;
      if (r.outcome === "won") existing.wins += 1;
      map.set(key, existing);
    });
    const cells = Array.from(map.values()).map(c => ({ ...c, winRate: c.total ? (c.wins / c.total) * 100 : 0 }));
    const segments = Array.from(new Set(cells.map(c => c.segment))).sort();
    const buckets = ["< R$5k", "R$5–20k", "R$20–50k", "R$50–100k", "> R$100k"];
    const bestCell = cells.filter(c => c.total >= 3).sort((a, b) => b.winRate - a.winRate)[0] ?? null;
    return { cells, segments, buckets, bestCell };
  }, [rows]);
};
