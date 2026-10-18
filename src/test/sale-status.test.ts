import { describe, it, expect } from 'vitest';
import {
  WON_SALE_STATUSES,
  LOST_SALE_STATUSES,
  OPEN_SALE_STATUSES,
  PROSPECT_SALE_STATUSES,
  isWonSaleStatus,
  isLostSaleStatus,
  isOpenSaleStatus,
} from '../constants';

describe('sale status helpers', () => {
  it('treats manual and integration successful statuses as won', () => {
    expect(WON_SALE_STATUSES).toEqual(['completed', 'won', 'closed']);
    for (const s of WON_SALE_STATUSES) {
      expect(isWonSaleStatus(s)).toBe(true);
      expect(isOpenSaleStatus(s)).toBe(false);
      expect(isLostSaleStatus(s)).toBe(false);
    }
  });

  it('recognises lost statuses', () => {
    for (const s of LOST_SALE_STATUSES) {
      expect(isLostSaleStatus(s)).toBe(true);
      expect(isWonSaleStatus(s)).toBe(false);
      expect(isOpenSaleStatus(s)).toBe(false);
    }
  });

  it('treats every canonical open stage as open (enum completo)', () => {
    expect(OPEN_SALE_STATUSES).toEqual([
      'lead',
      'pending',
      'qualified',
      'proposal',
      'negotiation',
      'prospecting',
    ]);
    for (const s of OPEN_SALE_STATUSES) {
      expect(isOpenSaleStatus(s)).toBe(true);
      expect(isWonSaleStatus(s)).toBe(false);
      expect(isLostSaleStatus(s)).toBe(false);
    }
  });

  it('prospect statuses são um subconjunto dos abertos', () => {
    for (const s of PROSPECT_SALE_STATUSES) {
      expect(isOpenSaleStatus(s)).toBe(true);
      expect(OPEN_SALE_STATUSES).toContain(s);
    }
  });

  it('enum do CHECK constraint é exatamente won+lost+open (11 valores)', () => {
    const all = new Set([
      ...WON_SALE_STATUSES,
      ...LOST_SALE_STATUSES,
      ...OPEN_SALE_STATUSES,
    ]);
    expect(all.size).toBe(11);
    expect(all.size).toBe(
      WON_SALE_STATUSES.length + LOST_SALE_STATUSES.length + OPEN_SALE_STATUSES.length
    );
  });

  it('handles null/undefined/empty safely', () => {
    for (const s of [null, undefined, '']) {
      expect(isWonSaleStatus(s)).toBe(false);
      expect(isLostSaleStatus(s)).toBe(false);
      expect(isOpenSaleStatus(s)).toBe(false);
    }
  });

  it('legado "open" (fora do CHECK) ainda classifica como aberto', () => {
    // 'open' existe no tipo SaleStatus como valor legado fora da constraint —
    // a definição negativa de isOpenSaleStatus cobre esse resíduo.
    expect(isOpenSaleStatus('open')).toBe(true);
    expect(isWonSaleStatus('open')).toBe(false);
    expect(isLostSaleStatus('open')).toBe(false);
  });
});
