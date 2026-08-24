/**
 * Revenue Forecasting v2 — pure helpers.
 * Ensemble de 3 modelos:
 *   (a) Holt-Winters simplificado (level + trend)
 *   (b) Regressão linear via mínimos quadrados
 *   (c) Monte Carlo bootstrap (empirical distribution)
 *
 * Cada modelo devolve previsão pontual + intervalo P10/P50/P90.
 * O ensemble pondera pelo inverso do MAPE (menor erro histórico = maior peso).
 */

export interface HistoricalPoint {
  period: string; // ex.: "2026-01"
  revenue: number;
}

export interface ForecastPoint {
  period: string;
  p10: number;
  p50: number;
  p90: number;
  isForecast: true;
}

export interface ForecastResult {
  history: Array<{ period: string; revenue: number; isForecast: false }>;
  forecast: ForecastPoint[];
  ensemble: {
    weights: { holtWinters: number; linear: number; monteCarlo: number };
    mape: { holtWinters: number; linear: number; monteCarlo: number };
  };
  summary: {
    nextPeriodP50: number;
    horizonTotalP50: number;
    horizonTotalP10: number;
    horizonTotalP90: number;
    trend: 'up' | 'down' | 'flat';
  };
}

// ---------- utilitários numéricos ----------

const mean = (arr: number[]): number =>
  arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

const stdDev = (arr: number[]): number => {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
};

const quantile = (sorted: number[], q: number): number => {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};

/** MAPE em % (0 se não houver ponto válido). */
const mape = (actual: number[], predicted: number[]): number => {
  const pairs = actual.map((a, i) => [a, predicted[i]]).filter(([a]) => a !== 0);
  if (pairs.length === 0) return 0;
  const errs = pairs.map(([a, p]) => Math.abs((a - p) / a));
  return mean(errs) * 100;
};

// ---------- modelos ----------

/** Holt-Winters aditivo simples (level + trend). alpha=0.5, beta=0.3. */
function holtWintersForecast(data: number[], horizon: number): { fit: number[]; forecast: number[] } {
  if (data.length < 2) {
    const flat = new Array(horizon).fill(data[0] ?? 0);
    return { fit: [...data], forecast: flat };
  }
  const alpha = 0.5;
  const beta = 0.3;
  let level = data[0];
  let trend = data[1] - data[0];
  const fit: number[] = [level];
  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    fit.push(level);
  }
  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) forecast.push(level + h * trend);
  return { fit, forecast };
}

/** Regressão linear y = a + b·x (mínimos quadrados). */
function linearForecast(data: number[], horizon: number): { fit: number[]; forecast: number[] } {
  const n = data.length;
  if (n === 0) return { fit: [], forecast: new Array(horizon).fill(0) };
  if (n === 1) return { fit: [data[0]], forecast: new Array(horizon).fill(data[0]) };

  const xs = data.map((_, i) => i);
  const xMean = mean(xs);
  const yMean = mean(data);
  const num = xs.reduce((s, x, i) => s + (x - xMean) * (data[i] - yMean), 0);
  const den = xs.reduce((s, x) => s + (x - xMean) ** 2, 0) || 1;
  const b = num / den;
  const a = yMean - b * xMean;

  const fit = xs.map((x) => a + b * x);
  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) forecast.push(a + b * (n - 1 + h));
  return { fit, forecast };
}

/** Monte Carlo bootstrap: reamostra resíduos do fit médio. */
function monteCarloForecast(
  data: number[],
  horizon: number,
  sims: number = 1000,
  rng: () => number = Math.random,
): { fit: number[]; samples: number[][] } {
  if (data.length === 0) {
    return { fit: [], samples: Array.from({ length: horizon }, () => []) };
  }
  const m = mean(data);
  const fit = new Array(data.length).fill(m);
  const residuals = data.map((v) => v - m);

  const samples: number[][] = Array.from({ length: horizon }, () => []);
  for (let s = 0; s < sims; s++) {
    for (let h = 0; h < horizon; h++) {
      const r = residuals[Math.floor(rng() * residuals.length)];
      samples[h].push(m + r);
    }
  }
  return { fit, samples };
}

// ---------- ensemble ----------

export interface EnsembleOptions {
  horizon?: number;
  simulations?: number;
  rng?: () => number;
}

export function computeRevenueForecast(
  history: HistoricalPoint[],
  opts: EnsembleOptions = {},
): ForecastResult {
  const horizon = Math.max(1, Math.min(24, opts.horizon ?? 3));
  const sims = Math.max(50, Math.min(5000, opts.simulations ?? 1000));
  const rng = opts.rng ?? Math.random;

  const values = history.map((h) => h.revenue);

  const hw = holtWintersForecast(values, horizon);
  const lin = linearForecast(values, horizon);
  const mc = monteCarloForecast(values, horizon, sims, rng);

  const mapeHw = mape(values, hw.fit);
  const mapeLin = mape(values, lin.fit);
  const mapeMc = mape(values, mc.fit);

  // Peso ∝ 1 / (MAPE + 1); somam 1.
  const invHw = 1 / (mapeHw + 1);
  const invLin = 1 / (mapeLin + 1);
  const invMc = 1 / (mapeMc + 1);
  const totalInv = invHw + invLin + invMc || 1;
  const wHw = invHw / totalInv;
  const wLin = invLin / totalInv;
  const wMc = invMc / totalInv;

  // Std residual histórico (para HW/Linear com distribuição normal).
  const residuals = values.map((v, i) => v - (hw.fit[i] ?? v));
  const sigma = stdDev(residuals);
  const z10 = -1.2816;
  const z90 = 1.2816;

  const forecast: ForecastPoint[] = [];
  for (let h = 0; h < horizon; h++) {
    const hwPoint = hw.forecast[h];
    const linPoint = lin.forecast[h];
    const mcSamples = [...mc.samples[h]].sort((a, b) => a - b);
    const mcP10 = quantile(mcSamples, 0.1);
    const mcP50 = quantile(mcSamples, 0.5);
    const mcP90 = quantile(mcSamples, 0.9);

    const p50 = wHw * hwPoint + wLin * linPoint + wMc * mcP50;
    const spread = sigma * Math.sqrt(h + 1);
    const p10 = wHw * (hwPoint + z10 * spread) + wLin * (linPoint + z10 * spread) + wMc * mcP10;
    const p90 = wHw * (hwPoint + z90 * spread) + wLin * (linPoint + z90 * spread) + wMc * mcP90;

    // Extrapola label do período: incrementa mês YYYY-MM.
    const lastPeriod = forecast[h - 1]?.period ?? history[history.length - 1]?.period ?? '2026-01';
    forecast.push({
      period: incrementPeriod(lastPeriod),
      p10: Math.max(0, p10),
      p50: Math.max(0, p50),
      p90: Math.max(0, p90),
      isForecast: true,
    });
  }

  const nextP50 = forecast[0]?.p50 ?? 0;
  const horizonTotalP50 = forecast.reduce((s, f) => s + f.p50, 0);
  const horizonTotalP10 = forecast.reduce((s, f) => s + f.p10, 0);
  const horizonTotalP90 = forecast.reduce((s, f) => s + f.p90, 0);
  const lastHist = values[values.length - 1] ?? 0;
  const delta = nextP50 - lastHist;
  const trend: 'up' | 'down' | 'flat' =
    Math.abs(delta) < lastHist * 0.02 ? 'flat' : delta > 0 ? 'up' : 'down';

  return {
    history: history.map((h) => ({ ...h, isForecast: false as const })),
    forecast,
    ensemble: {
      weights: { holtWinters: wHw, linear: wLin, monteCarlo: wMc },
      mape: { holtWinters: mapeHw, linear: mapeLin, monteCarlo: mapeMc },
    },
    summary: {
      nextPeriodP50: nextP50,
      horizonTotalP50,
      horizonTotalP10,
      horizonTotalP90,
      trend,
    },
  };
}

/** Incrementa "YYYY-MM" em 1 mês; devolve string original se não reconhecido. */
export function incrementPeriod(period: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const next = new Date(y, m, 1); // m já é 1-based → passa a m+1 - 1 = m
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
}

// ---------- what-if simulator ----------

export interface WhatIfInputs {
  winRateDelta?: number; // ex.: +0.1 = +10pp
  avgTicketDelta?: number; // ex.: +0.15 = +15%
  velocityDelta?: number; // ex.: -0.2 = -20% (mais lento reduz receita no horizonte)
}

/** Aplica ajustes what-if multiplicativos à previsão base. */
export function applyWhatIf(base: ForecastResult, inputs: WhatIfInputs): ForecastResult {
  const wr = 1 + (inputs.winRateDelta ?? 0);
  const at = 1 + (inputs.avgTicketDelta ?? 0);
  const vel = 1 + (inputs.velocityDelta ?? 0);
  const multiplier = Math.max(0, wr * at * vel);

  const forecast = base.forecast.map((f) => ({
    ...f,
    p10: f.p10 * multiplier,
    p50: f.p50 * multiplier,
    p90: f.p90 * multiplier,
  }));

  const horizonTotalP50 = forecast.reduce((s, f) => s + f.p50, 0);
  const horizonTotalP10 = forecast.reduce((s, f) => s + f.p10, 0);
  const horizonTotalP90 = forecast.reduce((s, f) => s + f.p90, 0);
  const nextPeriodP50 = forecast[0]?.p50 ?? 0;

  return {
    ...base,
    forecast,
    summary: {
      ...base.summary,
      nextPeriodP50,
      horizonTotalP50,
      horizonTotalP10,
      horizonTotalP90,
    },
  };
}
