/**
 * Digital Signatures Logic Tests
 * Tests: status workflow, signer validation, expiration logic
 */
import { describe, it, expect } from 'vitest';

describe('Digital Signatures - Status Workflow', () => {
  type DocStatus = 'draft' | 'pending' | 'signed' | 'expired' | 'cancelled';

  const VALID_TRANSITIONS: Record<DocStatus, DocStatus[]> = {
    draft: ['pending', 'cancelled'],
    pending: ['signed', 'expired', 'cancelled'],
    signed: [],
    expired: [],
    cancelled: [],
  };

  const canTransition = (from: DocStatus, to: DocStatus): boolean => {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  };

  it('should allow draft → pending', () => {
    expect(canTransition('draft', 'pending')).toBe(true);
  });

  it('should allow pending → signed', () => {
    expect(canTransition('pending', 'signed')).toBe(true);
  });

  it('should not allow signed → any', () => {
    expect(canTransition('signed', 'draft')).toBe(false);
    expect(canTransition('signed', 'cancelled')).toBe(false);
  });

  it('should allow cancellation from draft/pending', () => {
    expect(canTransition('draft', 'cancelled')).toBe(true);
    expect(canTransition('pending', 'cancelled')).toBe(true);
  });

  it('should not allow backwards transitions', () => {
    expect(canTransition('pending', 'draft')).toBe(false);
    expect(canTransition('signed', 'pending')).toBe(false);
  });
});

describe('Digital Signatures - Expiration Check', () => {
  const isExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
  };

  it('should detect expired documents', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(isExpired(yesterday)).toBe(true);
  });

  it('should detect non-expired documents', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    expect(isExpired(tomorrow)).toBe(false);
  });

  it('should handle null expires_at', () => {
    expect(isExpired(null)).toBe(false);
  });
});

describe('Digital Signatures - Signer Validation', () => {
  const validateSigners = (signers: { name: string; email: string }[]): string[] => {
    const errors: string[] = [];
    if (signers.length === 0) errors.push('Pelo menos um signatário é obrigatório');
    signers.forEach((s, i) => {
      if (!s.name.trim()) errors.push(`Signatário ${i + 1}: nome obrigatório`);
      if (!s.email.includes('@')) errors.push(`Signatário ${i + 1}: email inválido`);
    });
    const emails = signers.map(s => s.email.toLowerCase());
    if (new Set(emails).size !== emails.length) errors.push('Emails duplicados');
    return errors;
  };

  it('should pass for valid signers', () => {
    const signers = [
      { name: 'João', email: 'joao@test.com' },
      { name: 'Maria', email: 'maria@test.com' },
    ];
    expect(validateSigners(signers)).toHaveLength(0);
  });

  it('should require at least one signer', () => {
    expect(validateSigners([])).toContain('Pelo menos um signatário é obrigatório');
  });

  it('should validate email format', () => {
    const errors = validateSigners([{ name: 'Test', email: 'invalid' }]);
    expect(errors.some(e => e.includes('email inválido'))).toBe(true);
  });

  it('should detect duplicate emails', () => {
    const signers = [
      { name: 'A', email: 'same@test.com' },
      { name: 'B', email: 'same@test.com' },
    ];
    expect(validateSigners(signers)).toContain('Emails duplicados');
  });

  it('should require names', () => {
    const errors = validateSigners([{ name: '', email: 'test@test.com' }]);
    expect(errors.some(e => e.includes('nome obrigatório'))).toBe(true);
  });
});

describe('Digital Signatures - Signer Order', () => {
  const sortByOrder = (signers: { name: string; sign_order: number | null }[]) => {
    return [...signers].sort((a, b) => (a.sign_order ?? 99) - (b.sign_order ?? 99));
  };

  it('should sort by sign order', () => {
    const signers = [
      { name: 'C', sign_order: 3 },
      { name: 'A', sign_order: 1 },
      { name: 'B', sign_order: 2 },
    ];
    const sorted = sortByOrder(signers);
    expect(sorted.map(s => s.name)).toEqual(['A', 'B', 'C']);
  });

  it('should put null order last', () => {
    const signers = [
      { name: 'B', sign_order: null },
      { name: 'A', sign_order: 1 },
    ];
    const sorted = sortByOrder(signers);
    expect(sorted[0].name).toBe('A');
  });
});
