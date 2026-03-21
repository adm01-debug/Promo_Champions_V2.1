/**
 * PWA, Offline & Performance Tests
 * Tests: cache strategies, offline detection, performance budgets, lazy loading
 */
import { describe, it, expect } from 'vitest';

describe('Offline Detection', () => {
  const getConnectionStatus = (online: boolean, effectiveType?: string): { status: 'online' | 'offline' | 'slow'; label: string } => {
    if (!online) return { status: 'offline', label: 'Sem conexão' };
    if (effectiveType === '2g' || effectiveType === 'slow-2g') return { status: 'slow', label: 'Conexão lenta' };
    return { status: 'online', label: 'Conectado' };
  };

  it('should detect online', () => {
    expect(getConnectionStatus(true, '4g').status).toBe('online');
  });

  it('should detect offline', () => {
    expect(getConnectionStatus(false).status).toBe('offline');
  });

  it('should detect slow connection', () => {
    expect(getConnectionStatus(true, '2g').status).toBe('slow');
  });
});

describe('Performance - Budget Validation', () => {
  type Budget = { metric: string; limit: number; unit: string };

  const checkBudget = (actual: number, budget: Budget): { pass: boolean; usage: number } => {
    const usage = Math.round((actual / budget.limit) * 100);
    return { pass: actual <= budget.limit, usage };
  };

  it('should pass within budget', () => {
    expect(checkBudget(200, { metric: 'bundle_size_kb', limit: 500, unit: 'KB' }).pass).toBe(true);
  });

  it('should fail over budget', () => {
    const result = checkBudget(600, { metric: 'bundle_size_kb', limit: 500, unit: 'KB' });
    expect(result.pass).toBe(false);
    expect(result.usage).toBe(120);
  });
});

describe('Performance - Core Web Vitals', () => {
  const classifyMetric = (name: string, value: number): 'good' | 'needs_improvement' | 'poor' => {
    const thresholds: Record<string, [number, number]> = {
      LCP: [2500, 4000],    // ms
      FID: [100, 300],       // ms
      CLS: [0.1, 0.25],     // score
      INP: [200, 500],      // ms
      TTFB: [800, 1800],    // ms
    };
    const [good, poor] = thresholds[name] || [0, 0];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs_improvement';
    return 'poor';
  };

  it('should classify good LCP', () => {
    expect(classifyMetric('LCP', 2000)).toBe('good');
  });

  it('should classify poor LCP', () => {
    expect(classifyMetric('LCP', 5000)).toBe('poor');
  });

  it('should classify needs improvement FID', () => {
    expect(classifyMetric('FID', 200)).toBe('needs_improvement');
  });

  it('should classify good CLS', () => {
    expect(classifyMetric('CLS', 0.05)).toBe('good');
  });

  it('should classify INP', () => {
    expect(classifyMetric('INP', 150)).toBe('good');
    expect(classifyMetric('INP', 600)).toBe('poor');
  });
});

describe('Cache Strategy', () => {
  const getCacheStrategy = (resourceType: string): 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' => {
    const strategies: Record<string, 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only'> = {
      image: 'cache-first',
      font: 'cache-first',
      stylesheet: 'stale-while-revalidate',
      script: 'stale-while-revalidate',
      api: 'network-first',
      document: 'network-first',
      auth: 'network-only',
    };
    return strategies[resourceType] || 'network-first';
  };

  it('should cache-first for images', () => {
    expect(getCacheStrategy('image')).toBe('cache-first');
    expect(getCacheStrategy('font')).toBe('cache-first');
  });

  it('should network-first for API', () => {
    expect(getCacheStrategy('api')).toBe('network-first');
  });

  it('should network-only for auth', () => {
    expect(getCacheStrategy('auth')).toBe('network-only');
  });

  it('should SWR for assets', () => {
    expect(getCacheStrategy('stylesheet')).toBe('stale-while-revalidate');
  });
});

describe('Lazy Loading - Route Priority', () => {
  const ROUTE_PRIORITY: Record<string, 'eager' | 'lazy' | 'prefetch'> = {
    '/': 'eager',
    '/login': 'eager',
    '/pipeline': 'prefetch',
    '/vendas': 'prefetch',
    '/relatorios': 'lazy',
    '/admin': 'lazy',
    '/configuracoes': 'lazy',
  };

  const getLoadStrategy = (route: string): string => ROUTE_PRIORITY[route] || 'lazy';

  it('should eager load critical routes', () => {
    expect(getLoadStrategy('/')).toBe('eager');
    expect(getLoadStrategy('/login')).toBe('eager');
  });

  it('should prefetch common routes', () => {
    expect(getLoadStrategy('/pipeline')).toBe('prefetch');
  });

  it('should lazy load secondary routes', () => {
    expect(getLoadStrategy('/admin')).toBe('lazy');
    expect(getLoadStrategy('/unknown')).toBe('lazy');
  });
});

describe('Performance - Memory Leak Detection', () => {
  const detectPotentialLeak = (snapshots: { heapUsed: number; timestamp: number }[]): { growing: boolean; growthRate: number } => {
    if (snapshots.length < 3) return { growing: false, growthRate: 0 };
    let increases = 0;
    for (let i = 1; i < snapshots.length; i++) {
      if (snapshots[i].heapUsed > snapshots[i - 1].heapUsed) increases++;
    }
    const growthRate = Math.round((increases / (snapshots.length - 1)) * 100);
    return { growing: growthRate >= 80, growthRate };
  };

  it('should detect consistent growth', () => {
    const snapshots = [
      { heapUsed: 50, timestamp: 1 },
      { heapUsed: 60, timestamp: 2 },
      { heapUsed: 70, timestamp: 3 },
      { heapUsed: 80, timestamp: 4 },
      { heapUsed: 90, timestamp: 5 },
    ];
    expect(detectPotentialLeak(snapshots).growing).toBe(true);
  });

  it('should not flag stable memory', () => {
    const snapshots = [
      { heapUsed: 50, timestamp: 1 },
      { heapUsed: 55, timestamp: 2 },
      { heapUsed: 48, timestamp: 3 },
      { heapUsed: 52, timestamp: 4 },
      { heapUsed: 49, timestamp: 5 },
    ];
    expect(detectPotentialLeak(snapshots).growing).toBe(false);
  });
});
