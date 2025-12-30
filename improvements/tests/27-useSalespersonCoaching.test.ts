// Melhoria 27
import { describe, it, expect } from 'vitest';
import { useSalespersonCoaching } from '../useSalespersonCoaching';

describe('useSalespersonCoaching', () => {
  it('should provide personalized coaching tips', () => {
    const { result } = renderHook(() =>
      useSalespersonCoaching({ userId: 'user-123' })
    );

    expect(result.current.tips).toBeDefined();
    expect(result.current.tips.length).toBeGreaterThan(0);
    
    result.current.tips.forEach((tip) => {
      expect(tip).toHaveProperty('category');
      expect(tip).toHaveProperty('suggestion');
      expect(tip).toHaveProperty('impact');
    });
  });

  it('should identify areas for improvement', () => {
    const { result } = renderHook(() =>
      useSalespersonCoaching({ userId: 'user-123' })
    );

    expect(result.current.weaknesses).toBeDefined();
    expect(Array.isArray(result.current.weaknesses)).toBe(true);
  });
});
