import { describe, it, expect } from 'vitest';
import { severityFromScore } from './severityFromScore';

describe('severityFromScore', () => {
  it('classifica critical em score >= 80', () => {
    expect(severityFromScore(80)).toBe('critical');
    expect(severityFromScore(95)).toBe('critical');
    expect(severityFromScore(100)).toBe('critical');
  });

  it('classifica high entre 65 e 79', () => {
    expect(severityFromScore(65)).toBe('high');
    expect(severityFromScore(72)).toBe('high');
    expect(severityFromScore(79.99)).toBe('high');
  });

  it('classifica medium entre 50 e 64', () => {
    expect(severityFromScore(50)).toBe('medium');
    expect(severityFromScore(58)).toBe('medium');
    expect(severityFromScore(64.99)).toBe('medium');
  });

  it('classifica low abaixo de 50', () => {
    expect(severityFromScore(0)).toBe('low');
    expect(severityFromScore(25)).toBe('low');
    expect(severityFromScore(49.99)).toBe('low');
  });

  it('lida com valores negativos como low', () => {
    expect(severityFromScore(-10)).toBe('low');
    expect(severityFromScore(-1e10)).toBe('low');
  });

  it('lida com valores extremos', () => {
    expect(severityFromScore(1e20)).toBe('critical');
    expect(severityFromScore(Infinity)).toBe('critical');
  });
});
