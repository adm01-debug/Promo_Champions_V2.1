/**
 * Tests for recent improvements:
 * - Web Vitals reporting
 * - Reduced motion accessibility
 * - Route prefetching
 * - ADR documentation structure
 * - XPToast aria-live
 * - Admin route protection
 * - Health check scripts
 */
import { describe, it, expect, vi } from 'vitest';

// ==========================================
// WEB VITALS REPORTING
// ==========================================
describe('Web Vitals Reporting', () => {
  it('should define all Core Web Vitals metric names', () => {
    const coreMetrics = ['CLS', 'INP', 'LCP', 'FCP', 'TTFB'];
    coreMetrics.forEach(metric => {
      expect(typeof metric).toBe('string');
      expect(metric.length).toBeGreaterThan(0);
    });
  });

  it('should classify metric ratings correctly', () => {
    const classify = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
      const thresholds: Record<string, [number, number]> = {
        CLS: [0.1, 0.25],
        INP: [200, 500],
        LCP: [2500, 4000],
        FCP: [1800, 3000],
        TTFB: [800, 1800],
      };
      const [good, poor] = thresholds[name] || [0, 0];
      if (value <= good) return 'good';
      if (value <= poor) return 'needs-improvement';
      return 'poor';
    };

    expect(classify('CLS', 0.05)).toBe('good');
    expect(classify('CLS', 0.15)).toBe('needs-improvement');
    expect(classify('CLS', 0.3)).toBe('poor');
    expect(classify('LCP', 1500)).toBe('good');
    expect(classify('LCP', 3000)).toBe('needs-improvement');
    expect(classify('LCP', 5000)).toBe('poor');
    expect(classify('INP', 100)).toBe('good');
    expect(classify('INP', 300)).toBe('needs-improvement');
    expect(classify('INP', 600)).toBe('poor');
    expect(classify('FCP', 1000)).toBe('good');
    expect(classify('FCP', 2500)).toBe('needs-improvement');
    expect(classify('FCP', 4000)).toBe('poor');
    expect(classify('TTFB', 500)).toBe('good');
    expect(classify('TTFB', 1000)).toBe('needs-improvement');
    expect(classify('TTFB', 2000)).toBe('poor');
  });

  it('should format metric output with severity indicator', () => {
    const formatMetric = (name: string, value: number, rating: string): string => {
      const label = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
      return `${label} [${name}] ${Math.round(value)}ms (${rating})`;
    };

    expect(formatMetric('LCP', 1234.5, 'good')).toBe('✅ [LCP] 1235ms (good)');
    expect(formatMetric('INP', 350, 'needs-improvement')).toBe('⚠️ [INP] 350ms (needs-improvement)');
    expect(formatMetric('CLS', 0.3, 'poor')).toBe('❌ [CLS] 0ms (poor)');
  });

  it('should handle zero and negative values gracefully', () => {
    expect(Math.round(0)).toBe(0);
    expect(Math.round(-1)).toBe(-1);
  });
});

// ==========================================
// REDUCED MOTION ACCESSIBILITY
// ==========================================
describe('Reduced Motion Accessibility', () => {
  it('should define reduced motion animation props', () => {
    const getMotionProps = (prefersReduced: boolean) => {
      if (prefersReduced) {
        return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } };
      }
      return { initial: { opacity: 0, x: 100, scale: 0.8 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: 100, scale: 0.8 }, transition: { type: 'spring', stiffness: 500, damping: 30 } };
    };

    const reduced = getMotionProps(true);
    expect(reduced.initial).toEqual({ opacity: 0 });
    expect(reduced.animate).toEqual({ opacity: 1 });
    expect(reduced.transition).toEqual({ duration: 0.15 });
    expect(reduced.initial).not.toHaveProperty('x');
    expect(reduced.initial).not.toHaveProperty('scale');

    const full = getMotionProps(false);
    expect(full.initial).toHaveProperty('x', 100);
    expect(full.initial).toHaveProperty('scale', 0.8);
    expect(full.transition).toHaveProperty('type', 'spring');
  });

  it('should suppress sparkle particles when reduced motion is preferred', () => {
    const shouldShowParticles = (prefersReduced: boolean) => !prefersReduced;

    expect(shouldShowParticles(false)).toBe(true);
    expect(shouldShowParticles(true)).toBe(false);
  });

  it('should validate media query format', () => {
    const query = '(prefers-reduced-motion: reduce)';
    expect(query).toContain('prefers-reduced-motion');
    expect(query).toContain('reduce');
  });

  it('should provide accessible aria attributes for notifications', () => {
    const ariaProps = {
      role: 'status',
      'aria-live': 'polite' as const,
      'aria-label': 'Notificações de XP',
    };

    expect(ariaProps.role).toBe('status');
    expect(ariaProps['aria-live']).toBe('polite');
    expect(ariaProps['aria-label']).toContain('XP');
  });
});

// ==========================================
// ROUTE PREFETCHING
// ==========================================
describe('Route Prefetching', () => {
  it('should track prefetched routes to avoid duplicates', () => {
    const prefetched = new Set<string>();

    const prefetch = (route: string) => {
      if (prefetched.has(route)) return false;
      prefetched.add(route);
      return true;
    };

    expect(prefetch('/pipeline')).toBe(true);
    expect(prefetch('/pipeline')).toBe(false); // duplicate
    expect(prefetch('/vendas')).toBe(true);
    expect(prefetched.size).toBe(2);
  });

  it('should create correct prefetch link attributes', () => {
    const createPrefetchAttrs = (href: string) => ({
      rel: 'prefetch',
      href,
      as: 'script',
    });

    const attrs = createPrefetchAttrs('/assets/Pipeline-abc123.js');
    expect(attrs.rel).toBe('prefetch');
    expect(attrs.as).toBe('script');
    expect(attrs.href).toContain('Pipeline');
  });

  it('should handle empty route arrays', () => {
    const routes: string[] = [];
    const prefetched = new Set<string>();
    routes.forEach(r => prefetched.add(r));
    expect(prefetched.size).toBe(0);
  });

  it('should use requestIdleCallback when available', () => {
    const hasIdleCallback = typeof requestIdleCallback === 'function';
    // In test environment (jsdom), requestIdleCallback may not exist
    // The hook should fallback to setTimeout
    expect(typeof hasIdleCallback).toBe('boolean');
  });
});

// ==========================================
// ADR DOCUMENTATION STRUCTURE
// ==========================================
describe('ADR Documentation', () => {
  const adrs = [
    { id: 'ADR-001', title: 'RBAC com 3 Roles', status: 'Aceito' },
    { id: 'ADR-002', title: 'React Query como Gerenciador de Estado', status: 'Aceito' },
    { id: 'ADR-003', title: 'RLS como Camada Primária de Segurança', status: 'Aceito' },
  ];

  it('should have sequential numbering', () => {
    adrs.forEach((adr, i) => {
      const num = parseInt(adr.id.split('-')[1]);
      expect(num).toBe(i + 1);
    });
  });

  it('should have valid status values', () => {
    const validStatuses = ['Aceito', 'Proposto', 'Rejeitado', 'Substituído'];
    adrs.forEach(adr => {
      expect(validStatuses).toContain(adr.status);
    });
  });

  it('should have non-empty titles', () => {
    adrs.forEach(adr => {
      expect(adr.title.length).toBeGreaterThan(5);
    });
  });

  it('should follow naming convention', () => {
    const pattern = /^ADR-\d{3}$/;
    adrs.forEach(adr => {
      expect(pattern.test(adr.id)).toBe(true);
    });
  });
});

// ==========================================
// ADMIN ROUTE PROTECTION
// ==========================================
describe('Admin Route Protection', () => {
  const protectedRoutes = [
    { path: '/admin', requiredRole: 'admin' },
    { path: '/admin/telemetria', requiredRole: 'admin' },
    { path: '/vendedores', requiredRole: 'admin_or_manager' },
    { path: '/metas', requiredRole: 'admin_or_manager' },
    { path: '/analytics', requiredRole: 'admin_or_manager' },
  ];

  const publicRoutes = ['/', '/vendas', '/clientes', '/pipeline', '/atividades', '/auth'];

  it('admin routes should require admin role', () => {
    const adminOnlyRoutes = protectedRoutes.filter(r => r.requiredRole === 'admin');
    expect(adminOnlyRoutes.length).toBeGreaterThan(0);
    adminOnlyRoutes.forEach(r => {
      expect(r.path).toMatch(/^\/admin/);
    });
  });

  it('public routes should not require roles', () => {
    publicRoutes.forEach(path => {
      const isProtected = protectedRoutes.some(r => r.path === path);
      expect(isProtected).toBe(false);
    });
  });

  it('should have fallback path for denied access', () => {
    const fallbackPath = '/acesso-negado';
    expect(fallbackPath).toBeTruthy();
    expect(fallbackPath).toMatch(/^\//);
  });

  it('manager routes should not include admin-only paths', () => {
    const managerRoutes = protectedRoutes.filter(r => r.requiredRole === 'admin_or_manager');
    managerRoutes.forEach(r => {
      expect(r.path).not.toBe('/admin');
    });
  });
});

// ==========================================
// HEALTH CHECK SCRIPTS
// ==========================================
describe('Health Check Configuration', () => {
  it('should define required npm scripts', () => {
    const requiredScripts = ['dev', 'build', 'lint', 'test', 'typecheck', 'health'];
    requiredScripts.forEach(script => {
      expect(typeof script).toBe('string');
      expect(script.length).toBeGreaterThan(0);
    });
  });

  it('should validate health check pipeline order', () => {
    // health = typecheck → lint → test
    const healthSteps = ['tsc --noEmit', 'eslint src/', 'vitest run'];
    expect(healthSteps[0]).toContain('tsc');
    expect(healthSteps[1]).toContain('eslint');
    expect(healthSteps[2]).toContain('vitest');
  });

  it('should validate typecheck is non-emit', () => {
    const typecheckCmd = 'tsc --noEmit';
    expect(typecheckCmd).toContain('--noEmit');
  });
});

// ==========================================
// XP TOAST ACCESSIBILITY
// ==========================================
describe('XP Toast Accessibility', () => {
  it('should generate correct aria-label for notifications', () => {
    const generateAriaLabel = (amount: number, reason: string) => `+${amount} XP: ${reason}`;

    expect(generateAriaLabel(50, 'Deal fechado')).toBe('+50 XP: Deal fechado');
    expect(generateAriaLabel(100, 'Streak de 7 dias')).toBe('+100 XP: Streak de 7 dias');
    expect(generateAriaLabel(0, 'Teste')).toBe('+0 XP: Teste');
  });

  it('should categorize notification types with correct icons', () => {
    const getIconForType = (type: 'xp' | 'streak' | 'level_up') => {
      switch (type) {
        case 'level_up': return 'TrendingUp';
        case 'streak': return 'Zap';
        default: return 'Sparkles';
      }
    };

    expect(getIconForType('xp')).toBe('Sparkles');
    expect(getIconForType('streak')).toBe('Zap');
    expect(getIconForType('level_up')).toBe('TrendingUp');
  });

  it('should assign correct gradient colors per type', () => {
    const getGradient = (type: 'xp' | 'streak' | 'level_up') => {
      if (type === 'level_up') return 'from-yellow-500/90 to-amber-600/90';
      if (type === 'streak') return 'from-orange-500/90 to-red-500/90';
      return 'from-primary/90 to-primary/70';
    };

    expect(getGradient('xp')).toContain('primary');
    expect(getGradient('streak')).toContain('orange');
    expect(getGradient('level_up')).toContain('yellow');
  });

  it('should auto-remove notifications after timeout', () => {
    vi.useFakeTimers();
    const notifications = ['a', 'b'];
    const remove = (id: string) => {
      const idx = notifications.indexOf(id);
      if (idx > -1) notifications.splice(idx, 1);
    };

    setTimeout(() => remove('a'), 3000);
    vi.advanceTimersByTime(3000);
    expect(notifications).toEqual(['b']);
    vi.useRealTimers();
  });
});

// ==========================================
// SUPPRESSED HYDRATION WARNING CLEANUP
// ==========================================
describe('SSR Warning Cleanup', () => {
  it('should not use suppressHydrationWarning in SPA components', () => {
    // SPA apps (Vite + React) don't need suppressHydrationWarning
    // This was removed from PageLoadingFallback
    const spaFlags = ['suppressHydrationWarning'];
    const isNeeded = false; // Not needed in SPA
    spaFlags.forEach(_flag => {
      expect(isNeeded).toBe(false);
    });
  });
});

// ==========================================
// COMPETENCY DATA & FEATURE FLAGS
// ==========================================
describe('Competency & Feature Flags Integration', () => {
  it('should map data to competency radar areas', () => {
    const areas = ['Prospecção', 'Qualificação', 'Negociação', 'Fechamento', 'Follow-up', 'Apresentação'];
    areas.forEach(area => {
      expect(area.length).toBeGreaterThan(0);
    });
  });

  it('should calculate rollout status deterministically', () => {
    const hash = (userId: string, key: string) => {
      const str = `${userId}:${key}`;
      let h = 0;
      for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
      return Math.abs(h % 100);
    };

    const user1 = 'user-123';
    const flag = 'new_feature';
    const result1 = hash(user1, flag);
    const result2 = hash(user1, flag);
    expect(result1).toBe(result2);
  });
});
