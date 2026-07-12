import { describe, it, expect } from 'vitest';
import {
  computeStageDeltas,
  formatDelta,
  getStageColor,
  getStageWidth,
  type FunnelStageBasic,
} from './funnelReportHelpers';

const stage = (over: Partial<FunnelStageBasic>): FunnelStageBasic => ({
  stage: 'x',
  count: 0,
  value: 0,
  conversionRate: 0,
  dropOffRate: 0,
  ...over,
});

describe('funnelReportHelpers.computeStageDeltas', () => {
  it('calcula delta absoluto, percentual, valor e conversão por estágio', () => {
    const current = [
      stage({ stage: 'lead', count: 120, value: 12000, conversionRate: 60 }),
      stage({ stage: 'proposal', count: 40, value: 8000, conversionRate: 33.3 }),
    ];
    const previous = [
      stage({ stage: 'lead', count: 100, value: 10000, conversionRate: 50 }),
      stage({ stage: 'proposal', count: 30, value: 6000, conversionRate: 30 }),
    ];
    const result = computeStageDeltas(current, previous);
    expect(result[0]).toMatchObject({
      stage: 'lead',
      countDelta: 20,
      countDeltaPct: 20,
      valueDelta: 2000,
      conversionDelta: 10,
    });
    expect(result[1].countDeltaPct).toBeCloseTo(33.3, 1);
  });

  it('trata previous ausente como zero (novo estágio ganha 100%)', () => {
    const result = computeStageDeltas(
      [stage({ stage: 'novo', count: 10 })],
      [],
    );
    expect(result[0]).toMatchObject({ countDelta: 10, countDeltaPct: 100, valueDelta: 0 });
  });

  it('retorna 0% quando previous é 0 e current também', () => {
    const r = computeStageDeltas([stage({ stage: 'a', count: 0 })], [stage({ stage: 'a', count: 0 })]);
    expect(r[0].countDeltaPct).toBe(0);
  });

  it('retorna delta negativo quando estágio encolhe', () => {
    const r = computeStageDeltas(
      [stage({ stage: 'a', count: 5, value: 100, conversionRate: 10 })],
      [stage({ stage: 'a', count: 10, value: 200, conversionRate: 20 })],
    );
    expect(r[0].countDelta).toBe(-5);
    expect(r[0].countDeltaPct).toBe(-50);
    expect(r[0].valueDelta).toBe(-100);
    expect(r[0].conversionDelta).toBe(-10);
  });
});

describe('funnelReportHelpers.formatDelta', () => {
  it('formata percentuais com sinal e 1 casa decimal', () => {
    expect(formatDelta(12.5, 'pct')).toBe('+12.5%');
    expect(formatDelta(-3, 'pct')).toBe('-3.0%');
    expect(formatDelta(0, 'pct')).toBe('0.0%');
  });

  it('formata absolutos com locale pt-BR', () => {
    expect(formatDelta(1500)).toBe('+1.500');
    expect(formatDelta(-42)).toBe('-42');
  });

  it('formata moeda com sinal', () => {
    const positive = formatDelta(1000, 'currency');
    expect(positive.startsWith('+')).toBe(true);
    expect(positive).toContain('R$');
    const negative = formatDelta(-500, 'currency');
    expect(negative.startsWith('-')).toBe(true);
  });
});

describe('funnelReportHelpers.getStageColor', () => {
  it('retorna primary puro quando só há um estágio', () => {
    expect(getStageColor(0, 1)).toBe('hsl(var(--primary))');
    expect(getStageColor(0, 0)).toBe('hsl(var(--primary))');
  });

  it('reduz opacidade progressivamente conforme index', () => {
    const first = getStageColor(0, 5);
    const last = getStageColor(4, 5);
    expect(first).toContain('1.00');
    // último = 1 - (4/5)*0.45 = 0.64
    expect(last).toContain('0.64');
  });
});

describe('funnelReportHelpers.getStageWidth', () => {
  it('proporcional a maxCount', () => {
    expect(getStageWidth(100, 100)).toBe(100);
    expect(getStageWidth(50, 100)).toBe(50);
  });

  it('respeita mínimo de 15% mesmo com contagens ínfimas', () => {
    expect(getStageWidth(1, 1000)).toBe(15);
    expect(getStageWidth(0, 100)).toBe(15);
  });

  it('retorna 0 quando maxCount é 0 ou negativo', () => {
    expect(getStageWidth(50, 0)).toBe(0);
    expect(getStageWidth(50, -10)).toBe(0);
  });
});
