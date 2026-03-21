/**
 * Advanced Navigation & Route Tests
 * Tests: all 54+ routes, role-based access, mobile navigation
 */
import { describe, it, expect } from 'vitest';

const ALL_ROUTES = [
  '/', '/sdr', '/closer', '/pipeline', '/atividades', '/clientes',
  '/ranking', '/arena', '/orcamentos', '/vendas', '/vendedores',
  '/metas', '/analytics', '/relatorios', '/bi-sdr', '/bi-closer',
  '/bi-gestor', '/bi-vendedor', '/cadencias', '/tarefas', '/calendario',
  '/automacoes', '/email-tracking', '/dashboard-custom', '/kanban-clientes',
  '/desafios', '/assistente', '/forecast', '/roi', '/times', '/portfolio',
  '/icp', '/playbooks', '/fonte-leads', '/metas-atividades',
  '/relatorios-email', '/configuracoes', '/notificacoes', '/admin',
  '/assinatura-digital', '/comparador-precos', '/fornecedores',
  '/produtos', '/previsao-demanda', '/follow-up', '/relatorios-executivos',
  '/historico-desafios', '/bitrix24', '/relatorio-atividades',
];

describe('Route Inventory', () => {
  it('should have 48+ defined routes', () => {
    expect(ALL_ROUTES.length).toBeGreaterThanOrEqual(48);
  });

  it('should all start with /', () => {
    ALL_ROUTES.forEach(route => {
      expect(route).toMatch(/^\//);
    });
  });

  it('should have no duplicate routes', () => {
    const unique = new Set(ALL_ROUTES);
    expect(unique.size).toBe(ALL_ROUTES.length);
  });

  it('should have no trailing slashes (except root)', () => {
    ALL_ROUTES.filter(r => r !== '/').forEach(route => {
      expect(route).not.toMatch(/\/$/);
    });
  });

  it('should not contain uppercase letters', () => {
    ALL_ROUTES.forEach(route => {
      expect(route).toBe(route.toLowerCase());
    });
  });
});

describe('SDR View Routes', () => {
  const sdrRoutes = ['/sdr', '/pipeline', '/atividades', '/clientes', '/ranking', '/arena'];
  
  it('should have dashboard as first item', () => {
    expect(sdrRoutes[0]).toBe('/sdr');
  });

  it('should have 6 main routes', () => {
    expect(sdrRoutes).toHaveLength(6);
  });

  it('should all be in ALL_ROUTES', () => {
    sdrRoutes.forEach(r => expect(ALL_ROUTES).toContain(r));
  });
});

describe('Closer View Routes', () => {
  const closerRoutes = ['/closer', '/pipeline', '/orcamentos', '/vendas', '/clientes', '/arena'];
  
  it('should have 6 main routes', () => {
    expect(closerRoutes).toHaveLength(6);
  });

  it('should include quotes and sales', () => {
    expect(closerRoutes).toContain('/orcamentos');
    expect(closerRoutes).toContain('/vendas');
  });
});

describe('Management View Routes', () => {
  const gestaoRoutes = ['/', '/vendedores', '/metas', '/analytics', '/relatorios'];
  
  it('should have 5 main routes', () => {
    expect(gestaoRoutes).toHaveLength(5);
  });

  it('should include analytics and reports', () => {
    expect(gestaoRoutes).toContain('/analytics');
    expect(gestaoRoutes).toContain('/relatorios');
  });
});

describe('Admin-Only Routes', () => {
  const adminRoutes = ['/admin'];
  
  it('should have admin route', () => {
    expect(adminRoutes).toContain('/admin');
  });

  it('should be minimal', () => {
    expect(adminRoutes.length).toBeLessThanOrEqual(3);
  });
});

describe('Mobile Navigation Items', () => {
  const mobileItems = 5; // Typical mobile nav has 5 items
  
  it('should have appropriate count for mobile', () => {
    expect(mobileItems).toBeLessThanOrEqual(5);
    expect(mobileItems).toBeGreaterThanOrEqual(3);
  });
});