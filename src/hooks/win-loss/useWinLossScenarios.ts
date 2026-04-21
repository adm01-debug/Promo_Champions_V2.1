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
  /** Standard error of the regression estimate (residual σ), in winRate percentage points. */
  stdDev: number;
  /** Slope of the linear trend (pp per period). */
  slope: number;
  /** Number of historical points actually used for the fit. */
  fitN: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(100, v));

/**
 * Projects 3 scenarios (optimistic / realistic / pessimistic) using OLS linear
 * regression over historical winRate. Confidence bands are derived from the
 * **residual standard error** (deviation around the fitted line, not around the
 * mean), which honestly reflects historical volatility AROUND the trend instead
 * of being inflated by the trend itself.
 *
 * Bands widen with horizon following a simplified prediction-interval rule:
 *   σ_step = σ * sqrt(1 + step / n)
 *
 * Historical points return realistic = optimistic = pessimistic = observed
 * winRate, so the band visually opens only at the forecast junction.
 */
export const useWinLossScenarios = (
  points: TrendPoint[],
  forecastSteps = 3,
): ScenarioForecast => {
  return useMemo(() => {
    const safePoints = points ?? [];
    const n = safePoints.length;

    // Need at least 3 points for a meaningful regression + residual σ.
    if (n < 3) {
      const flat: ScenarioPoint[] = safePoints.map((p) => ({
        period: p.period,
        realistic: p.winRate,
        optimistic: p.winRate,
        pessimistic: p.winRate,
        isForecast: false,
      }));
      return { series: flat, stdDev: 0, slope: 0, fitN: n };
    }

    const xs = safePoints.map((_, i) => i);
    const ys = safePoints.map((p) => p.winRate);

    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;

    const num = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0);
    const den = xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0) || 1;

    const slope = num / den;
    const intercept = meanY - slope * meanX;

    // Residuals around the regression line (not around the mean).
    // Use n-2 degrees of freedom for an unbiased Standard Error of Estimate.
    const dof = Math.max(1, n - 2);
    const sse = ys.reduce((acc, y, i) => {
      const yhat = slope * xs[i] + intercept;
      return acc + (y - yhat) ** 2;
    }, 0);
    const residualStdDev = Math.sqrt(sse / dof);

    // Historical: bands collapsed (observed value), so the chart shows a clean
    // junction where uncertainty starts.
    const historical: ScenarioPoint[] = safePoints.map((p) => ({
      period: p.period,
      realistic: p.winRate,
      optimistic: p.winRate,
      pessimistic: p.winRate,
      isForecast: false,
    }));

    // Forecast: bands widen with horizon (prediction-interval style).
    const forecast: ScenarioPoint[] = [];
    for (let step = 1; step <= forecastSteps; step++) {
      const x = n + step - 1;
      const base = slope * x + intercept;
      const stepStdDev = residualStdDev * Math.sqrt(1 + step / n);
      forecast.push({
        period: `+${step}`,
        realistic: clamp01(base),
        optimistic: clamp01(base + stepStdDev),
        pessimistic: clamp01(base - stepStdDev),
        isForecast: true,
      });
    }

    return {
      series: [...historical, ...forecast],
      stdDev: residualStdDev,
      slope,
      fitN: n,
    };
  }, [points, forecastSteps]);
};
