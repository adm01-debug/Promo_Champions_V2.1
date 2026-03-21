/**
 * BI Dashboards Logic Tests
 * Tests: SDR metrics, Closer metrics, Manager overview, Vendor analysis
 */
import { describe, it, expect } from 'vitest';

describe('BI SDR - Metrics Calculation', () => {
  const calculateContactRate = (contacted: number, totalLeads: number): number => {
    return totalLeads > 0 ? Math.round((contacted / totalLeads) * 100 * 10) / 10 : 0;
  };

  const calculateQualificationRate = (qualified: number, contacted: number): number => {
    return contacted > 0 ? Math.round((qualified / contacted) * 100 * 10) / 10 : 0;
  };

  const calculateMeetingRate = (meetings: number, qualified: number): number => {
    return qualified > 0 ? Math.round((meetings / qualified) * 100 * 10) / 10 : 0;
  };

  it('should calculate contact rate', () => {
    expect(calculateContactRate(75, 100)).toBe(75);
    expect(calculateContactRate(0, 100)).toBe(0);
    expect(calculateContactRate(50, 0)).toBe(0);
  });

  it('should calculate qualification rate', () => {
    expect(calculateQualificationRate(30, 75)).toBe(40);
  });

  it('should calculate meeting rate', () => {
    expect(calculateMeetingRate(15, 30)).toBe(50);
  });
});

describe('BI SDR - Activity Volume', () => {
  const calculateDailyAverage = (totalActivities: number, workDays: number): number => {
    return workDays > 0 ? Math.round(totalActivities / workDays) : 0;
  };

  const isAboveTarget = (daily: number, target: number): boolean => daily >= target;

  it('should compute daily average', () => {
    expect(calculateDailyAverage(220, 22)).toBe(10);
    expect(calculateDailyAverage(0, 22)).toBe(0);
    expect(calculateDailyAverage(100, 0)).toBe(0);
  });

  it('should check target threshold', () => {
    expect(isAboveTarget(12, 10)).toBe(true);
    expect(isAboveTarget(8, 10)).toBe(false);
    expect(isAboveTarget(10, 10)).toBe(true);
  });
});

describe('BI Closer - Win Rate', () => {
  const calculateWinRate = (won: number, total: number): number => {
    return total > 0 ? Math.round((won / total) * 100) : 0;
  };

  const calculateAvgDealSize = (totalValue: number, wonDeals: number): number => {
    return wonDeals > 0 ? Math.round(totalValue / wonDeals) : 0;
  };

  const calculatePipelineVelocity = (avgDealSize: number, winRate: number, avgCycleLength: number): number => {
    if (avgCycleLength <= 0) return 0;
    return Math.round((avgDealSize * (winRate / 100)) / avgCycleLength);
  };

  it('should calculate win rate', () => {
    expect(calculateWinRate(25, 100)).toBe(25);
    expect(calculateWinRate(0, 0)).toBe(0);
  });

  it('should calculate average deal size', () => {
    expect(calculateAvgDealSize(500000, 25)).toBe(20000);
    expect(calculateAvgDealSize(0, 0)).toBe(0);
  });

  it('should calculate pipeline velocity', () => {
    expect(calculatePipelineVelocity(20000, 25, 30)).toBe(167);
    expect(calculatePipelineVelocity(20000, 25, 0)).toBe(0);
  });
});

describe('BI Manager - Team Comparison', () => {
  const rankByRevenue = (team: { name: string; revenue: number }[]) => {
    return [...team].sort((a, b) => b.revenue - a.revenue);
  };

  const calculateTeamAverage = (team: { revenue: number }[]): number => {
    if (team.length === 0) return 0;
    return Math.round(team.reduce((s, t) => s + t.revenue, 0) / team.length);
  };

  it('should rank by revenue descending', () => {
    const team = [
      { name: 'A', revenue: 5000 },
      { name: 'B', revenue: 15000 },
      { name: 'C', revenue: 10000 },
    ];
    const ranked = rankByRevenue(team);
    expect(ranked[0].name).toBe('B');
    expect(ranked[2].name).toBe('A');
  });

  it('should calculate team average', () => {
    expect(calculateTeamAverage([{ revenue: 10000 }, { revenue: 20000 }])).toBe(15000);
    expect(calculateTeamAverage([])).toBe(0);
  });
});

describe('BI - Period Comparison', () => {
  const calculateGrowth = (current: number, previous: number): number => {
    if (previous <= 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  };

  it('should calculate positive growth', () => {
    expect(calculateGrowth(150, 100)).toBe(50);
  });

  it('should calculate negative growth', () => {
    expect(calculateGrowth(80, 100)).toBe(-20);
  });

  it('should handle zero previous', () => {
    expect(calculateGrowth(100, 0)).toBe(100);
    expect(calculateGrowth(0, 0)).toBe(0);
  });
});

describe('BI - Goal Achievement Status', () => {
  const getGoalStatus = (current: number, goal: number): 'exceeded' | 'on_track' | 'at_risk' | 'behind' => {
    if (goal <= 0) return 'on_track';
    const pct = (current / goal) * 100;
    if (pct >= 100) return 'exceeded';
    if (pct >= 75) return 'on_track';
    if (pct >= 50) return 'at_risk';
    return 'behind';
  };

  it('should classify exceeded', () => {
    expect(getGoalStatus(120, 100)).toBe('exceeded');
  });

  it('should classify on_track', () => {
    expect(getGoalStatus(80, 100)).toBe('on_track');
  });

  it('should classify at_risk', () => {
    expect(getGoalStatus(55, 100)).toBe('at_risk');
  });

  it('should classify behind', () => {
    expect(getGoalStatus(30, 100)).toBe('behind');
  });

  it('should handle zero goal', () => {
    expect(getGoalStatus(50, 0)).toBe('on_track');
  });
});
