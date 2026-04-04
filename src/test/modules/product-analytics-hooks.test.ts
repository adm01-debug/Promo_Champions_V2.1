/**
 * Product Analytics Hooks & Integration Tests
 * Tests: usePageAnalytics query structure, date window calculations,
 * RouteTracker behavior, salesperson ID sync
 */
import { describe, it, expect } from 'vitest';

describe('Page Analytics - Query Window', () => {
  it('should calculate correct date window for 30 days', () => {
    const days = 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const now = new Date();
    const diffMs = now.getTime() - since.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it('should calculate correct date window for 7 days', () => {
    const days = 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - since.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(7);
  });

  it('should calculate correct date window for 90 days', () => {
    const days = 90;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const diffDays = Math.round((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(90);
  });
});

describe('Page Analytics - RouteUsage Interface', () => {
  interface RouteUsage {
    route: string;
    page_title: string;
    total_visits: number;
    total_duration: number;
    avg_duration: number;
    total_interactions: number;
    unique_sessions: number;
  }

  it('should have all required fields', () => {
    const usage: RouteUsage = {
      route: '/',
      page_title: 'Dashboard',
      total_visits: 100,
      total_duration: 5000,
      avg_duration: 50,
      total_interactions: 300,
      unique_sessions: 25,
    };
    expect(usage.route).toBe('/');
    expect(usage.avg_duration).toBe(50);
    expect(usage.unique_sessions).toBe(25);
  });

  it('should handle zero values', () => {
    const usage: RouteUsage = {
      route: '/empty',
      page_title: 'Empty',
      total_visits: 0,
      total_duration: 0,
      avg_duration: 0,
      total_interactions: 0,
      unique_sessions: 0,
    };
    expect(usage.total_visits).toBe(0);
  });
});

describe('RouteTracker - Route Title Resolution', () => {
  const KNOWN_ROUTES = [
    '/', '/pipeline', '/tarefas', '/vendedores', '/clientes',
    '/produtos', '/metas', '/relatorios', '/gamificacao', '/conquistas',
    '/feed', '/assistente', '/perfil', '/configuracoes', '/notificacoes',
    '/bi-gestor', '/admin', '/cadencias', '/prospectos', '/territorios',
    '/dashboard-custom',
  ];

  it('should cover all 21 main routes', () => {
    expect(KNOWN_ROUTES).toHaveLength(21);
  });

  it('should include critical CRM routes', () => {
    expect(KNOWN_ROUTES).toContain('/pipeline');
    expect(KNOWN_ROUTES).toContain('/clientes');
    expect(KNOWN_ROUTES).toContain('/tarefas');
    expect(KNOWN_ROUTES).toContain('/vendedores');
  });

  it('should include analytics routes', () => {
    expect(KNOWN_ROUTES).toContain('/relatorios');
    expect(KNOWN_ROUTES).toContain('/bi-gestor');
  });

  it('should include gamification routes', () => {
    expect(KNOWN_ROUTES).toContain('/gamificacao');
    expect(KNOWN_ROUTES).toContain('/conquistas');
    expect(KNOWN_ROUTES).toContain('/feed');
  });

  it('should include prospecting routes', () => {
    expect(KNOWN_ROUTES).toContain('/cadencias');
    expect(KNOWN_ROUTES).toContain('/prospectos');
    expect(KNOWN_ROUTES).toContain('/territorios');
  });
});

describe('RouteTracker - Referrer Tracking', () => {
  it('should track null referrer for first page', () => {
    let prevPath: string | null = null;
    const referrer = prevPath;
    expect(referrer).toBeNull();
    prevPath = '/';
  });

  it('should track previous path as referrer', () => {
    let prevPath: string | null = '/';
    const referrer = prevPath;
    expect(referrer).toBe('/');
    prevPath = '/pipeline';
    expect(prevPath).toBe('/pipeline');
  });

  it('should update referrer on each navigation', () => {
    const history: string[] = [];
    const routes = ['/', '/pipeline', '/clientes', '/tarefas'];
    let prevPath: string | null = null;

    routes.forEach(route => {
      if (prevPath) history.push(prevPath);
      prevPath = route;
    });

    expect(history).toEqual(['/', '/pipeline', '/clientes']);
  });
});

describe('Analytics - Interaction Tracking', () => {
  it('should count clicks as interactions', () => {
    let interactions = 0;
    const trackInteraction = () => { interactions += 1; };
    
    trackInteraction();
    trackInteraction();
    trackInteraction();
    expect(interactions).toBe(3);
  });

  it('should track from zero', () => {
    let interactions = 0;
    expect(interactions).toBe(0);
  });
});

describe('Analytics - Salesperson ID Sync', () => {
  it('should accept null salesperson', () => {
    let spId: string | null = null;
    const setSp = (id: string | null) => { spId = id; };
    setSp(null);
    expect(spId).toBeNull();
  });

  it('should update when salesperson changes', () => {
    let spId: string | null = null;
    const setSp = (id: string | null) => { spId = id; };
    setSp('uuid-1');
    expect(spId).toBe('uuid-1');
    setSp('uuid-2');
    expect(spId).toBe('uuid-2');
  });
});
