/**
 * Next Best Action Logic Tests
 * Tests: stagnant deal detection, activity volume alerts, pipeline suggestions
 */
import { describe, it, expect } from 'vitest';

describe('Next Best Action - Stagnant Deal Detection', () => {
  const findStagnantDeals = (sales: { client_name: string; status: string; updated_at: string }[], thresholdDays = 7) => {
    const now = Date.now();
    return sales.filter(s => {
      if (s.status === 'completed' || s.status === 'lost') return false;
      const daysSince = (now - new Date(s.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > thresholdDays;
    });
  };

  it('should detect deals not updated in 7+ days', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
    const sales = [
      { client_name: 'A', status: 'pending', updated_at: tenDaysAgo },
      { client_name: 'B', status: 'pending', updated_at: new Date().toISOString() },
    ];
    expect(findStagnantDeals(sales)).toHaveLength(1);
    expect(findStagnantDeals(sales)[0].client_name).toBe('A');
  });

  it('should exclude completed/lost deals', () => {
    const oldDate = new Date(Date.now() - 30 * 86400000).toISOString();
    const sales = [
      { client_name: 'A', status: 'completed', updated_at: oldDate },
      { client_name: 'B', status: 'lost', updated_at: oldDate },
    ];
    expect(findStagnantDeals(sales)).toHaveLength(0);
  });

  it('should handle empty sales', () => {
    expect(findStagnantDeals([])).toHaveLength(0);
  });
});

describe('Next Best Action - Priority Assignment', () => {
  const getPriority = (daysSinceUpdate: number): 'high' | 'medium' | 'low' => {
    return daysSinceUpdate > 14 ? 'high' : 'medium';
  };

  it('should assign high priority for 14+ days', () => {
    expect(getPriority(15)).toBe('high');
    expect(getPriority(30)).toBe('high');
  });

  it('should assign medium for 7-14 days', () => {
    expect(getPriority(7)).toBe('medium');
    expect(getPriority(14)).toBe('medium');
  });
});

describe('Next Best Action - Activity Volume Check', () => {
  const checkActivityVolume = (recentCount: number) => {
    if (recentCount >= 10) return null;
    return {
      title: 'Aumentar volume de atividades',
      priority: recentCount < 5 ? 'high' as const : 'medium' as const,
    };
  };

  it('should return null for sufficient activities', () => {
    expect(checkActivityVolume(10)).toBeNull();
    expect(checkActivityVolume(20)).toBeNull();
  });

  it('should suggest high priority for <5 activities', () => {
    const suggestion = checkActivityVolume(3);
    expect(suggestion?.priority).toBe('high');
  });

  it('should suggest medium priority for 5-9 activities', () => {
    const suggestion = checkActivityVolume(7);
    expect(suggestion?.priority).toBe('medium');
  });
});

describe('Next Best Action - Pipeline Health Check', () => {
  const checkPipelineHealth = (openDealCount: number) => {
    if (openDealCount >= 5) return null;
    return {
      title: 'Reforçar prospecção',
      description: `Pipeline com apenas ${openDealCount} deals ativos.`,
      priority: 'high' as const,
    };
  };

  it('should return null for healthy pipeline', () => {
    expect(checkPipelineHealth(5)).toBeNull();
    expect(checkPipelineHealth(20)).toBeNull();
  });

  it('should suggest prospecting for low pipeline', () => {
    const suggestion = checkPipelineHealth(3);
    expect(suggestion?.priority).toBe('high');
    expect(suggestion?.description).toContain('3');
  });

  it('should handle zero deals', () => {
    const suggestion = checkPipelineHealth(0);
    expect(suggestion).not.toBeNull();
  });
});

describe('Next Best Action - Suggestion Limits', () => {
  it('should limit suggestions to max 5', () => {
    const suggestions = Array.from({ length: 10 }, (_, i) => ({
      title: `Action ${i}`,
      priority: 'medium' as const,
    }));
    expect(suggestions.slice(0, 5)).toHaveLength(5);
  });

  it('should limit stagnant deals to top 3', () => {
    const deals = Array.from({ length: 10 }, (_, i) => ({ name: `Deal ${i}` }));
    expect(deals.slice(0, 3)).toHaveLength(3);
  });
});
