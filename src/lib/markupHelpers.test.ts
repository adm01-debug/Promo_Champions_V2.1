import { describe, it, expect } from 'vitest';
import {
  classifyMarkup,
  computeMarkupPct,
  computeMarginAmount,
  formatMarkupPct,
} from './markupHelpers';

describe('markupHelpers', () => {
  describe('computeMarkupPct', () => {
    it('calcula markup positivo', () => {
      expect(computeMarkupPct(150, 100)).toBe(50);
    });
    it('retorna 0 quando amount = custo', () => {
      expect(computeMarkupPct(100, 100)).toBe(0);
    });
    it('permite markup negativo (custo > preço)', () => {
      expect(computeMarkupPct(80, 100)).toBe(-20);
    });
    it('retorna null quando custo é 0', () => {
      expect(computeMarkupPct(100, 0)).toBeNull();
    });
    it('retorna null quando custo é negativo', () => {
      expect(computeMarkupPct(100, -5)).toBeNull();
    });
    it('retorna null quando custo é nulo', () => {
      expect(computeMarkupPct(100, null)).toBeNull();
    });
    it('retorna null quando amount é nulo', () => {
      expect(computeMarkupPct(null, 100)).toBeNull();
    });
    it('arredonda em 2 casas', () => {
      expect(computeMarkupPct(100, 33)).toBe(203.03);
    });
  });

  describe('computeMarginAmount', () => {
    it('calcula margem em reais', () => {
      expect(computeMarginAmount(150, 100)).toBe(50);
    });
    it('aceita margem negativa', () => {
      expect(computeMarginAmount(80, 100)).toBe(-20);
    });
    it('retorna null com entradas nulas', () => {
      expect(computeMarginAmount(null, 100)).toBeNull();
      expect(computeMarginAmount(100, null)).toBeNull();
    });
  });

  describe('classifyMarkup', () => {
    it('>= 40 → excellent', () => {
      expect(classifyMarkup(40).tier).toBe('excellent');
      expect(classifyMarkup(80).tier).toBe('excellent');
    });
    it('20–40 → healthy', () => {
      expect(classifyMarkup(20).tier).toBe('healthy');
      expect(classifyMarkup(39.99).tier).toBe('healthy');
    });
    it('< 20 → critical (inclui negativo)', () => {
      expect(classifyMarkup(19.99).tier).toBe('critical');
      expect(classifyMarkup(-10).tier).toBe('critical');
    });
    it('null/undefined/NaN → unknown', () => {
      expect(classifyMarkup(null).tier).toBe('unknown');
      expect(classifyMarkup(undefined).tier).toBe('unknown');
      expect(classifyMarkup(NaN).tier).toBe('unknown');
    });
  });

  describe('formatMarkupPct', () => {
    it('formata com % pt-BR', () => {
      expect(formatMarkupPct(42.5)).toBe('42,5%');
    });
    it('nulo vira travessão', () => {
      expect(formatMarkupPct(null)).toBe('—');
    });
  });
});
