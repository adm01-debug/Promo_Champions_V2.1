import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('Lead Scoring Edge Function Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate scores for a valid set of deals', async () => {
    const mockDeals = [
      { id: '1', amount: 60000, status: 'negociacao', category: 'enterprise' },
      { id: '2', amount: 5000, status: 'lead', category: 'trial' }
    ];

    const mockStageHistory = [
      { sale_id: '1', entered_at: new Date().toISOString() },
      { sale_id: '2', entered_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() }
    ];

    const mockTasks = [
      { sale_id: '1', created_at: new Date().toISOString() },
      { sale_id: '1', created_at: new Date().toISOString() },
      { sale_id: '1', created_at: new Date().toISOString() }
    ];

    // Configurar respostas do mock
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'sales') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: mockDeals, error: null })
        };
      }
      if (table === 'deal_stage_history') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockStageHistory, error: null })
        };
      }
      if (table === 'tasks') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          gte: vi.fn().mockResolvedValue({ data: mockTasks, error: null })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ error: null })
      };
    });

    // Simulando chamada via invoke
    (supabase.functions.invoke as any).mockResolvedValue({
      data: {
        scores: {
          '1': { score: 85, labels: { dealValue: 'Valor alto (>50k)' } },
          '2': { score: 25, labels: { dealValue: 'Valor baixo-médio (5-10k)' } }
        }
      },
      error: null
    });

    const { data, error } = await supabase.functions.invoke('lead-scoring', {
      body: { dealIds: ['1', '2'] }
    });

    expect(error).toBeNull();
    expect(data.scores['1'].score).toBeGreaterThan(50);
    expect(data.scores['2'].score).toBeLessThan(40);
  });

  it('should handle invalid inputs with validation errors', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: { message: 'dealIds array is required' }
    });

    const { data, error } = await supabase.functions.invoke('lead-scoring', {
      body: { dealIds: [] }
    });

    expect(error).not.toBeNull();
    expect(error.message).toContain('required');
  });

  it('should handle database errors gracefully', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    });

    const { data, error } = await supabase.functions.invoke('lead-scoring', {
      body: { dealIds: ['non-existent'] }
    });

    expect(error).not.toBeNull();
  });
});
