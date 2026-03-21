/**
 * Team & Portfolio Management Tests
 * Tests: team formation, client assignment, capacity planning
 */
import { describe, it, expect } from 'vitest';

describe('Team Formation Logic', () => {
  interface TeamMember { id: string; role: string; capacity: number }

  const isBalancedTeam = (members: TeamMember[]): boolean => {
    const hasCloser = members.some(m => m.role === 'closer');
    const hasSDR = members.some(m => m.role === 'sdr');
    return hasCloser && hasSDR && members.length >= 2;
  };

  it('should validate balanced team', () => {
    const team: TeamMember[] = [
      { id: '1', role: 'sdr', capacity: 50 },
      { id: '2', role: 'closer', capacity: 30 },
    ];
    expect(isBalancedTeam(team)).toBe(true);
  });

  it('should reject all-SDR team', () => {
    const team: TeamMember[] = [
      { id: '1', role: 'sdr', capacity: 50 },
      { id: '2', role: 'sdr', capacity: 50 },
    ];
    expect(isBalancedTeam(team)).toBe(false);
  });

  it('should reject single member team', () => {
    expect(isBalancedTeam([{ id: '1', role: 'closer', capacity: 30 }])).toBe(false);
  });

  it('should reject empty team', () => {
    expect(isBalancedTeam([])).toBe(false);
  });
});

describe('Client Assignment - Round Robin', () => {
  const roundRobin = (salespeople: string[], currentIndex: number): { assigned: string; nextIndex: number } => {
    if (salespeople.length === 0) return { assigned: '', nextIndex: 0 };
    const idx = currentIndex % salespeople.length;
    return { assigned: salespeople[idx], nextIndex: idx + 1 };
  };

  it('should assign to first person', () => {
    const { assigned } = roundRobin(['A', 'B', 'C'], 0);
    expect(assigned).toBe('A');
  });

  it('should rotate through list', () => {
    let idx = 0;
    const assignments: string[] = [];
    for (let i = 0; i < 6; i++) {
      const { assigned, nextIndex } = roundRobin(['A', 'B', 'C'], idx);
      assignments.push(assigned);
      idx = nextIndex;
    }
    expect(assignments).toEqual(['A', 'B', 'C', 'A', 'B', 'C']);
  });

  it('should handle single salesperson', () => {
    const { assigned } = roundRobin(['Only'], 0);
    expect(assigned).toBe('Only');
  });

  it('should handle empty list', () => {
    const { assigned } = roundRobin([], 0);
    expect(assigned).toBe('');
  });
});

describe('Capacity Planning', () => {
  const calculateUtilization = (assignedClients: number, maxCapacity: number): number => {
    if (maxCapacity <= 0) return 0;
    return Math.round((assignedClients / maxCapacity) * 100);
  };

  const getCapacityStatus = (utilization: number): 'available' | 'busy' | 'overloaded' => {
    if (utilization >= 100) return 'overloaded';
    if (utilization >= 80) return 'busy';
    return 'available';
  };

  it('should calculate utilization percentage', () => {
    expect(calculateUtilization(15, 30)).toBe(50);
    expect(calculateUtilization(30, 30)).toBe(100);
  });

  it('should handle zero capacity', () => {
    expect(calculateUtilization(5, 0)).toBe(0);
  });

  it('should detect available status', () => {
    expect(getCapacityStatus(50)).toBe('available');
  });

  it('should detect busy status', () => {
    expect(getCapacityStatus(85)).toBe('busy');
  });

  it('should detect overloaded status', () => {
    expect(getCapacityStatus(100)).toBe('overloaded');
    expect(getCapacityStatus(120)).toBe('overloaded');
  });
});

describe('Portfolio Health Score', () => {
  const calculateHealthScore = (metrics: {
    recentPurchaseRatio: number;
    contactFrequency: number;
    revenueGrowth: number;
  }): number => {
    return Math.min(100, Math.round(
      metrics.recentPurchaseRatio * 40 +
      metrics.contactFrequency * 30 +
      Math.max(0, metrics.revenueGrowth) * 30
    ));
  };

  it('should return high score for healthy portfolio', () => {
    expect(calculateHealthScore({
      recentPurchaseRatio: 0.8,
      contactFrequency: 0.9,
      revenueGrowth: 0.5,
    })).toBeGreaterThan(70);
  });

  it('should return low score for unhealthy portfolio', () => {
    expect(calculateHealthScore({
      recentPurchaseRatio: 0.1,
      contactFrequency: 0.1,
      revenueGrowth: -0.2,
    })).toBeLessThan(20);
  });

  it('should cap at 100', () => {
    expect(calculateHealthScore({
      recentPurchaseRatio: 1,
      contactFrequency: 1,
      revenueGrowth: 1,
    })).toBe(100);
  });

  it('should ignore negative revenue growth', () => {
    const negative = calculateHealthScore({ recentPurchaseRatio: 0.5, contactFrequency: 0.5, revenueGrowth: -0.5 });
    const zero = calculateHealthScore({ recentPurchaseRatio: 0.5, contactFrequency: 0.5, revenueGrowth: 0 });
    expect(negative).toBe(zero);
  });
});

describe('Lead Source Attribution', () => {
  const attributeLeads = (leads: { source: string; converted: boolean }[]) => {
    const map = new Map<string, { total: number; converted: number }>();
    leads.forEach(lead => {
      const entry = map.get(lead.source) || { total: 0, converted: 0 };
      entry.total++;
      if (lead.converted) entry.converted++;
      map.set(lead.source, entry);
    });
    return Array.from(map.entries()).map(([source, data]) => ({
      source,
      ...data,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0,
    }));
  };

  it('should attribute leads by source', () => {
    const leads = [
      { source: 'Inbound', converted: true },
      { source: 'Inbound', converted: false },
      { source: 'Outbound', converted: true },
    ];
    const result = attributeLeads(leads);
    const inbound = result.find(r => r.source === 'Inbound');
    expect(inbound?.total).toBe(2);
    expect(inbound?.converted).toBe(1);
    expect(inbound?.conversionRate).toBe(50);
  });

  it('should handle empty leads', () => {
    expect(attributeLeads([])).toHaveLength(0);
  });
});
