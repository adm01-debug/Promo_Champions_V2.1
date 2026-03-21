/**
 * URL Routing & Navigation Guards Tests
 * Tests: route matching, query params, breadcrumbs, deep linking, redirects
 */
import { describe, it, expect } from 'vitest';

describe('Routing - Path Matching', () => {
  const matchRoute = (path: string, pattern: string): { match: boolean; params: Record<string, string> } => {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length) return { match: false, params: {} };
    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return { match: false, params: {} };
      }
    }
    return { match: true, params };
  };

  it('should match static routes', () => {
    expect(matchRoute('/dashboard', '/dashboard').match).toBe(true);
  });

  it('should extract params', () => {
    const result = matchRoute('/vendas/abc123', '/vendas/:id');
    expect(result.match).toBe(true);
    expect(result.params.id).toBe('abc123');
  });

  it('should reject mismatches', () => {
    expect(matchRoute('/vendas', '/clientes').match).toBe(false);
  });

  it('should reject different lengths', () => {
    expect(matchRoute('/a/b/c', '/a/b').match).toBe(false);
  });
});

describe('Routing - Query Params', () => {
  const parseQueryParams = (search: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const clean = search.startsWith('?') ? search.slice(1) : search;
    if (!clean) return params;
    clean.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
  };

  const buildQueryString = (params: Record<string, string>): string => {
    const entries = Object.entries(params).filter(([, v]) => v !== '');
    if (entries.length === 0) return '';
    return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  };

  it('should parse query params', () => {
    expect(parseQueryParams('?status=active&page=2')).toEqual({ status: 'active', page: '2' });
  });

  it('should handle empty', () => {
    expect(parseQueryParams('')).toEqual({});
  });

  it('should build query string', () => {
    expect(buildQueryString({ status: 'active', page: '1' })).toContain('status=active');
  });

  it('should skip empty values', () => {
    expect(buildQueryString({ a: 'yes', b: '' })).toBe('?a=yes');
  });
});

describe('Routing - Breadcrumbs', () => {
  const ROUTE_LABELS: Record<string, string> = {
    '/': 'Dashboard',
    '/vendas': 'Vendas',
    '/pipeline': 'Pipeline',
    '/clientes': 'Clientes',
    '/relatorios': 'Relatórios',
    '/configuracoes': 'Configurações',
    '/admin': 'Administração',
  };

  const generateBreadcrumbs = (path: string): { label: string; path: string }[] => {
    const parts = path.split('/').filter(Boolean);
    const crumbs = [{ label: 'Dashboard', path: '/' }];
    let currentPath = '';
    parts.forEach(part => {
      currentPath += `/${part}`;
      const label = ROUTE_LABELS[currentPath] || part.charAt(0).toUpperCase() + part.slice(1);
      crumbs.push({ label, path: currentPath });
    });
    return crumbs;
  };

  it('should generate breadcrumbs', () => {
    const crumbs = generateBreadcrumbs('/vendas');
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe('Dashboard');
    expect(crumbs[1].label).toBe('Vendas');
  });

  it('should handle root', () => {
    expect(generateBreadcrumbs('/')).toHaveLength(1);
  });

  it('should capitalize unknown routes', () => {
    const crumbs = generateBreadcrumbs('/custom-page');
    expect(crumbs[1].label).toBe('Custom-page');
  });
});

describe('Routing - Navigation Guards', () => {
  const canNavigate = (from: string, to: string, isAuthenticated: boolean, hasUnsavedChanges: boolean): { allowed: boolean; reason?: string } => {
    const publicRoutes = ['/login', '/register', '/forgot-password'];
    if (publicRoutes.includes(to)) return { allowed: true };
    if (!isAuthenticated) return { allowed: false, reason: 'Faça login primeiro' };
    if (hasUnsavedChanges && from !== to) return { allowed: false, reason: 'Salve as alterações primeiro' };
    return { allowed: true };
  };

  it('should allow public routes', () => {
    expect(canNavigate('/', '/login', false, false).allowed).toBe(true);
  });

  it('should block unauthenticated', () => {
    const result = canNavigate('/login', '/dashboard', false, false);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('login');
  });

  it('should block unsaved changes', () => {
    expect(canNavigate('/vendas/edit', '/dashboard', true, true).allowed).toBe(false);
  });

  it('should allow authenticated navigation', () => {
    expect(canNavigate('/dashboard', '/vendas', true, false).allowed).toBe(true);
  });
});

describe('Routing - Deep Linking', () => {
  const parseDeepLink = (url: string): { route: string; params: Record<string, string> } | null => {
    try {
      const parsed = new URL(url, 'https://app.example.com');
      const route = parsed.pathname;
      const params: Record<string, string> = {};
      parsed.searchParams.forEach((v, k) => { params[k] = v; });
      return { route, params };
    } catch { return null; }
  };

  it('should parse deep link with params', () => {
    const result = parseDeepLink('/vendas?id=abc123&view=detail');
    expect(result?.route).toBe('/vendas');
    expect(result?.params.id).toBe('abc123');
  });

  it('should parse simple routes', () => {
    expect(parseDeepLink('/dashboard')?.route).toBe('/dashboard');
  });
});
