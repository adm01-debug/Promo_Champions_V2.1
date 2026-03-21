/**
 * Form Validation & Input Patterns Tests
 * Tests: email, phone, currency, required fields, form state
 */
import { describe, it, expect } from 'vitest';

describe('Form Validation - Email', () => {
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  it('should accept valid emails', () => {
    expect(isValidEmail('user@test.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
    expect(isValidEmail('user+tag@test.com')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @test.com')).toBe(false);
  });
});

describe('Form Validation - Phone (BR)', () => {
  const isValidPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  };

  it('should accept valid phones', () => {
    expect(isValidPhone('11999999999')).toBe(true);
    expect(isValidPhone('1199999999')).toBe(true);
    expect(isValidPhone('(11) 99999-9999')).toBe(true);
  });

  it('should reject invalid phones', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('123456789012')).toBe(false);
  });
});

describe('Form Validation - Currency (BRL)', () => {
  const formatBRL = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const parseBRL = (formatted: string): number => {
    return parseFloat(formatted.replace(/[^\d,-]/g, '').replace(',', '.'));
  };

  it('should format to BRL', () => {
    const formatted = formatBRL(1500.50);
    expect(formatted).toContain('1.500,50');
  });

  it('should format zero', () => {
    expect(formatBRL(0)).toContain('0,00');
  });

  it('should parse BRL string back', () => {
    expect(parseBRL('R$ 1.500,50')).toBeCloseTo(1500.50, 1);
  });
});

describe('Form Validation - Required Fields', () => {
  const validateRequired = (fields: Record<string, string>, requiredKeys: string[]): string[] => {
    return requiredKeys.filter(key => !fields[key]?.trim());
  };

  it('should pass when all required fields present', () => {
    expect(validateRequired(
      { name: 'João', email: 'j@t.com' },
      ['name', 'email']
    )).toHaveLength(0);
  });

  it('should detect missing fields', () => {
    const missing = validateRequired(
      { name: 'João', email: '' },
      ['name', 'email', 'phone']
    );
    expect(missing).toContain('email');
    expect(missing).toContain('phone');
  });

  it('should detect whitespace-only as empty', () => {
    expect(validateRequired({ name: '   ' }, ['name'])).toContain('name');
  });
});

describe('Form Validation - Amount Range', () => {
  const validateAmount = (amount: number, min: number = 0, max: number = 10000000): string | null => {
    if (amount < min) return `Valor mínimo: ${min}`;
    if (amount > max) return `Valor máximo: ${max}`;
    return null;
  };

  it('should accept valid amount', () => {
    expect(validateAmount(5000)).toBeNull();
  });

  it('should reject negative amount', () => {
    expect(validateAmount(-100)).toBe('Valor mínimo: 0');
  });

  it('should reject excessive amount', () => {
    expect(validateAmount(999999999, 0, 10000000)).toBe('Valor máximo: 10000000');
  });
});

describe('Form State - Dirty Detection', () => {
  const isDirty = (initial: Record<string, any>, current: Record<string, any>): boolean => {
    return Object.keys(initial).some(key => initial[key] !== current[key]);
  };

  it('should detect changes', () => {
    expect(isDirty({ name: 'A' }, { name: 'B' })).toBe(true);
  });

  it('should detect no changes', () => {
    expect(isDirty({ name: 'A' }, { name: 'A' })).toBe(false);
  });

  it('should detect added fields', () => {
    expect(isDirty({ name: 'A', email: '' }, { name: 'A', email: 'test@t.com' })).toBe(true);
  });
});

describe('Form State - Submit Readiness', () => {
  const canSubmit = (isValid: boolean, isDirty: boolean, isSubmitting: boolean): boolean => {
    return isValid && isDirty && !isSubmitting;
  };

  it('should allow valid, dirty, non-submitting', () => {
    expect(canSubmit(true, true, false)).toBe(true);
  });

  it('should block invalid', () => {
    expect(canSubmit(false, true, false)).toBe(false);
  });

  it('should block clean form', () => {
    expect(canSubmit(true, false, false)).toBe(false);
  });

  it('should block during submission', () => {
    expect(canSubmit(true, true, true)).toBe(false);
  });
});
