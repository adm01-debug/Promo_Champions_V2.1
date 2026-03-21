/**
 * Data Integrity Tests
 * Tests: factory data consistency, mock data shape validation
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

describe('Mock Data Shape Validation', () => {
  describe('Salesperson', () => {
    it('should have all required fields', () => {
      const sp = createMockSalesperson();
      expect(sp).toHaveProperty('id');
      expect(sp).toHaveProperty('name');
      expect(sp).toHaveProperty('email');
      expect(sp).toHaveProperty('role');
      expect(sp).toHaveProperty('commission_rate');
      expect(sp).toHaveProperty('is_active');
    });

    it('should allow overrides', () => {
      const sp = createMockSalesperson({ name: 'Custom', commission_rate: 15 });
      expect(sp.name).toBe('Custom');
      expect(sp.commission_rate).toBe(15);
    });

    it('should have valid commission rate', () => {
      const sp = createMockSalesperson();
      expect(sp.commission_rate).toBeGreaterThanOrEqual(0);
      expect(sp.commission_rate).toBeLessThanOrEqual(100);
    });
  });

  describe('Sale', () => {
    it('should have all required fields', () => {
      const sale = createMockSale();
      expect(sale).toHaveProperty('id');
      expect(sale).toHaveProperty('client_name');
      expect(sale).toHaveProperty('amount');
      expect(sale).toHaveProperty('status');
      expect(sale).toHaveProperty('salesperson_id');
    });

    it('should have positive amount', () => {
      expect(createMockSale().amount).toBeGreaterThan(0);
    });

    it('should have valid status', () => {
      const validStatuses = ['draft', 'open', 'won', 'lost', 'completed', 'cancelled'];
      expect(validStatuses).toContain(createMockSale().status);
    });

    it('should have valid ISO date', () => {
      const sale = createMockSale();
      expect(() => new Date(sale.created_at)).not.toThrow();
      expect(new Date(sale.created_at).getTime()).not.toBeNaN();
    });
  });

  describe('Activity', () => {
    it('should have all required fields', () => {
      const act = createMockActivity();
      expect(act).toHaveProperty('id');
      expect(act).toHaveProperty('activity_type');
      expect(act).toHaveProperty('outcome');
      expect(act).toHaveProperty('salesperson_id');
    });

    it('should have valid activity type', () => {
      const validTypes = ['call', 'email', 'meeting', 'whatsapp', 'linkedin', 'task', 'note'];
      expect(validTypes).toContain(createMockActivity().activity_type);
    });

    it('should have positive duration', () => {
      const act = createMockActivity();
      expect(act.duration_minutes).toBeGreaterThan(0);
    });
  });

  describe('Client', () => {
    it('should have all required fields', () => {
      const client = createMockClient();
      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('name');
      expect(client).toHaveProperty('email');
      expect(client).toHaveProperty('phone');
      expect(client).toHaveProperty('total_value');
    });

    it('should have valid email format', () => {
      const client = createMockClient();
      expect(client.email).toMatch(/@/);
    });

    it('should have non-negative total value', () => {
      expect(createMockClient().total_value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Task', () => {
    it('should have all required fields', () => {
      const task = createMockTask();
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('assigned_to');
      expect(task).toHaveProperty('due_date');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('priority');
    });

    it('should have valid priority', () => {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      expect(validPriorities).toContain(createMockTask().priority);
    });

    it('should default to not completed', () => {
      expect(createMockTask().completed).toBe(false);
    });
  });

  describe('Quote', () => {
    it('should have all required fields', () => {
      const quote = createMockQuote();
      expect(quote).toHaveProperty('id');
      expect(quote).toHaveProperty('quote_number');
      expect(quote).toHaveProperty('subtotal');
      expect(quote).toHaveProperty('discount_amount');
      expect(quote).toHaveProperty('total');
    });

    it('should have total = subtotal - discount', () => {
      const q = createMockQuote();
      expect(q.total).toBe(q.subtotal - q.discount_amount);
    });

    it('should have future valid_until date', () => {
      const q = createMockQuote();
      expect(new Date(q.valid_until).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('KPIs', () => {
    it('should have current, previous and changes', () => {
      const kpis = createMockKPIs();
      expect(kpis).toHaveProperty('current');
      expect(kpis).toHaveProperty('previous');
      expect(kpis).toHaveProperty('changes');
    });

    it('should have positive revenue', () => {
      const kpis = createMockKPIs();
      expect(kpis.current.totalRevenue).toBeGreaterThan(0);
      expect(kpis.previous.totalRevenue).toBeGreaterThan(0);
    });

    it('should have consistent changes', () => {
      const kpis = createMockKPIs();
      const expectedRevenueChange = ((kpis.current.totalRevenue - kpis.previous.totalRevenue) / kpis.previous.totalRevenue) * 100;
      expect(kpis.changes.revenue).toBeCloseTo(expectedRevenueChange, 0);
    });
  });

  describe('Ranking', () => {
    it('should generate correct number of entries', () => {
      expect(createMockRanking(5)).toHaveLength(5);
      expect(createMockRanking(10)).toHaveLength(10);
      expect(createMockRanking(1)).toHaveLength(1);
    });

    it('should have ranks in order', () => {
      const ranking = createMockRanking(5);
      ranking.forEach((entry, i) => {
        expect(entry.rank).toBe(i + 1);
      });
    });

    it('should have descending sales values', () => {
      const ranking = createMockRanking(5);
      for (let i = 1; i < ranking.length; i++) {
        expect(ranking[i].totalSales).toBeLessThanOrEqual(ranking[i - 1].totalSales);
      }
    });

    it('should have first place with 0 gap to first', () => {
      const ranking = createMockRanking(3);
      expect(ranking[0].gapToFirst).toBe(0);
    });
  });
});