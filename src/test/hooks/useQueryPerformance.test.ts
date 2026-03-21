/**
 * Query Performance Monitor Tests
 * Tests: metrics collection, alert config, slow query detection
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { getQueryMetrics, clearQueryMetrics, configureQueryAlerts, getAlertConfig } from '@/hooks/useQueryPerformance';

describe('Query Metrics Store', () => {
  beforeEach(() => {
    clearQueryMetrics();
  });

  it('should return empty metrics initially', () => {
    const metrics = getQueryMetrics();
    expect(metrics.totalQueries).toBe(0);
    expect(metrics.avgDuration).toBe(0);
    expect(metrics.slowQueries).toBe(0);
    expect(metrics.errorRate).toBe(0);
  });

  it('should clear metrics', () => {
    clearQueryMetrics();
    expect(getQueryMetrics().totalQueries).toBe(0);
  });
});

describe('Alert Configuration', () => {
  it('should have default config', () => {
    const config = getAlertConfig();
    expect(config.enabled).toBe(true);
    expect(config.threshold).toBe(2000);
  });

  it('should allow partial updates', () => {
    const original = getAlertConfig();
    configureQueryAlerts({ threshold: 5000 });
    const updated = getAlertConfig();
    expect(updated.threshold).toBe(5000);
    expect(updated.enabled).toBe(original.enabled);
    // Reset
    configureQueryAlerts({ threshold: 2000 });
  });

  it('should allow disabling alerts', () => {
    configureQueryAlerts({ enabled: false });
    expect(getAlertConfig().enabled).toBe(false);
    configureQueryAlerts({ enabled: true });
  });
});

describe('Slow Query Detection Logic', () => {
  const THRESHOLD = 2000;
  const SLOW_THRESHOLD = 1000;

  const classifyQuery = (durationMs: number) => {
    if (durationMs > THRESHOLD) return 'critical';
    if (durationMs > SLOW_THRESHOLD) return 'slow';
    return 'normal';
  };

  it('should classify fast queries as normal', () => {
    expect(classifyQuery(100)).toBe('normal');
    expect(classifyQuery(500)).toBe('normal');
    expect(classifyQuery(999)).toBe('normal');
  });

  it('should classify 1000-2000ms as slow', () => {
    expect(classifyQuery(1001)).toBe('slow');
    expect(classifyQuery(1500)).toBe('slow');
    expect(classifyQuery(2000)).toBe('slow');
  });

  it('should classify >2000ms as critical', () => {
    expect(classifyQuery(2001)).toBe('critical');
    expect(classifyQuery(5000)).toBe('critical');
    expect(classifyQuery(10000)).toBe('critical');
  });
});

describe('Query Metrics Aggregation Logic', () => {
  interface Metric { queryKey: string; duration: number; status: 'success' | 'error' }

  const aggregate = (metrics: Metric[]) => {
    if (metrics.length === 0) return { avg: 0, errorRate: 0, slowCount: 0 };
    const avg = Math.round(metrics.reduce((s, m) => s + m.duration, 0) / metrics.length);
    const errorRate = Math.round((metrics.filter(m => m.status === 'error').length / metrics.length) * 100);
    const slowCount = metrics.filter(m => m.duration > 1000).length;
    return { avg, errorRate, slowCount };
  };

  it('should calculate average duration', () => {
    const metrics: Metric[] = [
      { queryKey: 'a', duration: 100, status: 'success' },
      { queryKey: 'b', duration: 300, status: 'success' },
    ];
    expect(aggregate(metrics).avg).toBe(200);
  });

  it('should calculate error rate', () => {
    const metrics: Metric[] = [
      { queryKey: 'a', duration: 100, status: 'success' },
      { queryKey: 'b', duration: 300, status: 'error' },
    ];
    expect(aggregate(metrics).errorRate).toBe(50);
  });

  it('should count slow queries', () => {
    const metrics: Metric[] = [
      { queryKey: 'a', duration: 100, status: 'success' },
      { queryKey: 'b', duration: 1500, status: 'success' },
      { queryKey: 'c', duration: 2500, status: 'success' },
    ];
    expect(aggregate(metrics).slowCount).toBe(2);
  });

  it('should handle empty metrics', () => {
    expect(aggregate([]).avg).toBe(0);
  });
});

describe('Alert Cooldown Logic', () => {
  const COOLDOWN_MS = 30000;

  const shouldAlert = (lastAlerted: number | null): boolean => {
    if (!lastAlerted) return true;
    return Date.now() - lastAlerted >= COOLDOWN_MS;
  };

  it('should alert if never alerted', () => {
    expect(shouldAlert(null)).toBe(true);
  });

  it('should not alert within cooldown', () => {
    expect(shouldAlert(Date.now() - 5000)).toBe(false);
  });

  it('should alert after cooldown', () => {
    expect(shouldAlert(Date.now() - 60000)).toBe(true);
  });
});
