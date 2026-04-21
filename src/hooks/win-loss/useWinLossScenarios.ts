import { useMemo } from "react";
import type { TrendPoint } from "./useWinLossAggregations";

export type BandMode = "see" | "pi95";

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
  /** Intercept (β₀) of the OLS linear fit. */
  intercept: number;
  /** Sum of squared errors Σ(y−ŷ)². */
  sse: number;
  /** Degrees of freedom (n−2, min 1). */
  dof: number;
  /** Mean of x used in the fit (period index). */
  meanX: number;
  /** Σ(x − x̄)² used in the fit. */
  sxx: number;
  /** Number of historical points actually used for the fit. */
  fitN: number;
  /** Active band mode used to compute uncertainty widths. */
  bandMode: BandMode;
  /** t critical value used (only for `pi95`); null in `see` mode. */
  tCritical: number | null;
  /** Human-readable label for the active mode (e.g. "SEE ±σ" or "PI 95% (t·σ)"). */
  bandLabel: string;
  /** Whether SEE mode is using the full OLS inflation factor instead of √(1+step/n). */
  seeUseOlsInflation: boolean;
}

export interface ScenarioOptions {
  forecastSteps?: number;
  bandMode?: BandMode;
  /**
   * Controls the SEE-mode width formula:
   * - `true` (default): full OLS prediction-interval inflation at 1σ —
   *   `width = σ · √(1 + 1/n + (x − x̄)² / Sxx)`. Statistically correct PI shape.
   * - `false`: legacy approximation `width = σ · √(1 + step/n)` (kept for
   *   backward compatibility / debugging).
   * Ignored in `pi95` mode (always uses the full PI factor with t multiplier).
   */
  seeUseOlsInflation?: boolean;
}

const clamp01 = (v: number) => Math.max(0, Math.min(100, v));

/** Two-tailed t-Student critical values at α=0.05 (i.e. t_{df, 0.975}) for df 1..30. */
const T_TABLE_975: Record<number, number> = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
  6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
  11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
  16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
  21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
  26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
};

export function tCritical975(dof: number): number {
  if (dof <= 0) return T_TABLE_975[1];
  if (dof >= 30) return 1.96;
  return T_TABLE_975[dof] ?? 1.96;
}

/**
 * Projects 3 scenarios (optimistic / realistic / pessimistic) using OLS linear
 * regression over historical winRate. Two band modes are supported:
 *
 * - `see`  (default): 1σ band using the full OLS prediction-interval inflation
 *   factor — `width = σ · √(1 + 1/n + (x − x̄)² / Sxx)`. ~68% confidence,
 *   widens correctly with the distance of the forecasted x to the centroid.
 *   Set `seeUseOlsInflation: false` to fall back to the legacy approximation
 *   `width = σ · √(1 + step/n)` (kept for debugging / backward compat).
 * - `pi95` (wider, conservative): same shape, multiplied by the t-Student
 *   critical value at 95% — `width = t · σ · √(1 + 1/n + (x − x̄)² / Sxx)`.
 *
 * Historical points always have collapsed bands (= observed winRate), so the
 * uncertainty fan only opens at the forecast junction.
 *
 * Backward-compatible: `useWinLossScenarios(points, 3)` is equivalent to
 * `useWinLossScenarios(points, { forecastSteps: 3, bandMode: "see", seeUseOlsInflation: true })`.
 */
export const useWinLossScenarios = (
  points: TrendPoint[],
  optionsOrSteps: ScenarioOptions | number = 3,
): ScenarioForecast => {
  const opts: Required<ScenarioOptions> =
    typeof optionsOrSteps === "number"
      ? { forecastSteps: optionsOrSteps, bandMode: "see", seeUseOlsInflation: true }
      : {
          forecastSteps: optionsOrSteps.forecastSteps ?? 3,
          bandMode: optionsOrSteps.bandMode ?? "see",
          seeUseOlsInflation: optionsOrSteps.seeUseOlsInflation ?? true,
        };

  const { forecastSteps, bandMode, seeUseOlsInflation } = opts;

  return useMemo(() => {
    const safePoints = points ?? [];
    const n = safePoints.length;

    const seeLabel = seeUseOlsInflation ? "SEE 1σ (PI)" : "SEE ±σ · √(1+step/n)";
    const labelFor = (mode: BandMode) => (mode === "pi95" ? "PI 95% (t·σ)" : seeLabel);

    // Need at least 3 points for a meaningful regression + residual σ.
    if (n < 3) {
      const flat: ScenarioPoint[] = safePoints.map((p) => ({
        period: p.period,
        realistic: p.winRate,
        optimistic: p.winRate,
        pessimistic: p.winRate,
        isForecast: false,
      }));
      return {
        series: flat,
        stdDev: 0,
        slope: 0,
        intercept: 0,
        sse: 0,
        dof: 1,
        meanX: 0,
        sxx: 0,
        fitN: n,
        bandMode,
        tCritical: bandMode === "pi95" ? tCritical975(Math.max(1, n - 2)) : null,
        bandLabel: labelFor(bandMode),
        seeUseOlsInflation,
      };
    }

    const xs = safePoints.map((_, i) => i);
    const ys = safePoints.map((p) => p.winRate);

    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;

    const num = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0);
    const sxx = xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0) || 1;

    const slope = num / sxx;
    const intercept = meanY - slope * meanX;

    const dof = Math.max(1, n - 2);
    const sse = ys.reduce((acc, y, i) => {
      const yhat = slope * xs[i] + intercept;
      return acc + (y - yhat) ** 2;
    }, 0);
    const residualStdDev = Math.sqrt(sse / dof);
    const t = tCritical975(dof);

    const historical: ScenarioPoint[] = safePoints.map((p) => ({
      period: p.period,
      realistic: p.winRate,
      optimistic: p.winRate,
      pessimistic: p.winRate,
      isForecast: false,
    }));

    const olsFactor = (x: number) => Math.sqrt(1 + 1 / n + ((x - meanX) ** 2) / sxx);

    const forecast: ScenarioPoint[] = [];
    for (let step = 1; step <= forecastSteps; step++) {
      const x = n + step - 1;
      const base = slope * x + intercept;

      let width: number;
      if (bandMode === "pi95") {
        width = t * residualStdDev * olsFactor(x);
      } else if (seeUseOlsInflation) {
        width = residualStdDev * olsFactor(x);
      } else {
        width = residualStdDev * Math.sqrt(1 + step / n);
      }

      forecast.push({
        period: `+${step}`,
        realistic: clamp01(base),
        optimistic: clamp01(base + width),
        pessimistic: clamp01(base - width),
        isForecast: true,
      });
    }

    return {
      series: [...historical, ...forecast],
      stdDev: residualStdDev,
      slope,
      intercept,
      sse,
      dof,
      meanX,
      sxx,
      fitN: n,
      bandMode,
      tCritical: bandMode === "pi95" ? t : null,
      bandLabel: labelFor(bandMode),
      seeUseOlsInflation,
    };
  }, [points, forecastSteps, bandMode, seeUseOlsInflation]);
};
