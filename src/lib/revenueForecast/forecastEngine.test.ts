import { describe, it, expect } from 'vitest';
import {
  computeRevenueForecast,
  applyWhatIf,
  incrementPeriod,
  type HistoricalPoint,
  type ForecastResult,
} from './forecastEngine';

const history: HistoricalPoint[] = [
  { period: '2026-01', revenue: 100_000 },
  { period: '2026-02', revenue: 110_000 },
  { period: '2026-03', revenue: 125_000 },
  { period: '2026-04', revenue: 140_000 },
  { period: '2026-05', revenue: 155_000 },
  { period: '2026-06', revenue: 170_000 },
];

// RNG determinístico
const seededRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
};

describe('computeRevenueForecast', () => {
  it('produz horizonte solicitado', () => {
    const r = computeRevenueForecast(history, { horizon: 3, rng: seededRng(42) });
    expect(r.forecast).toHaveLength(3);
    r.forecast.forEach((f) => expect(f.isForecast).toBe(true));
  });

  it('respeita bounds do horizonte (1-24)', () => {
    expect(computeRevenueForecast(history, { horizon: 0 }).forecast).toHaveLength(1);
    expect(computeRevenueForecast(history, { horizon: 100 }).forecast).toHaveLength(24);
  });

  it('usa defaults quando opts não fornecido (cobre horizon ?? 3 e simulations ?? 1000)', () => {
    const r = computeRevenueForecast(history);
    expect(r.forecast).toHaveLength(3);
  });

  it('pesos do ensemble somam ~1', () => {
    const r = computeRevenueForecast(history, { horizon: 3, rng: seededRng(1) });
    const { holtWinters, linear, monteCarlo } = r.ensemble.weights;
    expect(holtWinters + linear + monteCarlo).toBeCloseTo(1, 6);
  });

  it('p10 <= p50 <= p90 em todos os pontos', () => {
    const r = computeRevenueForecast(history, { horizon: 6, rng: seededRng(7) });
    r.forecast.forEach((f) => {
      expect(f.p10).toBeLessThanOrEqual(f.p50);
      expect(f.p50).toBeLessThanOrEqual(f.p90);
    });
  });

  it('nunca produz valores negativos (clamp em 0)', () => {
    const decline: HistoricalPoint[] = [
      { period: '2026-01', revenue: 100 },
      { period: '2026-02', revenue: 50 },
      { period: '2026-03', revenue: 10 },
    ];
    const r = computeRevenueForecast(decline, { horizon: 12, rng: seededRng(3) });
    r.forecast.forEach((f) => {
      expect(f.p10).toBeGreaterThanOrEqual(0);
      expect(f.p50).toBeGreaterThanOrEqual(0);
      expect(f.p90).toBeGreaterThanOrEqual(0);
    });
  });

  it('detecta tendência de alta', () => {
    const r = computeRevenueForecast(history, { horizon: 3, rng: seededRng(5) });
    expect(r.summary.trend).toBe('up');
  });

  it('detecta tendência flat com série constante', () => {
    const flat: HistoricalPoint[] = Array.from({ length: 6 }, (_, i) => ({
      period: `2026-0${i + 1}`,
      revenue: 100_000,
    }));
    const r = computeRevenueForecast(flat, { horizon: 3, rng: seededRng(9) });
    expect(r.summary.trend).toBe('flat');
  });

  it('lida com histórico vazio', () => {
    const r = computeRevenueForecast([], { horizon: 3, rng: seededRng(0) });
    expect(r.forecast).toHaveLength(3);
    expect(r.summary.horizonTotalP50).toBe(0);
  });

  it('lida com 1 ponto histórico', () => {
    const r = computeRevenueForecast([{ period: '2026-01', revenue: 50_000 }], {
      horizon: 3,
      rng: seededRng(0),
    });
    expect(r.forecast).toHaveLength(3);
  });

  it('resultado determinístico com RNG seeded', () => {
    const r1 = computeRevenueForecast(history, { horizon: 4, rng: seededRng(123) });
    const r2 = computeRevenueForecast(history, { horizon: 4, rng: seededRng(123) });
    expect(r1.summary.horizonTotalP50).toBeCloseTo(r2.summary.horizonTotalP50, 6);
  });

  it('summary.horizonTotalP50 soma os p50 do forecast', () => {
    const r = computeRevenueForecast(history, { horizon: 3, rng: seededRng(11) });
    const sum = r.forecast.reduce((s, f) => s + f.p50, 0);
    expect(r.summary.horizonTotalP50).toBeCloseTo(sum, 6);
  });

  it('respeita bounds de simulações (50-5000)', () => {
    // Só valida que não crasha — resultados dependem do RNG mesmo com sims diferentes.
    expect(() => computeRevenueForecast(history, { horizon: 3, simulations: 10 })).not.toThrow();
    expect(() => computeRevenueForecast(history, { horizon: 3, simulations: 99999 })).not.toThrow();
  });
});

describe('applyWhatIf', () => {
  const base = computeRevenueForecast(history, { horizon: 3, rng: seededRng(1) });

  it('sem deltas → multiplicador 1 (idempotente)', () => {
    const r = applyWhatIf(base, {});
    r.forecast.forEach((f, i) => {
      expect(f.p50).toBeCloseTo(base.forecast[i].p50, 6);
    });
  });

  it('winRateDelta +0.1 aumenta 10%', () => {
    const r = applyWhatIf(base, { winRateDelta: 0.1 });
    expect(r.forecast[0].p50).toBeCloseTo(base.forecast[0].p50 * 1.1, 6);
  });

  it('deltas combinados multiplicam', () => {
    const r = applyWhatIf(base, { winRateDelta: 0.1, avgTicketDelta: 0.2 });
    expect(r.forecast[0].p50).toBeCloseTo(base.forecast[0].p50 * 1.1 * 1.2, 6);
  });

  it('velocityDelta negativa reduz', () => {
    const r = applyWhatIf(base, { velocityDelta: -0.5 });
    expect(r.forecast[0].p50).toBeCloseTo(base.forecast[0].p50 * 0.5, 6);
  });

  it('deltas extremos clampados em 0', () => {
    const r = applyWhatIf(base, { winRateDelta: -2 }); // -200%
    r.forecast.forEach((f) => expect(f.p50).toBe(0));
  });

  it('recalcula summary após ajuste', () => {
    const r = applyWhatIf(base, { winRateDelta: 0.5 });
    const sum = r.forecast.reduce((s, f) => s + f.p50, 0);
    expect(r.summary.horizonTotalP50).toBeCloseTo(sum, 6);
  });
});

describe('defensive branch guards', () => {
  it('totalInv || 1 fallback: NaN revenues produzem totalInv=NaN que cai no || 1', () => {
    const nanHistory: HistoricalPoint[] = [
      { period: '2026-01', revenue: NaN },
      { period: '2026-02', revenue: NaN },
    ];
    expect(() => computeRevenueForecast(nanHistory, { horizon: 1, rng: seededRng(0) })).not.toThrow();
    const r = computeRevenueForecast(nanHistory, { horizon: 1, rng: seededRng(0) });
    // MAPE → NaN → invHw/Lin/Mc = NaN → totalInv = NaN || 1 = 1 (branch hit)
    // weights = NaN / 1 = NaN (expected side-effect)
    expect(Number.isNaN(r.ensemble.weights.holtWinters)).toBe(true);
    expect(r.forecast).toHaveLength(1);
  });

  it('applyWhatIf com forecast vazio: forecast[0]?.p50 ?? 0 retorna 0', () => {
    const emptyBase: ForecastResult = {
      history: [],
      forecast: [],
      ensemble: {
        weights: { holtWinters: 1 / 3, linear: 1 / 3, monteCarlo: 1 / 3 },
        mape: { holtWinters: 0, linear: 0, monteCarlo: 0 },
      },
      summary: {
        nextPeriodP50: 0,
        horizonTotalP50: 0,
        horizonTotalP10: 0,
        horizonTotalP90: 0,
        trend: 'flat',
      },
    };
    const r = applyWhatIf(emptyBase, { winRateDelta: 0.5 });
    expect(r.summary.nextPeriodP50).toBe(0);
    expect(r.forecast).toHaveLength(0);
  });
});

describe('incrementPeriod', () => {
  it('avança dentro do ano', () => {
    expect(incrementPeriod('2026-03')).toBe('2026-04');
  });

  it('vira o ano em dezembro', () => {
    expect(incrementPeriod('2026-12')).toBe('2027-01');
  });

  it('devolve inalterado para formato inválido', () => {
    expect(incrementPeriod('bogus')).toBe('bogus');
    expect(incrementPeriod('')).toBe('');
  });
});
