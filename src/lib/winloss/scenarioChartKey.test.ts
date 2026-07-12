import { describe, it, expect } from 'vitest';
import { buildScenarioChartKey, type ScenarioChartKeyPoint } from './scenarioChartKey';

const point = (i: number, isForecast = false): ScenarioChartKeyPoint => ({
  period: `2026-0${i}`,
  realistic: 100 * i,
  pessimistic: 80 * i,
  optimistic: 120 * i,
  isForecast,
});

describe('buildScenarioChartKey', () => {
  const base = { fitN: 6, bandMode: 'sigma' as const, confidenceZ: 1.96, horizon: 3, stdDev: 12.5 };

  it('retorna scenario-empty quando data vazia', () => {
    expect(buildScenarioChartKey({ ...base, data: [] })).toBe('scenario-empty');
  });

  it('retorna scenario-empty quando fitN=0 mesmo com data', () => {
    expect(buildScenarioChartKey({ ...base, fitN: 0, data: [point(1)] })).toBe('scenario-empty');
  });

  it('retorna scenario-insufficient com fitN < 3', () => {
    const k = buildScenarioChartKey({ ...base, fitN: 2, data: [point(1), point(2)] });
    expect(k).toBe('scenario-insufficient-2-2026-01');
  });

  it('retorna scenario-insufficient-x quando primeiro period ausente', () => {
    const k = buildScenarioChartKey({ ...base, fitN: 1, data: [{ ...point(1), period: undefined }] });
    expect(k).toBe('scenario-insufficient-1-x');
  });

  it('gera key determinística para mesma entrada', () => {
    const data = [point(1), point(2), point(3), point(4, true)];
    const k1 = buildScenarioChartKey({ ...base, data });
    const k2 = buildScenarioChartKey({ ...base, data });
    expect(k1).toBe(k2);
    expect(k1).toContain('scenario-sigma-z1.96');
    expect(k1).toContain('h3');
    expect(k1).toContain('n4');
    expect(k1).toContain('fit6');
  });

  it('altera key quando data muda', () => {
    const k1 = buildScenarioChartKey({ ...base, data: [point(1), point(2), point(3)] });
    const k2 = buildScenarioChartKey({ ...base, data: [point(1), point(2), point(4)] });
    expect(k1).not.toBe(k2);
  });

  it('marca -partial quando ponto tem NaN', () => {
    const bad: ScenarioChartKeyPoint = { period: '2026-04', realistic: NaN, pessimistic: 0, optimistic: 0, isForecast: false };
    const k = buildScenarioChartKey({ ...base, data: [point(1), point(2), point(3), bad] });
    expect(k.endsWith('-partial')).toBe(true);
  });

  it('sanitiza stdDev/confidenceZ não-finitos', () => {
    const k = buildScenarioChartKey({ ...base, stdDev: NaN, confidenceZ: Infinity, data: [point(1), point(2), point(3)] });
    expect(k).toContain('σ0.00');
    expect(k).toContain('z1.00');
  });

  it('inclui confidenceLevel quando fornecido', () => {
    const k = buildScenarioChartKey({ ...base, confidenceLevel: 0.99, data: [point(1), point(2), point(3)] });
    expect(k).toContain('l0.99');
  });
});
