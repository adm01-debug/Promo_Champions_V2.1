import { useMemo } from "react";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

export interface ForecastResult {
  next14d: number;
  next30d: number;
  confidence: number; // 0-100
  slope: number;
  basePoints: number;
}

/**
 * Regressão linear simples sobre os últimos N pontos da série.
 * Confiança baseada em R² e quantidade de pontos.
 */
export const useWinLossForecast = (points: TrendPoint[], lastN = 8): ForecastResult => {
  return useMemo(() => {
    const series = points.slice(-lastN);
    if (series.length < 2) {
      const fallback = series[0]?.winRate ?? 0;
      return { next14d: fallback, next30d: fallback, confidence: series.length ? 30 : 0, slope: 0, basePoints: series.length };
    }
    const n = series.length;
    const xs = series.map((_, i) => i);
    const ys = series.map(s => s.winRate);
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    const num = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0);
    const den = xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0) || 1;
    const slope = num / den;
    const intercept = meanY - slope * meanX;

    const ssTot = ys.reduce((acc, y) => acc + (y - meanY) ** 2, 0) || 1;
    const ssRes = ys.reduce((acc, y, i) => acc + (y - (slope * xs[i] + intercept)) ** 2, 0);
    const r2 = Math.max(0, 1 - ssRes / ssTot);
    const confidence = Math.min(95, Math.round(r2 * 70 + (n / lastN) * 30));

    const next1 = slope * n + intercept;
    const next2 = slope * (n + 1) + intercept;
    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    return {
      next14d: clamp(next1),
      next30d: clamp(next2),
      confidence,
      slope,
      basePoints: n,
    };
  }, [points, lastN]);
};
