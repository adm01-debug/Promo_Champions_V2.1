import { describe, it, expect } from 'vitest';
import { summarizeMarkup, MARKUP_TIER_LABELS } from './markupHelpers';

describe('summarizeMarkup', () => {
  it('lista vazia → tudo zerado e sem média', () => {
    const s = summarizeMarkup([]);
    expect(s.average).toBeNull();
    expect(s.median).toBeNull();
    expect(s.total).toBe(0);
    expect(s.withCost).toBe(0);
    expect(s.counts).toEqual({ excellent: 0, healthy: 0, critical: 0, unknown: 0 });
  });

  it('classifica por faixa e ignora nulos na média', () => {
    const s = summarizeMarkup([50, 30, 10, null, undefined, NaN]);
    expect(s.counts).toEqual({ excellent: 1, healthy: 1, critical: 1, unknown: 3 });
    expect(s.total).toBe(6);
    expect(s.withCost).toBe(3);
    expect(s.average).toBe(30);
    expect(s.median).toBe(30);
  });

  it('mediana com quantidade par usa a média central', () => {
    expect(summarizeMarkup([10, 20, 30, 40]).median).toBe(25);
  });

  it('aceita markup negativo (prejuízo) como crítico', () => {
    const s = summarizeMarkup([-20, -10]);
    expect(s.counts.critical).toBe(2);
    expect(s.average).toBe(-15);
  });

  it('arredonda média em 2 casas', () => {
    expect(summarizeMarkup([10, 10, 11]).average).toBe(10.33);
  });

  it('somente nulos → unknown sem média', () => {
    const s = summarizeMarkup([null, null]);
    expect(s.counts.unknown).toBe(2);
    expect(s.average).toBeNull();
  });

  it('rótulos de faixa em pt-BR', () => {
    expect(MARKUP_TIER_LABELS.excellent).toContain('Excelente');
    expect(MARKUP_TIER_LABELS.unknown).toBe('Sem custo');
  });
});
