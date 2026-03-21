/**
 * Progressive Goals Logic Tests
 * Tests: level titles, goal labels, progress calculation
 */
import { describe, it, expect } from 'vitest';

const LEVEL_TITLES: Record<number, string> = {
  1: 'Iniciante', 2: 'Aprendiz', 3: 'Competente', 4: 'Avançado',
  5: 'Especialista', 6: 'Mestre', 7: 'Grão-Mestre', 8: 'Lenda',
  9: 'Mítico', 10: 'Transcendente',
};

const GOAL_LABELS: Record<string, { label: string; icon: string; unit: string }> = {
  revenue: { label: 'Receita', icon: '💰', unit: 'R$' },
  deals: { label: 'Negócios Fechados', icon: '🤝', unit: '' },
  calls: { label: 'Ligações', icon: '📞', unit: '' },
  meetings: { label: 'Reuniões', icon: '📅', unit: '' },
};

describe('Progressive Goals - Level Titles', () => {
  const getLevelTitle = (level: number) => LEVEL_TITLES[Math.min(level, 10)] || `Nível ${level}`;

  it('should return correct title for each level', () => {
    expect(getLevelTitle(1)).toBe('Iniciante');
    expect(getLevelTitle(5)).toBe('Especialista');
    expect(getLevelTitle(10)).toBe('Transcendente');
  });

  it('should cap at level 10', () => {
    expect(getLevelTitle(15)).toBe('Transcendente');
    expect(getLevelTitle(100)).toBe('Transcendente');
  });

  it('should have 10 defined levels', () => {
    expect(Object.keys(LEVEL_TITLES)).toHaveLength(10);
  });
});

describe('Progressive Goals - Goal Labels', () => {
  const getLabel = (type: string) => GOAL_LABELS[type] || { label: type, icon: '🎯', unit: '' };

  it('should return label for known types', () => {
    expect(getLabel('revenue').label).toBe('Receita');
    expect(getLabel('deals').label).toBe('Negócios Fechados');
    expect(getLabel('calls').label).toBe('Ligações');
    expect(getLabel('meetings').label).toBe('Reuniões');
  });

  it('should return fallback for unknown types', () => {
    const label = getLabel('custom_type');
    expect(label.label).toBe('custom_type');
    expect(label.icon).toBe('🎯');
  });

  it('should have currency unit for revenue', () => {
    expect(getLabel('revenue').unit).toBe('R$');
  });

  it('should have empty unit for count-based goals', () => {
    expect(getLabel('deals').unit).toBe('');
    expect(getLabel('calls').unit).toBe('');
  });
});

describe('Progressive Goals - Progress Percentage', () => {
  const calculateProgress = (current: number, target: number): number => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  it('should calculate percentage', () => {
    expect(calculateProgress(50, 100)).toBe(50);
    expect(calculateProgress(75, 100)).toBe(75);
  });

  it('should cap at 100%', () => {
    expect(calculateProgress(150, 100)).toBe(100);
  });

  it('should handle zero target', () => {
    expect(calculateProgress(50, 0)).toBe(0);
  });

  it('should handle zero progress', () => {
    expect(calculateProgress(0, 100)).toBe(0);
  });

  it('should round correctly', () => {
    expect(calculateProgress(1, 3)).toBe(33);
    expect(calculateProgress(2, 3)).toBe(67);
  });
});

describe('Progressive Goals - Level Multiplier', () => {
  const getMultiplier = (level: number): number => {
    return 1 + (level - 1) * 0.1;
  };

  it('should start at 1.0x for level 1', () => {
    expect(getMultiplier(1)).toBeCloseTo(1.0);
  });

  it('should increase by 0.1 per level', () => {
    expect(getMultiplier(2)).toBeCloseTo(1.1);
    expect(getMultiplier(5)).toBeCloseTo(1.4);
    expect(getMultiplier(10)).toBeCloseTo(1.9);
  });
});
