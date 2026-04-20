import { useMemo } from "react";
import type { TrendPoint } from "./useWinLossAggregations";

export interface AnomalyResult {
  isAnomaly: boolean;
  zScore: number;
  direction: "up" | "down" | "stable";
  current: number;
  mean: number;
  stdDev: number;
  period: string | null;
}

/**
 * Detects an anomaly in the most recent point of the trend series using z-score.
 * |z| > 2 is flagged as anomalous.
 */
export const useWinLossAnomalies = (series: TrendPoint[]): AnomalyResult => {
  return useMemo(() => {
    if (series.length < 4) {
      return { isAnomaly: false, zScore: 0, direction: "stable", current: 0, mean: 0, stdDev: 0, period: null };
    }
    const last = series[series.length - 1];
    const history = series.slice(0, -1).map(s => s.winRate);
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((acc, v) => acc + (v - mean) ** 2, 0) / history.length;
    const stdDev = Math.sqrt(variance);
    const zScore = stdDev > 0 ? (last.winRate - mean) / stdDev : 0;
    const isAnomaly = Math.abs(zScore) > 2;
    const direction: "up" | "down" | "stable" = zScore > 0.5 ? "up" : zScore < -0.5 ? "down" : "stable";
    return {
      isAnomaly,
      zScore,
      direction,
      current: last.winRate,
      mean,
      stdDev,
      period: last.period,
    };
  }, [series]);
};
