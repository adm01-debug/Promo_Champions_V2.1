/**
 * ============================================================================
 * WIN/LOSS SCENARIO FORECAST — Background estatístico
 * ============================================================================
 *
 * Por que Standard Error of the Estimate (SEE) dos resíduos?
 * --------------------------------------------------------------------------
 * Ajustamos uma reta OLS  ŷ = β₀ + β₁·x  sobre a série histórica de winRate.
 * O SEE  σ̂ = √(SSE / (n−2))  mede o "ruído típico" em torno dessa reta —
 * isto é, o quanto a realidade costuma se desviar do modelo nos próprios
 * dados de treino. É a métrica natural para responder "quão errado eu
 * costumo estar?" sem precisar assumir uma distribuição prévia: vem direto
 * dos resíduos observados (y − ŷ).
 *
 * Como SEE vira "banda histórica" (fan de cenários)?
 * --------------------------------------------------------------------------
 * Para cada step futuro x, o **valor central** (cenário realista) é a própria
 * predição OLS  ŷ(x). A **largura da banda** é σ̂ multiplicado pelo fator
 * de inflação completo do prediction interval da OLS, que cresce conforme x
 * se afasta do centro x̄ dos dados:
 *
 *     width(x) = z · σ̂ · √( 1 + 1/n + (x − x̄)² / Sxx )       [SEE, z configurável]
 *     width(x) = t · σ̂ · √( 1 + 1/n + (x − x̄)² / Sxx )       [PI 95%, t-Student]
 *
 *   - O termo  1            → variância irredutível de uma observação futura.
 *   - O termo  1/n          → incerteza no intercept (β₀).
 *   - O termo  (x−x̄)²/Sxx  → incerteza no slope, que se amplifica longe do
 *     centro do treino. É **isso** que faz a banda se abrir no horizonte.
 *
 * Cenários otimista/pessimista são  ŷ(x) ± width(x), depois clamp em [0, 100]
 * porque winRate é percentual.
 *
 * Pontos históricos têm banda colapsada (otimista = realista = pessimista =
 * winRate observado): só medimos incerteza onde estamos extrapolando.
 *
 * Limitações conhecidas
 * --------------------------------------------------------------------------
 *   - Assume ruído homocedástico e aproximadamente normal (válido para n ≥ ~6).
 *   - n < 3 → bandas colapsam (sem regressão); o caller deve tratar como
 *     "dados insuficientes".
 *   - dof ≥ 30 → t converge para 1.96 (fallback normal).
 * ============================================================================
 */
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
  /** Human-readable label for the active mode (e.g. "SEE z=1.00 (PI)" or "PI 95% (t·σ)"). */
  bandLabel: string;
  /** Multiplicador `z` aplicado à largura SEE (1.00≈68% · 1.96≈95%). PI 95% ignora. */
  confidenceZ: number;
}

export interface ScenarioOptions {
  forecastSteps?: number;
  bandMode?: BandMode;
  /**
   * Multiplicador `z` aplicado à largura da banda no modo `see`.
   * Default `1` (≈68% de cobertura). Presets úteis:
   *   1.00=68%  ·  1.28=80%  ·  1.645=90%  ·  1.96=95%
   * Clamp em `[0.1, 5]`. Ignorado em `pi95` (que usa o t-Student).
   */
  confidenceZ?: number;
}

const Z_MIN = 0.1;
const Z_MAX = 5;
const clampZ = (v: number) =>
  Number.isFinite(v) ? Math.max(Z_MIN, Math.min(Z_MAX, v)) : 1;

const clamp01 = (v: number) => Math.max(0, Math.min(100, v));

/**
 * Two-tailed t-Student critical values at α=0.05 (i.e. t_{df, 0.975}) for df 1..30.
 * Usado apenas no modo PI 95%; para SEE 1σ o multiplicador é implicitamente 1.
 */
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
 * regression over historical winRate. Two band modes are supported, both using
 * the **full OLS prediction-interval inflation factor**:
 *
 * - `see`  (default): `width = z · σ · √(1 + 1/n + (x − x̄)² / Sxx)`. With z=1
 *   (default) ≈ 68% confidence; configurable via `confidenceZ` for other coverages.
 * - `pi95` (conservative): same shape, multiplied by the t-Student critical value
 *   at 95% — `width = t · σ · √(1 + 1/n + (x − x̄)² / Sxx)`.
 *
 * Historical points always have collapsed bands (= observed winRate), so the
 * uncertainty fan only opens at the forecast junction.
 *
 * Backward-compatible: `useWinLossScenarios(points, 3)` is equivalent to
 * `useWinLossScenarios(points, { forecastSteps: 3, bandMode: "see", confidenceZ: 1 })`.
 */
export const useWinLossScenarios = (
  points: TrendPoint[],
  optionsOrSteps: ScenarioOptions | number = 3,
): ScenarioForecast => {
  const opts: Required<ScenarioOptions> =
    typeof optionsOrSteps === "number"
      ? { forecastSteps: optionsOrSteps, bandMode: "see", confidenceZ: 1 }
      : {
          forecastSteps: optionsOrSteps.forecastSteps ?? 3,
          bandMode: optionsOrSteps.bandMode ?? "see",
          confidenceZ: clampZ(optionsOrSteps.confidenceZ ?? 1),
        };

  const { forecastSteps, bandMode, confidenceZ } = opts;

  return useMemo(() => {
    const safePoints = points ?? [];
    const n = safePoints.length;

    const seeLabel = `SEE z=${confidenceZ.toFixed(2)} (PI)`;
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
        confidenceZ,
      };
    }

    const xs = safePoints.map((_, i) => i);
    const ys = safePoints.map((p) => p.winRate);

    // ── OLS fit ─────────────────────────────────────────────────────────────
    // β₁ = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)²    β₀ = ȳ − β₁·x̄
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
    // SEE: σ̂ = √(SSE / dof). Mede o desvio típico dos resíduos do ajuste —
    // base de toda a banda de incerteza (ver doc do topo do arquivo).
    const residualStdDev = Math.sqrt(sse / dof);
    const t = tCritical975(dof);

    // Pontos históricos: banda colapsada — só extrapolamos incerteza no futuro.
    const historical: ScenarioPoint[] = safePoints.map((p) => ({
      period: p.period,
      realistic: p.winRate,
      optimistic: p.winRate,
      pessimistic: p.winRate,
      isForecast: false,
    }));

    // Fator de inflação do prediction interval OLS (fórmula completa):
    //   √(1 + 1/n + (x−x̄)²/Sxx)
    // Cresce com a distância de x ao centro dos dados → banda abre no futuro.
    const olsFactor = (x: number) => Math.sqrt(1 + 1 / n + ((x - meanX) ** 2) / sxx);

    const forecast: ScenarioPoint[] = [];
    for (let step = 1; step <= forecastSteps; step++) {
      const x = n + step - 1;
      const base = slope * x + intercept;

      // width = (multiplicador) · σ̂ · √(1 + 1/n + (x−x̄)²/Sxx)
      //   pi95 → t-Student (ignora confidenceZ);
      //   see  → confidenceZ.
      const multiplier = bandMode === "pi95" ? t : confidenceZ;
      const width = multiplier * residualStdDev * olsFactor(x);

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
      confidenceZ,
    };
  }, [points, forecastSteps, bandMode, confidenceZ]);
};
