import { describe, it, expect } from 'vitest';
import { fmtCurrency, fmtCompact } from '../raceFormatters';

describe('raceFormatters — fmtCurrency', () => {
  it('formats zero', () => {
    expect(fmtCurrency(0)).toMatch(/R\$\s?0/);
  });

  it('formats positive integer', () => {
    expect(fmtCurrency(12345)).toMatch(/R\$\s?12\.345/);
  });

  it('rounds to 0 decimals', () => {
    const out = fmtCurrency(99.6);
    expect(out).not.toMatch(/,/);
  });

  it('handles negatives', () => {
    expect(fmtCurrency(-1000)).toMatch(/-/);
  });

  it.each([NaN, Infinity, -Infinity])('falls back to 0 for non-finite %s', (v) => {
    expect(fmtCurrency(v)).toMatch(/R\$\s?0/);
  });

  it('fuzz: 200 random values return a string with R$', () => {
    for (let i = 0; i < 200; i++) {
      const v = (Math.random() - 0.5) * 1e9;
      const out = fmtCurrency(v);
      expect(typeof out).toBe('string');
      expect(out).toContain('R$');
    }
  });
});

describe('raceFormatters — fmtCompact', () => {
  it('formats zero', () => {
    expect(fmtCompact(0)).toBe('0');
  });

  it('uses compact suffix for thousands', () => {
    const out = fmtCompact(12_500);
    // pt-BR uses "mil" / "mi"
    expect(out).toMatch(/mil/i);
  });

  it('uses compact suffix for millions', () => {
    const out = fmtCompact(2_500_000);
    expect(out).toMatch(/mi/i);
  });

  it.each([NaN, Infinity, -Infinity])('falls back to 0 for non-finite %s', (v) => {
    expect(fmtCompact(v)).toBe('0');
  });

  it('fuzz: 200 random values return a non-empty string', () => {
    for (let i = 0; i < 200; i++) {
      const v = Math.random() * 1e8;
      const out = fmtCompact(v);
      expect(out.length).toBeGreaterThan(0);
    }
  });
});
