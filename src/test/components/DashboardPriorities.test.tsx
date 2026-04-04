/**
 * useDashboardPriorities Hook Tests
 * Verifies: role-based section defaults for SDR, Closer, Gestão, Hybrid
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardPriorities } from '@/hooks/useDashboardPriorities';

// Mock useAuth
const mockSalesperson = { role: 'hybrid' };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ salesperson: mockSalesperson }),
}));

describe('useDashboardPriorities', () => {
  // === SDR ===
  it('SDR: gamification open, analytics closed', () => {
    mockSalesperson.role = 'sdr';
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current.role).toBe('sdr');
    expect(result.current.showGamificationOpen).toBe(true);
    expect(result.current.showAnalyticsOpen).toBe(false);
    expect(result.current.showPerformanceOpen).toBe(false);
    expect(result.current.showEngagementOpen).toBe(false);
  });

  it('SDR: has prospecting hint', () => {
    mockSalesperson.role = 'sdr';
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current.roleHint).toContain('prospecção');
  });

  // === Closer ===
  it('Closer: gamification + analytics open', () => {
    mockSalesperson.role = 'closer';
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current.role).toBe('closer');
    expect(result.current.showGamificationOpen).toBe(true);
    expect(result.current.showAnalyticsOpen).toBe(true);
    expect(result.current.showPerformanceOpen).toBe(false);
  });

  it('Closer: has closing hint', () => {
    mockSalesperson.role = 'closer';
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current.roleHint).toContain('Feche');
  });

  // === Gestão ===
  it('Gestão: analytics + performance open, gamification closed', () => {
    mockSalesperson.role = 'gestao';
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current.role).toBe('gestao');
    expect(result.current.showGamificationOpen).toBe(false);
    expect(result.current.showAnalyticsOpen).toBe(true);
    expect(result.current.showPerformanceOpen).toBe(true);
    expect(result.current.showEngagementOpen).toBe(false);
  });

  it('Gestão: has strategic hint', () => {
    mockSalesperson.role = 'gestao';
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current.roleHint).toContain('estratégica');
  });

  // === Hybrid (default) ===
  it('Hybrid: gamification + analytics open', () => {
    mockSalesperson.role = 'hybrid';
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current.role).toBe('hybrid');
    expect(result.current.showGamificationOpen).toBe(true);
    expect(result.current.showAnalyticsOpen).toBe(true);
    expect(result.current.showPerformanceOpen).toBe(false);
    expect(result.current.showEngagementOpen).toBe(false);
  });

  it('Hybrid: has sales hint', () => {
    mockSalesperson.role = 'hybrid';
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current.roleHint).toContain('vender');
  });

  // === Edge: unknown role defaults to hybrid ===
  it('unknown role defaults to hybrid', () => {
    mockSalesperson.role = 'something_unknown';
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current.role).toBe('hybrid');
  });

  // === Edge: null salesperson ===
  it('null salesperson defaults to hybrid', () => {
    (mockSalesperson as any).role = undefined;
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current.role).toBe('hybrid');
  });

  // === All roles have engagement closed by default ===
  it('no role has engagement open by default', () => {
    const roles = ['sdr', 'closer', 'gestao', 'hybrid'];
    for (const role of roles) {
      mockSalesperson.role = role;
      const { result } = renderHook(() => useDashboardPriorities());
      expect(result.current.showEngagementOpen).toBe(false);
    }
  });

  // === Return type completeness ===
  it('returns all required fields', () => {
    mockSalesperson.role = 'sdr';
    const { result } = renderHook(() => useDashboardPriorities());
    expect(result.current).toHaveProperty('role');
    expect(result.current).toHaveProperty('showGamificationOpen');
    expect(result.current).toHaveProperty('showAnalyticsOpen');
    expect(result.current).toHaveProperty('showPerformanceOpen');
    expect(result.current).toHaveProperty('showEngagementOpen');
    expect(result.current).toHaveProperty('roleHint');
  });
});
