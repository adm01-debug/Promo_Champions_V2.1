/**
 * Coaching & Playbooks Tests
 * Tests: coaching recommendations, playbook steps, performance gaps
 */
import { describe, it, expect } from 'vitest';

describe('Coaching - Performance Gap Detection', () => {
  const detectGaps = (metrics: { metric: string; current: number; target: number }[]): { metric: string; gap: number; severity: string }[] => {
    return metrics
      .filter(m => m.current < m.target)
      .map(m => {
        const gap = Math.round(((m.target - m.current) / m.target) * 100);
        return {
          metric: m.metric,
          gap,
          severity: gap > 30 ? 'critical' : gap > 15 ? 'moderate' : 'mild',
        };
      })
      .sort((a, b) => b.gap - a.gap);
  };

  it('should detect gaps below target', () => {
    const gaps = detectGaps([
      { metric: 'calls', current: 50, target: 100 },
      { metric: 'emails', current: 90, target: 100 },
      { metric: 'meetings', current: 12, target: 10 },
    ]);
    expect(gaps).toHaveLength(2);
    expect(gaps[0].metric).toBe('calls');
  });

  it('should classify severity', () => {
    const gaps = detectGaps([
      { metric: 'calls', current: 30, target: 100 },
      { metric: 'emails', current: 80, target: 100 },
    ]);
    expect(gaps[0].severity).toBe('critical');
    expect(gaps[1].severity).toBe('moderate');
  });

  it('should return empty for all met', () => {
    expect(detectGaps([{ metric: 'calls', current: 100, target: 80 }])).toHaveLength(0);
  });
});

describe('Coaching - Recommendation Engine', () => {
  const getRecommendations = (weakAreas: string[]): string[] => {
    const recommendations: Record<string, string> = {
      calls: 'Aumente o volume de ligações diárias para 15+',
      emails: 'Melhore templates de email para maior taxa de resposta',
      meetings: 'Foque em qualificar melhor antes de agendar reuniões',
      conversion: 'Revise técnicas de fechamento e objeções comuns',
      ticket: 'Pratique upselling e cross-selling nas propostas',
    };
    return weakAreas.map(area => recommendations[area] || `Melhore a área: ${area}`);
  };

  it('should return specific recommendations', () => {
    const recs = getRecommendations(['calls', 'conversion']);
    expect(recs).toHaveLength(2);
    expect(recs[0]).toContain('ligações');
    expect(recs[1]).toContain('fechamento');
  });

  it('should handle unknown areas', () => {
    const recs = getRecommendations(['unknown_area']);
    expect(recs[0]).toContain('unknown_area');
  });

  it('should handle empty', () => {
    expect(getRecommendations([])).toHaveLength(0);
  });
});

describe('Playbook - Step Completion', () => {
  const calculatePlaybookProgress = (steps: { completed: boolean }[]): number => {
    if (steps.length === 0) return 0;
    const completed = steps.filter(s => s.completed).length;
    return Math.round((completed / steps.length) * 100);
  };

  it('should calculate progress', () => {
    expect(calculatePlaybookProgress([
      { completed: true }, { completed: true }, { completed: false }, { completed: false },
    ])).toBe(50);
  });

  it('should handle all complete', () => {
    expect(calculatePlaybookProgress([{ completed: true }, { completed: true }])).toBe(100);
  });

  it('should handle none complete', () => {
    expect(calculatePlaybookProgress([{ completed: false }])).toBe(0);
  });

  it('should handle empty', () => {
    expect(calculatePlaybookProgress([])).toBe(0);
  });
});

describe('Playbook - Next Step Detection', () => {
  const getNextStep = (steps: { order: number; completed: boolean; title: string }[]): string | null => {
    const sorted = [...steps].sort((a, b) => a.order - b.order);
    const next = sorted.find(s => !s.completed);
    return next?.title || null;
  };

  it('should find first incomplete step', () => {
    const steps = [
      { order: 1, completed: true, title: 'Pesquisar empresa' },
      { order: 2, completed: true, title: 'Preparar pitch' },
      { order: 3, completed: false, title: 'Fazer contato' },
      { order: 4, completed: false, title: 'Follow-up' },
    ];
    expect(getNextStep(steps)).toBe('Fazer contato');
  });

  it('should return null if all complete', () => {
    expect(getNextStep([{ order: 1, completed: true, title: 'Done' }])).toBeNull();
  });
});

describe('Playbook - Estimated Duration', () => {
  const estimateDuration = (steps: { durationMinutes: number; completed: boolean }[]): number => {
    return steps.filter(s => !s.completed).reduce((sum, s) => sum + s.durationMinutes, 0);
  };

  it('should sum remaining duration', () => {
    const steps = [
      { durationMinutes: 30, completed: true },
      { durationMinutes: 45, completed: false },
      { durationMinutes: 60, completed: false },
    ];
    expect(estimateDuration(steps)).toBe(105);
  });

  it('should be 0 when all complete', () => {
    expect(estimateDuration([{ durationMinutes: 30, completed: true }])).toBe(0);
  });
});

describe('Performance Trend Analysis', () => {
  const analyzeTrend = (weeklyScores: number[]): { direction: string; avgChange: number } => {
    if (weeklyScores.length < 2) return { direction: 'stable', avgChange: 0 };
    const changes = weeklyScores.slice(1).map((v, i) => v - weeklyScores[i]);
    const avgChange = Math.round((changes.reduce((a, b) => a + b, 0) / changes.length) * 10) / 10;
    return {
      direction: avgChange > 2 ? 'improving' : avgChange < -2 ? 'declining' : 'stable',
      avgChange,
    };
  };

  it('should detect improving', () => {
    expect(analyzeTrend([60, 65, 72, 80]).direction).toBe('improving');
  });

  it('should detect declining', () => {
    expect(analyzeTrend([80, 75, 68, 60]).direction).toBe('declining');
  });

  it('should detect stable', () => {
    expect(analyzeTrend([70, 71, 70, 71]).direction).toBe('stable');
  });
});
