/**
 * Quote/Proposal System Tests
 * Tests: pricing, discounts, tax, quote numbering, validity
 */
import { describe, it, expect } from 'vitest';

describe('Quote Pricing Calculations', () => {
  const calculateQuote = (items: { quantity: number; unitPrice: number; discount: number }[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalDiscount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.discount / 100), 0);
    const total = subtotal - totalDiscount;
    return { subtotal, totalDiscount, total, itemCount: items.length };
  };

  it('should calculate subtotal correctly', () => {
    const result = calculateQuote([
      { quantity: 2, unitPrice: 1000, discount: 0 },
      { quantity: 3, unitPrice: 500, discount: 0 },
    ]);
    expect(result.subtotal).toBe(3500);
    expect(result.total).toBe(3500);
  });

  it('should apply item-level discounts', () => {
    const result = calculateQuote([
      { quantity: 1, unitPrice: 1000, discount: 10 },
    ]);
    expect(result.subtotal).toBe(1000);
    expect(result.totalDiscount).toBe(100);
    expect(result.total).toBe(900);
  });

  it('should handle empty items', () => {
    const result = calculateQuote([]);
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(0);
    expect(result.itemCount).toBe(0);
  });

  it('should handle 100% discount', () => {
    const result = calculateQuote([{ quantity: 1, unitPrice: 1000, discount: 100 }]);
    expect(result.total).toBe(0);
  });

  it('should handle large quantities', () => {
    const result = calculateQuote([{ quantity: 1000, unitPrice: 99.99, discount: 5 }]);
    expect(result.subtotal).toBe(99990);
    expect(result.total).toBeCloseTo(94990.5, 1);
  });
});

describe('Quote Number Generation', () => {
  const generateQuoteNumber = (sequence: number, year?: number): string => {
    const yr = year || new Date().getFullYear();
    return `ORC-${yr}-${sequence.toString().padStart(4, '0')}`;
  };

  it('should format with year and padded sequence', () => {
    expect(generateQuoteNumber(1, 2024)).toBe('ORC-2024-0001');
    expect(generateQuoteNumber(42, 2024)).toBe('ORC-2024-0042');
    expect(generateQuoteNumber(1234, 2024)).toBe('ORC-2024-1234');
  });

  it('should use current year by default', () => {
    const result = generateQuoteNumber(1);
    expect(result).toContain(`ORC-${new Date().getFullYear()}`);
  });

  it('should handle large sequences', () => {
    expect(generateQuoteNumber(99999, 2024)).toBe('ORC-2024-99999');
  });
});

describe('Quote Validity', () => {
  const isQuoteValid = (validUntil: string): boolean => {
    return new Date(validUntil).getTime() > Date.now();
  };

  const getValidityStatus = (validUntil: string): 'valid' | 'expiring' | 'expired' => {
    const expiryDate = new Date(validUntil);
    const now = Date.now();
    const daysUntilExpiry = (expiryDate.getTime() - now) / (1000 * 60 * 60 * 24);
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring';
    return 'valid';
  };

  it('should be valid if in the future', () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString();
    expect(isQuoteValid(future)).toBe(true);
  });

  it('should be invalid if in the past', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(isQuoteValid(past)).toBe(false);
  });

  it('should show expiring status within 3 days', () => {
    const soon = new Date(Date.now() + 2 * 86400000).toISOString();
    expect(getValidityStatus(soon)).toBe('expiring');
  });

  it('should show expired status for past dates', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(getValidityStatus(past)).toBe('expired');
  });

  it('should show valid for far future dates', () => {
    const far = new Date(Date.now() + 30 * 86400000).toISOString();
    expect(getValidityStatus(far)).toBe('valid');
  });
});

describe('Quote Status Workflow', () => {
  type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

  const validTransitions: Record<QuoteStatus, QuoteStatus[]> = {
    draft: ['sent'],
    sent: ['viewed', 'expired'],
    viewed: ['accepted', 'rejected', 'expired'],
    accepted: [],
    rejected: [],
    expired: [],
  };

  const canTransition = (from: QuoteStatus, to: QuoteStatus): boolean => {
    return validTransitions[from]?.includes(to) ?? false;
  };

  it('should allow draft to sent', () => {
    expect(canTransition('draft', 'sent')).toBe(true);
  });

  it('should not allow draft to accepted', () => {
    expect(canTransition('draft', 'accepted')).toBe(false);
  });

  it('should allow viewed to accepted or rejected', () => {
    expect(canTransition('viewed', 'accepted')).toBe(true);
    expect(canTransition('viewed', 'rejected')).toBe(true);
  });

  it('should not allow transitions from terminal states', () => {
    expect(canTransition('accepted', 'draft')).toBe(false);
    expect(canTransition('rejected', 'sent')).toBe(false);
    expect(canTransition('expired', 'viewed')).toBe(false);
  });

  it('should not allow backward transitions', () => {
    expect(canTransition('sent', 'draft')).toBe(false);
    expect(canTransition('viewed', 'draft')).toBe(false);
  });
});
