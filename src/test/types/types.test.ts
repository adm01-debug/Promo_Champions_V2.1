/**
 * Type System Tests
 * Validates type definitions, interface contracts, and data shape integrity
 */
import { describe, it, expect } from 'vitest';
import type {
  Deal, Client, Activity, User, __PipelineStage, Pipeline,
  _Product, _DealProduct, _Cadence, _CadenceStep, Achievement,
  Goal, Task, _DateRange, _MetricData, FilterOptions,
  PaginationParams, PaginatedResponse, ApiResponse, ApiError,
} from '@/types';

describe('Type System - Runtime Shape Validation', () => {
  describe('Deal interface', () => {
    it('should accept valid deal object', () => {
      const deal: Deal = {
        id: '1',
        title: 'Deal Test',
        value: 10000,
        client_id: 'c-1',
        stage_id: 's-1',
        status: 'open',
        probability: 50,
        assigned_to: 'u-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      expect(deal.id).toBe('1');
      expect(deal.status).toBe('open');
    });

    it('should accept all valid status values', () => {
      const validStatuses: Deal['status'][] = [
        'open', 'won', 'lost', 'abandoned', 'lead',
        'qualified', 'proposal', 'negotiation', 'closed',
      ];
      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
      });
      expect(validStatuses.length).toBe(9);
    });

    it('should have optional fields', () => {
      const minimalDeal: Deal = {
        id: '1', title: 'Test', value: 0, client_id: 'c', stage_id: 's',
        status: 'open', probability: 0, assigned_to: 'u',
        created_at: '', updated_at: '',
      };
      expect(minimalDeal.amount).toBeUndefined();
      expect(minimalDeal.client_name).toBeUndefined();
      expect(minimalDeal.products).toBeUndefined();
      expect(minimalDeal.activities).toBeUndefined();
    });
  });

  describe('Client interface', () => {
    it('should accept valid client', () => {
      const client: Client = {
        id: '1', name: 'Test Corp',
        created_at: '', updated_at: '',
      };
      expect(client.name).toBe('Test Corp');
    });

    it('should validate segment enum values', () => {
      const validSegments: Client['segment'][] = ['enterprise', 'mid-market', 'smb', 'startup'];
      expect(validSegments.length).toBe(4);
    });
  });

  describe('Activity interface', () => {
    it('should validate activity types', () => {
      const validTypes: Activity['type'][] = ['call', 'email', 'meeting', 'note', 'whatsapp', 'linkedin'];
      expect(validTypes.length).toBe(6);
    });

    it('should validate outcome types', () => {
      const validOutcomes: Activity['outcome'][] = [
        'successful', 'no_answer', 'callback', 'not_interested', 'meeting_scheduled',
      ];
      expect(validOutcomes.length).toBe(5);
    });
  });

  describe('User interface', () => {
    it('should validate roles', () => {
      const validRoles: User['role'][] = ['admin', 'manager', 'sales_rep', 'sales_ops'];
      expect(validRoles.length).toBe(4);
    });
  });

  describe('Achievement interface', () => {
    it('should validate tiers', () => {
      const validTiers: Achievement['tier'][] = ['bronze', 'silver', 'gold', 'platinum'];
      expect(validTiers.length).toBe(4);
    });

    it('should validate categories', () => {
      const validCategories: Achievement['category'][] = ['sales', 'activity', 'streak', 'team', 'revenue'];
      expect(validCategories.length).toBe(5);
    });
  });

  describe('Task interface', () => {
    it('should validate priority levels', () => {
      const validPriorities: Task['priority'][] = ['low', 'medium', 'high', 'urgent'];
      expect(validPriorities.length).toBe(4);
    });

    it('should validate task types', () => {
      const validTypes: Task['task_type'][] = ['call', 'email', 'meeting', 'follow_up', 'other'];
      expect(validTypes!.length).toBe(5);
    });
  });

  describe('Goal interface', () => {
    it('should validate period types', () => {
      const validPeriods: Goal['period'][] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
      expect(validPeriods.length).toBe(5);
    });

    it('should validate goal types', () => {
      const validTypes: Goal['type'][] = ['revenue', 'deals', 'calls', 'meetings', 'emails'];
      expect(validTypes.length).toBe(5);
    });
  });

  describe('PaginationParams', () => {
    it('should accept valid pagination', () => {
      const params: PaginationParams = { page: 1, pageSize: 20 };
      expect(params.page).toBeGreaterThan(0);
    });

    it('should accept sort params', () => {
      const params: PaginationParams = {
        page: 1, pageSize: 20, sortBy: 'created_at', sortOrder: 'desc',
      };
      expect(params.sortOrder).toBe('desc');
    });
  });

  describe('PaginatedResponse', () => {
    it('should calculate totalPages correctly', () => {
      const response: PaginatedResponse<Deal> = {
        data: [], total: 100, page: 1, pageSize: 20, totalPages: 5,
      };
      expect(response.totalPages).toBe(Math.ceil(response.total / response.pageSize));
    });

    it('should handle empty results', () => {
      const response: PaginatedResponse<Deal> = {
        data: [], total: 0, page: 1, pageSize: 20, totalPages: 0,
      };
      expect(response.data).toHaveLength(0);
      expect(response.totalPages).toBe(0);
    });
  });

  describe('ApiResponse', () => {
    it('should handle success response', () => {
      const response: ApiResponse<string> = { data: 'success' };
      expect(response.error).toBeUndefined();
    });

    it('should handle error response', () => {
      const response: ApiResponse<null> = { data: null, error: 'Something failed' };
      expect(response.error).toBeDefined();
    });
  });

  describe('ApiError', () => {
    it('should have required fields', () => {
      const error: ApiError = { code: 'NOT_FOUND', message: 'Resource not found' };
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBeDefined();
    });
  });

  describe('FilterOptions', () => {
    it('should accept empty filters', () => {
      const filters: FilterOptions = {};
      expect(Object.keys(filters)).toHaveLength(0);
    });

    it('should accept all filter combinations', () => {
      const filters: FilterOptions = {
        dateRange: { start: new Date(), end: new Date() },
        userId: 'u-1',
        teamId: 't-1',
        stageId: 's-1',
        status: 'open',
        segment: 'enterprise',
        search: 'test query',
      };
      expect(Object.keys(filters).length).toBe(7);
    });
  });
});
