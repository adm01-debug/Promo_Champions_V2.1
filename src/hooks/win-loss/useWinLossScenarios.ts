import { useMemo } from "react";
import type { TrendPoint } from "./useWinLossAggregations";

export interface ScenarioPoint {
  period: string;
  realistic: number;
  optimistic: number;
  pessimistic: number;
  isForecast: boolean;
}

export interface ScenarioForecast {
  series: ScenarioPoint[];
  stdDev: number;
  slope: number;
}

/**
 * Projeta 3 cenários (otimista/realista/pessimista) com base em regressão linear
 * sobre os pontos históricos + bandas de ±1σ.
 */
export const useWinLossScenarios = (points: TrendPoint[], forecastSteps = 3): ScenarioForecast => {
  return useMemo(() => {
    if (points.length < 2) {
      return {
        series: points.map(p => ({ period: p.period, realistic: p.winRate, optimistic: p.winRate, pessimistic: p.winRate, isForecast: false })),
        stdDev: 0,
        slope: 0,
      };
    }
    const n = points.length;
    const xs = points.map((_, i) => i);
    const ys = points.map(p => p.winRate);
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    const num = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0);
    const den = xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0) || 1;
    const slope = num / den;
    const intercept = meanY - slope * meanX;
    const variance = ys.reduce((acc, y) => acc + (y - meanY) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);

    const clamp = (v: number) => Math.max(0, Math.min(100, v));

    const historical: ScenarioPoint[] = points.map(p => ({
      period: p.period,
      realistic: p.winRate,
      optimistic: p.winRate,
      pessimistic: p.winRate,
      isForecast: false,
    }));

    const forecast: ScenarioPoint[] = [];
    for (let i = 1; i <= forecastSteps; i++) {
      const x = n + i - 1;
      const base = slope * x + intercept;
      forecast.push({
        period: `+${i}`,
        realistic: clamp(base),
        optimistic: clamp(base + stdDev),
        pessimistic: clamp(base - stdDev),
        isForecast: true,
      });
    }
    return { series: [...historical, ...forecast], stdDev, slope };
  }, [points, forecastSteps]);
};
