/**
 * Utility Functions Tests
 * Tests: cn (className merger), edge cases
 */
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn - Class Name Merger', () => {
  it('should merge basic classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active')).toBe('base active');
    expect(cn('base', false && 'active')).toBe('base');
  });

  it('should handle undefined and null', () => {
    expect(cn('base', undefined, null)).toBe('base');
  });

  it('should merge tailwind conflicting classes', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });

  it('should merge conflicting bg classes', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('should handle empty arguments', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('should handle array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle object inputs', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });

  it('should handle complex tailwind merges', () => {
    const result = cn('text-sm text-red-500', 'text-blue-500');
    expect(result).toContain('text-sm');
    expect(result).toContain('text-blue-500');
    expect(result).not.toContain('text-red-500');
  });

  it('should preserve non-conflicting classes', () => {
    const result = cn('rounded-lg shadow-md', 'border p-4');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('shadow-md');
    expect(result).toContain('border');
    expect(result).toContain('p-4');
  });
});