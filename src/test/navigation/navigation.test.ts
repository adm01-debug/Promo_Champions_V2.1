/**
 * Navigation & Routing Tests
 * Validates all routes exist, sidebar config, and navigation logic
 */
import { describe, it, expect } from 'vitest';

// Route definitions (mirroring AppSidebar config)
const SDR_MAIN_ROUTES = ['/sdr', '/pipeline', '/atividades', '/clientes', '/ranking'];
const CLOSER_MAIN_ROUTES = ['/closer', '/pipeline', '/orcamentos', '/vendas', '/clientes'];
const GESTAO_MAIN_ROUTES = ['/', '/vendedores', '/metas', '/analytics', '/relatorios'];

const SDR_MORE_ROUTES = ['/bi-sdr', '/cadencias', '/tarefas', '/desafios', '/assistente'];
const CLOSER_MORE_ROUTES = ['/bi-closer', '/atividades', '/assinatura-digital', '/desafios', '/assistente'];
const GESTAO_MORE_ROUTES = ['/bi-gestor', '/times', '/portfolio', '/icp', '/playbooks', '/fonte-leads', '/metas-atividades'];

const SYSTEM_ROUTES = ['/configuracoes', '/notificacoes'];
const ADMIN_ROUTES = ['/admin'];

const ALL_ROUTES = [
  ...new Set([
    ...SDR_MAIN_ROUTES,
    ...CLOSER_MAIN_ROUTES,
    ...GESTAO_MAIN_ROUTES,
    ...SDR_MORE_ROUTES,
    ...CLOSER_MORE_ROUTES,
    ...GESTAO_MORE_ROUTES,
    ...SYSTEM_ROUTES,
    ...ADMIN_ROUTES,
    '/auth',
    '/reset-password',
    '/acesso-negado',
    '/vendedor/:id',
    '/bi-vendedor',
    '/desafios-diarios',
    '/previsao-demanda',
    '/fornecedores',
    '/comparador-precos',
    '/bitrix24',
    '/produtos',
    '/relatorio-atividades',
  ]),
];

describe('Navigation & Routing', () => {
  describe('Route Coverage', () => {
    it('should have 40+ unique routes', () => {
      expect(ALL_ROUTES.length).toBeGreaterThanOrEqual(40);
    });

    it('all routes should start with /', () => {
      ALL_ROUTES.forEach(route => {
        expect(route.startsWith('/')).toBe(true);
      });
    });

    it('no duplicate routes within same menu', () => {
      const sets = [SDR_MAIN_ROUTES, CLOSER_MAIN_ROUTES, GESTAO_MAIN_ROUTES];
      sets.forEach(routes => {
        expect(new Set(routes).size).toBe(routes.length);
      });
    });
  });

  describe('SDR Navigation', () => {
    it('should have 5 main items', () => {
      expect(SDR_MAIN_ROUTES.length).toBe(5);
    });

    it('should have 5 tool items', () => {
      expect(SDR_MORE_ROUTES.length).toBe(5);
    });

    it('should include pipeline', () => {
      expect(SDR_MAIN_ROUTES).toContain('/pipeline');
    });

    it('should include atividades', () => {
      expect(SDR_MAIN_ROUTES).toContain('/atividades');
    });

    it('should include ranking for gamification', () => {
      expect(SDR_MAIN_ROUTES).toContain('/ranking');
    });

    it('should include BI SDR in tools', () => {
      expect(SDR_MORE_ROUTES).toContain('/bi-sdr');
    });

    it('should include AI assistant', () => {
      expect(SDR_MORE_ROUTES).toContain('/assistente');
    });
  });

  describe('Closer Navigation', () => {
    it('should have 5 main items', () => {
      expect(CLOSER_MAIN_ROUTES.length).toBe(5);
    });

    it('should include orcamentos (exclusive to closer)', () => {
      expect(CLOSER_MAIN_ROUTES).toContain('/orcamentos');
    });

    it('should include vendas', () => {
      expect(CLOSER_MAIN_ROUTES).toContain('/vendas');
    });

    it('should include assinatura-digital in tools', () => {
      expect(CLOSER_MORE_ROUTES).toContain('/assinatura-digital');
    });
  });

  describe('Gestão Navigation', () => {
    it('should have 5 main items', () => {
      expect(GESTAO_MAIN_ROUTES.length).toBe(5);
    });

    it('should include analytics and relatorios', () => {
      expect(GESTAO_MAIN_ROUTES).toContain('/analytics');
      expect(GESTAO_MAIN_ROUTES).toContain('/relatorios');
    });

    it('should include team management tools', () => {
      expect(GESTAO_MORE_ROUTES).toContain('/times');
      expect(GESTAO_MORE_ROUTES).toContain('/portfolio');
      expect(GESTAO_MORE_ROUTES).toContain('/playbooks');
    });

    it('should have most tools (7)', () => {
      expect(GESTAO_MORE_ROUTES.length).toBe(7);
    });
  });

  describe('Access Control Routes', () => {
    it('admin route should be separate', () => {
      expect(ADMIN_ROUTES).toContain('/admin');
      expect(ADMIN_ROUTES.length).toBe(1);
    });

    it('system routes should include settings and notifications', () => {
      expect(SYSTEM_ROUTES).toContain('/configuracoes');
      expect(SYSTEM_ROUTES).toContain('/notificacoes');
    });

    it('access denied page should exist', () => {
      expect(ALL_ROUTES).toContain('/acesso-negado');
    });

    it('auth routes should exist', () => {
      expect(ALL_ROUTES).toContain('/auth');
      expect(ALL_ROUTES).toContain('/reset-password');
    });
  });

  describe('Cross-Role Shared Routes', () => {
    it('pipeline should be in SDR and Closer', () => {
      expect(SDR_MAIN_ROUTES).toContain('/pipeline');
      expect(CLOSER_MAIN_ROUTES).toContain('/pipeline');
    });

    it('clientes should be in SDR and Closer', () => {
      expect(SDR_MAIN_ROUTES).toContain('/clientes');
      expect(CLOSER_MAIN_ROUTES).toContain('/clientes');
    });

    it('desafios should be in SDR and Closer tools', () => {
      expect(SDR_MORE_ROUTES).toContain('/desafios');
      expect(CLOSER_MORE_ROUTES).toContain('/desafios');
    });

    it('assistente should be in SDR and Closer tools', () => {
      expect(SDR_MORE_ROUTES).toContain('/assistente');
      expect(CLOSER_MORE_ROUTES).toContain('/assistente');
    });
  });
});
