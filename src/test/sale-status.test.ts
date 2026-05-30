import { describe, it, expect } from 'vitest';
import {
  WON_SALE_STATUSES,
  LOST_SALE_STATUSES,
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

  it('treats pipeline stages as open (neither won nor lost)', () => {
    for (const s of ['pending', 'qualified', 'proposal', 'negotiation']) {
      expect(isOpenSaleStatus(s)).toBe(true);
      expect(isWonSaleStatus(s)).toBe(false);
      expect(isLostSaleStatus(s)).toBe(false);
    }
  });

  it('handles null/undefined/empty safely', () => {
    for (const s of [null, undefined, '']) {
      expect(isWonSaleStatus(s)).toBe(false);
      expect(isLostSaleStatus(s)).toBe(false);
      expect(isOpenSaleStatus(s)).toBe(false);
    }
  });
});
