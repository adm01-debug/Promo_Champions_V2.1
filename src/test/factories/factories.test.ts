/**
 * Mock Data Factories Tests
 * Validates that all factory functions produce consistent, valid data
 */
import { describe, it, expect } from 'vitest';
import {
  createMockSalesperson,
  createMockSale,
  createMockActivity,
  createMockClient,
  createMockTask,
  createMockQuote,
  createMockKPIs,
  createMockRanking,
} from '@/test/test-utils';

describe('Mock Data Factories', () => {
  describe('createMockSalesperson', () => {
    it('should create valid salesperson with defaults', () => {
      const sp = createMockSalesperson();
      expect(sp.id).toBeDefined();
      expect(sp.name).toBeDefined();
      expect(sp.email).toBeDefined();
      expect(sp.role).toBeDefined();
      expect(sp.is_active).toBe(true);
    });

    it('should allow overrides', () => {
      const sp = createMockSalesperson({ name: 'Custom', role: 'sdr' });
      expect(sp.name).toBe('Custom');
      expect(sp.role).toBe('sdr');
    });

    it('should preserve non-overridden defaults', () => {
      const sp = createMockSalesperson({ name: 'Override' });
      expect(sp.email).toBe('joao@test.com');
      expect(sp.is_active).toBe(true);
    });
  });

  describe('createMockSale', () => {
    it('should create valid sale', () => {
      const sale = createMockSale();
      expect(sale.amount).toBeGreaterThan(0);
      expect(sale.status).toBe('completed');
      expect(sale.client_name).toBeDefined();
    });

    it('should accept different statuses', () => {
      const sale = createMockSale({ status: 'pending' });
      expect(sale.status).toBe('pending');
    });
  });

  describe('createMockActivity', () => {
    it('should create valid activity', () => {
      const act = createMockActivity();
      expect(act.activity_type).toBe('call');
      expect(act.outcome).toBe('connected');
      expect(act.duration_minutes).toBeGreaterThan(0);
    });

    it('should accept all activity types', () => {
      const types = ['call', 'email', 'meeting', 'linkedin', 'whatsapp', 'other'] as const;
      types.forEach(type => {
        const act = createMockActivity({ activity_type: type });
        expect(act.activity_type).toBe(type);
      });
    });
  });

  describe('createMockClient', () => {
    it('should create valid client', () => {
      const client = createMockClient();
      expect(client.name).toBeDefined();
      expect(client.total_value).toBeGreaterThan(0);
    });
  });

  describe('createMockTask', () => {
    it('should create valid task', () => {
      const task = createMockTask();
      expect(task.completed).toBe(false);
      expect(task.priority).toBe('medium');
      expect(task.title).toBeDefined();
    });

    it('should accept all priority levels', () => {
      const priorities = ['low', 'medium', 'high', 'urgent'] as const;
      priorities.forEach(p => {
        const task = createMockTask({ priority: p });
        expect(task.priority).toBe(p);
      });
    });
  });

  describe('createMockQuote', () => {
    it('should create valid quote', () => {
      const quote = createMockQuote();
      expect(quote.subtotal).toBeGreaterThan(0);
      expect(quote.total).toBeLessThanOrEqual(quote.subtotal);
      expect(quote.status).toBe('draft');
    });

    it('total should equal subtotal minus discount', () => {
      const quote = createMockQuote();
      expect(quote.total).toBe(quote.subtotal - quote.discount_amount);
    });

    it('valid_until should be in the future', () => {
      const quote = createMockQuote();
      expect(new Date(quote.valid_until).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('createMockKPIs', () => {
    it('should create valid KPI data with comparisons', () => {
      const kpis = createMockKPIs();
      expect(kpis.current.totalRevenue).toBeGreaterThan(0);
      expect(kpis.previous.totalRevenue).toBeGreaterThan(0);
      expect(kpis.changes.revenue).toBeDefined();
    });

    it('current revenue should be greater than previous (default)', () => {
      const kpis = createMockKPIs();
      expect(kpis.current.totalRevenue).toBeGreaterThan(kpis.previous.totalRevenue);
    });

    it('should allow partial overrides', () => {
      const kpis = createMockKPIs({ current: { totalRevenue: 999 } });
      expect(kpis.current.totalRevenue).toBe(999);
      expect(kpis.current.totalSales).toBe(45); // Default preserved
    });
  });

  describe('createMockRanking', () => {
    it('should create ranked list', () => {
      const ranking = createMockRanking(5);
      expect(ranking).toHaveLength(5);
    });

    it('should have descending sales', () => {
      const ranking = createMockRanking(5);
      for (let i = 1; i < ranking.length; i++) {
        expect(ranking[i - 1].totalSales).toBeGreaterThan(ranking[i].totalSales);
      }
    });

    it('ranks should be sequential', () => {
      const ranking = createMockRanking(5);
      ranking.forEach((sp, i) => {
        expect(sp.rank).toBe(i + 1);
      });
    });

    it('top 3 should have titles', () => {
      const ranking = createMockRanking(5);
      expect(ranking[0].title).toBe('Lenda');
      expect(ranking[1].title).toBe('Elite');
      expect(ranking[2].title).toBe('Veterano');
      expect(ranking[3].title).toBeNull();
    });

    it('should handle edge case of 0 members', () => {
      const ranking = createMockRanking(0);
      expect(ranking).toHaveLength(0);
    });

    it('should handle edge case of 1 member', () => {
      const ranking = createMockRanking(1);
      expect(ranking).toHaveLength(1);
      expect(ranking[0].rank).toBe(1);
      expect(ranking[0].gapToFirst).toBe(0);
    });
  });
});
