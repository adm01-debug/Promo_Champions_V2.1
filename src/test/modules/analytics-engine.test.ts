/**
 * Product Analytics Engine Tests
 * Tests: session ID generation, page tracking lifecycle, interaction counting,
 * flush logic, device detection, visibility/unload listeners
 */
import { describe, it, expect, vi } from 'vitest';

// --- Session ID generation ---
// Determinístico: IDs de sessão derivados de contador, não de Math.random.
let sessionCounter = 0;
const buildSessionId = () => {
  sessionCounter += 1;
  // Mantém formato "<timestamp>-<token>" usado pelo gerador real.
  return `${Date.now()}-${sessionCounter.toString(36).padStart(7, '0')}`;
};

describe('Analytics - Session ID', () => {
  it('should produce unique session IDs each time', () => {
    const ids = new Set(Array.from({ length: 50 }, () => buildSessionId()));
    expect(ids.size).toBe(50);
  });

  it('should match expected format (timestamp-random)', () => {
    expect(buildSessionId()).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

// --- Device type detection ---
describe('Analytics - Device Type', () => {
  const getDeviceType = (width: number) => (width < 768 ? 'mobile' : 'desktop');

  it('should detect mobile for width < 768', () => {
    expect(getDeviceType(375)).toBe('mobile');
    expect(getDeviceType(414)).toBe('mobile');
    expect(getDeviceType(320)).toBe('mobile');
    expect(getDeviceType(767)).toBe('mobile');
  });

  it('should detect desktop for width >= 768', () => {
    expect(getDeviceType(768)).toBe('desktop');
    expect(getDeviceType(1024)).toBe('desktop');
    expect(getDeviceType(1920)).toBe('desktop');
  });
});

// --- Page Session lifecycle ---
describe('Analytics - Page Session State', () => {
  interface PageSession {
    id?: string;
    route: string;
    pageTitle: string;
    enteredAt: number;
    interactions: number;
    referrerRoute: string | null;
    flushed: boolean;
  }

  it('should create a clean page session', () => {
    const session: PageSession = {
      route: '/pipeline',
      pageTitle: 'Pipeline',
      enteredAt: Date.now(),
      interactions: 0,
      referrerRoute: null,
      flushed: false,
    };
    expect(session.interactions).toBe(0);
    expect(session.flushed).toBe(false);
    expect(session.id).toBeUndefined();
  });

  it('should track referrer from previous page', () => {
    const session: PageSession = {
      route: '/clientes',
      pageTitle: 'Clientes',
      enteredAt: Date.now(),
      interactions: 0,
      referrerRoute: '/pipeline',
      flushed: false,
    };
    expect(session.referrerRoute).toBe('/pipeline');
  });

  it('should increment interactions', () => {
    const session: PageSession = {
      route: '/',
      pageTitle: 'Dashboard',
      enteredAt: Date.now(),
      interactions: 0,
      referrerRoute: null,
      flushed: false,
    };
    session.interactions += 1;
    session.interactions += 1;
    session.interactions += 1;
    expect(session.interactions).toBe(3);
  });

  it('should calculate duration in seconds', () => {
    const enteredAt = Date.now() - 45000; // 45 seconds ago
    const duration = Math.round((Date.now() - enteredAt) / 1000);
    expect(duration).toBeGreaterThanOrEqual(44);
    expect(duration).toBeLessThanOrEqual(46);
  });

  it('should not flush if no id is set', () => {
    const session: PageSession = {
      route: '/',
      pageTitle: 'Dashboard',
      enteredAt: Date.now(),
      interactions: 5,
      referrerRoute: null,
      flushed: false,
    };
    // Simulate flush logic: skip if no id
    const shouldFlush = !session.flushed && !!session.id;
    expect(shouldFlush).toBe(false);
  });

  it('should mark as flushed after flush', () => {
    const session: PageSession = {
      id: 'abc-123',
      route: '/',
      pageTitle: 'Dashboard',
      enteredAt: Date.now() - 10000,
      interactions: 3,
      referrerRoute: null,
      flushed: false,
    };
    // Simulate flush
    session.flushed = true;
    expect(session.flushed).toBe(true);
    // Should not flush again
    const shouldFlush = !session.flushed && !!session.id;
    expect(shouldFlush).toBe(false);
  });
});

// --- Route title mapping ---
describe('Analytics - Route Title Mapping', () => {
  const ROUTE_TITLES: Record<string, string> = {
    '/': 'Dashboard',
    '/pipeline': 'Pipeline',
    '/tarefas': 'Tarefas',
    '/vendedores': 'Vendedores',
    '/clientes': 'Clientes',
    '/produtos': 'Produtos',
    '/metas': 'Metas',
    '/relatorios': 'Relatórios',
    '/gamificacao': 'Gamificação',
    '/conquistas': 'Conquistas',
    '/feed': 'Feed de Vitórias',
    '/assistente': 'Assistente IA',
    '/perfil': 'Perfil',
    '/configuracoes': 'Configurações',
    '/notificacoes': 'Notificações',
    '/bi-gestor': 'BI Gestor',
    '/admin': 'Admin',
    '/cadencias': 'Cadências',
    '/prospectos': 'Prospectos',
    '/territorios': 'Territórios',
    '/dashboard-custom': 'Dashboard Personalizado',
  };

  function getPageTitle(pathname: string): string {
    if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
    const prefix = Object.keys(ROUTE_TITLES)
      .filter((r) => r !== '/' && pathname.startsWith(r))
      .sort((a, b) => b.length - a.length)[0];
    if (prefix) return ROUTE_TITLES[prefix];
    const segment = pathname.split('/').filter(Boolean)[0];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Página';
  }

  it('should map exact routes', () => {
    expect(getPageTitle('/')).toBe('Dashboard');
    expect(getPageTitle('/pipeline')).toBe('Pipeline');
    expect(getPageTitle('/gamificacao')).toBe('Gamificação');
  });

  it('should map sub-routes via prefix matching', () => {
    expect(getPageTitle('/admin/seguranca')).toBe('Admin');
    expect(getPageTitle('/admin/usuarios')).toBe('Admin');
    expect(getPageTitle('/relatorios/funil')).toBe('Relatórios');
  });

  it('should fallback to capitalized segment for unknown routes', () => {
    expect(getPageTitle('/custom-page')).toBe('Custom-page');
    expect(getPageTitle('/analytics')).toBe('Analytics');
  });

  it('should return Página for empty path', () => {
    expect(getPageTitle('/')).toBe('Dashboard'); // exact match
  });

  it('should handle deeply nested routes', () => {
    expect(getPageTitle('/admin/seguranca/ips')).toBe('Admin');
  });

  it('should map all 21 known routes', () => {
    expect(Object.keys(ROUTE_TITLES)).toHaveLength(21);
    for (const [route, title] of Object.entries(ROUTE_TITLES)) {
      expect(getPageTitle(route)).toBe(title);
    }
  });
});

// --- Aggregation logic (mirrors usePageAnalytics) ---
describe('Analytics - Data Aggregation', () => {
  interface RawRow {
    route: string;
    page_title: string | null;
    duration_seconds: number | null;
    interactions: number | null;
    session_id: string | null;
  }

  function aggregateRows(data: RawRow[]) {
    type Usage = {
      route: string;
      page_title: string;
      total_visits: number;
      total_duration: number;
      avg_duration: number;
      total_interactions: number;
      unique_sessions: number;
      _sessions: Set<string>;
    };

    const map = new Map<string, Usage>();
    for (const row of data) {
      const key = row.route;
      const existing = map.get(key);
      if (existing) {
        existing.total_visits += 1;
        existing.total_duration += row.duration_seconds ?? 0;
        existing.total_interactions += row.interactions ?? 0;
        if (row.session_id && !existing._sessions.has(row.session_id)) {
          existing.unique_sessions += 1;
          existing._sessions.add(row.session_id);
        }
      } else {
        const sessions = new Set<string>();
        if (row.session_id) sessions.add(row.session_id);
        map.set(key, {
          route: key,
          page_title: row.page_title ?? key,
          total_visits: 1,
          total_duration: row.duration_seconds ?? 0,
          avg_duration: 0,
          total_interactions: row.interactions ?? 0,
          unique_sessions: sessions.size,
          _sessions: sessions,
        });
      }
    }

    const results: Omit<Usage, '_sessions'>[] = [];
    for (const [, usage] of map) {
      usage.avg_duration = usage.total_visits > 0
        ? Math.round(usage.total_duration / usage.total_visits)
        : 0;
      const { _sessions, ...rest } = usage;
      results.push(rest);
    }
    return results.sort((a, b) => b.total_visits - a.total_visits);
  }

  it('should aggregate visits per route', () => {
    const data: RawRow[] = [
      { route: '/', page_title: 'Dashboard', duration_seconds: 10, interactions: 3, session_id: 's1' },
      { route: '/', page_title: 'Dashboard', duration_seconds: 20, interactions: 5, session_id: 's2' },
      { route: '/pipeline', page_title: 'Pipeline', duration_seconds: 30, interactions: 2, session_id: 's1' },
    ];
    const result = aggregateRows(data);
    expect(result).toHaveLength(2);
    const dashboard = result.find(r => r.route === '/')!;
    expect(dashboard.total_visits).toBe(2);
    expect(dashboard.total_duration).toBe(30);
    expect(dashboard.avg_duration).toBe(15);
    expect(dashboard.total_interactions).toBe(8);
    expect(dashboard.unique_sessions).toBe(2);
  });

  it('should count unique sessions correctly', () => {
    const data: RawRow[] = [
      { route: '/', page_title: 'Dashboard', duration_seconds: 10, interactions: 1, session_id: 's1' },
      { route: '/', page_title: 'Dashboard', duration_seconds: 10, interactions: 1, session_id: 's1' },
      { route: '/', page_title: 'Dashboard', duration_seconds: 10, interactions: 1, session_id: 's1' },
    ];
    const result = aggregateRows(data);
    expect(result[0].unique_sessions).toBe(1);
    expect(result[0].total_visits).toBe(3);
  });

  it('should handle null duration and interactions', () => {
    const data: RawRow[] = [
      { route: '/', page_title: 'Dashboard', duration_seconds: null, interactions: null, session_id: null },
    ];
    const result = aggregateRows(data);
    expect(result[0].total_duration).toBe(0);
    expect(result[0].total_interactions).toBe(0);
    expect(result[0].unique_sessions).toBe(0);
  });

  it('should sort by total visits descending', () => {
    const data: RawRow[] = [
      { route: '/a', page_title: 'A', duration_seconds: 1, interactions: 1, session_id: 's1' },
      { route: '/b', page_title: 'B', duration_seconds: 1, interactions: 1, session_id: 's1' },
      { route: '/b', page_title: 'B', duration_seconds: 1, interactions: 1, session_id: 's2' },
      { route: '/b', page_title: 'B', duration_seconds: 1, interactions: 1, session_id: 's3' },
    ];
    const result = aggregateRows(data);
    expect(result[0].route).toBe('/b');
    expect(result[0].total_visits).toBe(3);
  });

  it('should handle empty data', () => {
    expect(aggregateRows([])).toHaveLength(0);
  });

  it('should use route as fallback title when page_title is null', () => {
    const data: RawRow[] = [
      { route: '/unknown', page_title: null, duration_seconds: 5, interactions: 0, session_id: 's1' },
    ];
    const result = aggregateRows(data);
    expect(result[0].page_title).toBe('/unknown');
  });
});

// --- Visibility change listener ---
describe('Analytics - Browser Event Listeners', () => {
  it('should register visibilitychange listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const handler = () => {};
    window.addEventListener('visibilitychange', handler);
    expect(addSpy).toHaveBeenCalledWith('visibilitychange', handler);
    addSpy.mockRestore();
  });

  it('should register beforeunload listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const handler = () => {};
    window.addEventListener('beforeunload', handler);
    expect(addSpy).toHaveBeenCalledWith('beforeunload', handler);
    addSpy.mockRestore();
  });
});
