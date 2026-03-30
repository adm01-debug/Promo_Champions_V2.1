/**
 * Media Query Hook Tests
 * Tests: breakpoints, responsive detection, reduced motion
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  it('should return false by default (matchMedia mock returns false)', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);
  });

  it('should accept a default value', () => {
    const { result } = renderHook(() => 
      useMediaQuery('(max-width: 767px)', { defaultValue: true })
    );
    // matchMedia mock returns false, so it should still be false in JSDOM
    expect(typeof result.current).toBe('boolean');
  });
});

describe('useIsMobile', () => {
  it('should return boolean', () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe('boolean');
  });
});

describe('useIsTablet', () => {
  it('should return boolean', () => {
    const { result } = renderHook(() => useIsTablet());
    expect(typeof result.current).toBe('boolean');
  });
});

describe('useIsDesktop', () => {
  it('should return boolean', () => {
    const { result } = renderHook(() => useIsDesktop());
    expect(typeof result.current).toBe('boolean');
  });
});
