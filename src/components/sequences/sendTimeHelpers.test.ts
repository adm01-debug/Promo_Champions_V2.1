import { describe, expect, it } from 'vitest';
import { formatWindow, normalizeScore } from './sendTimeHelpers';

describe('formatWindow', () => {
  it('formata dia da semana e hora com dois digitos', () => {
    expect(formatWindow(1, 9)).toBe('Seg 09:00');
    expect(formatWindow(6, 14)).toBe('Sáb 14:00');
  });

  it('usa interrogacao para dia fora da faixa', () => {
    expect(formatWindow(9, 10)).toBe('? 10:00');
  });
});

describe('normalizeScore', () => {
  it('da 100% para a melhor janela do contato', () => {
    expect(normalizeScore(42, 42)).toBe(100);
  });

  it('é proporcional à melhor janela', () => {
    expect(normalizeScore(21, 42)).toBe(50);
  });

  it('devolve 0 quando o maior score é zero ou negativo', () => {
    expect(normalizeScore(0, 0)).toBe(0);
    expect(normalizeScore(5, -1)).toBe(0);
  });

  it('nunca estoura a barra nem fica negativa', () => {
    expect(normalizeScore(100, 42)).toBe(100);
    expect(normalizeScore(-10, 42)).toBe(0);
  });

  it('devolve 0 para valores nao finitos', () => {
    expect(normalizeScore(Number.NaN, 42)).toBe(0);
    expect(normalizeScore(10, Number.POSITIVE_INFINITY)).toBe(0);
  });
});
