import { describe, it, expect } from 'vitest';
import { getLocalISODate } from './dateHelpers';

describe('getLocalISODate', () => {
  it('formata data no formato YYYY-MM-DD', () => {
    const out = getLocalISODate(new Date(2026, 3, 15)); // 15/abr/2026 local
    expect(out).toBe('2026-04-15');
  });

  it('usa Date.now() como default', () => {
    expect(getLocalISODate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('mês/dia com zero-pad', () => {
    expect(getLocalISODate(new Date(2026, 0, 1))).toBe('2026-01-01');
    expect(getLocalISODate(new Date(2026, 11, 9))).toBe('2026-12-09');
  });
});
