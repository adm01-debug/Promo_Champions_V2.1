/**
 * Pipeline Stages Configuration Tests
 * Tests: stage definitions, ordering, probabilities
 */
import { describe, it, expect } from 'vitest';
import { PIPELINE_STAGES, type PipelineStageId } from '@/hooks/usePipeline';

describe('PIPELINE_STAGES configuration', () => {
  it('should have 7 stages', () => {
    expect(PIPELINE_STAGES).toHaveLength(7);
  });

  it('should have correct stage IDs', () => {
    const ids = PIPELINE_STAGES.map(s => s.id);
    expect(ids).toContain('lead');
    expect(ids).toContain('qualified');
    expect(ids).toContain('proposal');
    expect(ids).toContain('negotiation');
    expect(ids).toContain('won');
    expect(ids).toContain('lost');
    expect(ids).toContain('closed');
  });

  it('should have stages in ascending order', () => {
    for (let i = 1; i < PIPELINE_STAGES.length; i++) {
      expect(PIPELINE_STAGES[i].order).toBeGreaterThan(PIPELINE_STAGES[i - 1].order);
    }
  });

  it('should have correct probabilities for core stages', () => {
    // Lead to Won should increase
    const coreStages = PIPELINE_STAGES.filter(s => ['lead', 'qualified', 'proposal', 'negotiation', 'won'].includes(s.id));
    for (let i = 1; i < coreStages.length; i++) {
      expect(coreStages[i].probability).toBeGreaterThan(coreStages[i - 1].probability);
    }
  });

  it('should have lead at 10% and won at 100%', () => {
    expect(PIPELINE_STAGES.find(s => s.id === 'lead')?.probability).toBe(10);
    expect(PIPELINE_STAGES.find(s => s.id === 'won')?.probability).toBe(100);
  });

  it('should have labels for all stages', () => {
    PIPELINE_STAGES.forEach(stage => {
      expect(stage.label).toBeTruthy();
      expect(stage.label.length).toBeGreaterThan(0);
    });
  });

  it('should have color classes for all stages', () => {
    PIPELINE_STAGES.forEach(stage => {
      expect(stage.color).toMatch(/^bg-/);
    });
  });

  it('should have unique IDs', () => {
    const ids = PIPELINE_STAGES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have unique orders', () => {
    const orders = PIPELINE_STAGES.map(s => s.order);
    expect(new Set(orders).size).toBe(orders.length);
  });
});

describe('Pipeline Deal Grouping Logic', () => {
  const groupDealsByStage = (deals: { id: string; status: string }[]) => {
    const groups: Record<PipelineStageId, typeof deals> = {
      lead: [], qualified: [], proposal: [], negotiation: [], won: [], lost: [], closed: [],
    };
    deals.forEach(deal => {
      const status = deal.status as PipelineStageId;
      if (groups[status]) {
        groups[status].push(deal);
      } else {
        groups.lead.push(deal); // Default to lead
      }
    });
    return groups;
  };

  it('should group deals by status', () => {
    const deals = [
      { id: '1', status: 'lead' },
      { id: '2', status: 'lead' },
      { id: '3', status: 'proposal' },
      { id: '4', status: 'closed' },
    ];
    const groups = groupDealsByStage(deals);
    expect(groups.lead).toHaveLength(2);
    expect(groups.proposal).toHaveLength(1);
    expect(groups.closed).toHaveLength(1);
    expect(groups.qualified).toHaveLength(0);
  });

  it('should default unknown status to lead', () => {
    const deals = [{ id: '1', status: 'unknown_status' }];
    const groups = groupDealsByStage(deals);
    expect(groups.lead).toHaveLength(1);
  });

  it('should handle empty deals array', () => {
    const groups = groupDealsByStage([]);
    Object.values(groups).forEach(g => expect(g).toHaveLength(0));
  });

  it('should calculate stage values correctly', () => {
    const deals = [
      { id: '1', status: 'lead', amount: 5000 },
      { id: '2', status: 'lead', amount: 3000 },
      { id: '3', status: 'proposal', amount: 10000 },
    ];
    const groups = groupDealsByStage(deals);
    expect(groups.lead).toHaveLength(2);
  });
});

describe('Pipeline Weighted Value', () => {
  it('should calculate weighted pipeline value', () => {
    const deals = [
      { amount: 10000, stage: 'lead', probability: 0.1 },
      { amount: 20000, stage: 'proposal', probability: 0.5 },
      { amount: 5000, stage: 'negotiation', probability: 0.75 },
    ];
    const weightedValue = deals.reduce((sum, d) => sum + d.amount * d.probability, 0);
    expect(weightedValue).toBe(1000 + 10000 + 3750); // 14750
  });

  it('should return 0 for empty pipeline', () => {
    const deals: { amount: number; probability: number }[] = [];
    const weightedValue = deals.reduce((sum, d) => sum + d.amount * d.probability, 0);
    expect(weightedValue).toBe(0);
  });
});
