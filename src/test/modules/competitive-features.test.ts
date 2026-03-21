/**
 * Competitive Features Tests
 * Tests: battles, matchups, seasons, leagues, kudos, victory feed
 */
import { describe, it, expect } from 'vitest';

describe('Sales Battles - Scoring', () => {
  const calculateBattleScore = (sales: { amount: number; created_at: string }[], startDate: string, endDate: string): number => {
    return sales
      .filter(s => s.created_at >= startDate && s.created_at <= endDate)
      .reduce((sum, s) => sum + s.amount, 0);
  };

  it('should sum sales within battle period', () => {
    const sales = [
      { amount: 1000, created_at: '2024-01-05' },
      { amount: 2000, created_at: '2024-01-10' },
      { amount: 500, created_at: '2024-02-01' },
    ];
    expect(calculateBattleScore(sales, '2024-01-01', '2024-01-31')).toBe(3000);
  });

  it('should return 0 for no sales in period', () => {
    expect(calculateBattleScore([], '2024-01-01', '2024-01-31')).toBe(0);
  });
});

describe('Weekly Matchups - Winner Detection', () => {
  const determineWinner = (scores: { playerId: string; score: number }[]): string | null => {
    if (scores.length === 0) return null;
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    if (sorted.length > 1 && sorted[0].score === sorted[1].score) return null; // Tie
    return sorted[0].playerId;
  };

  it('should find highest scorer', () => {
    expect(determineWinner([
      { playerId: 'A', score: 100 },
      { playerId: 'B', score: 150 },
    ])).toBe('B');
  });

  it('should return null for tie', () => {
    expect(determineWinner([
      { playerId: 'A', score: 100 },
      { playerId: 'B', score: 100 },
    ])).toBeNull();
  });

  it('should return null for empty', () => {
    expect(determineWinner([])).toBeNull();
  });
});

describe('Competitive Seasons', () => {
  const getSeasonStatus = (startDate: string, endDate: string): 'upcoming' | 'active' | 'ended' => {
    const now = Date.now();
    if (new Date(startDate).getTime() > now) return 'upcoming';
    if (new Date(endDate).getTime() < now) return 'ended';
    return 'active';
  };

  it('should detect active season', () => {
    const start = new Date(Date.now() - 86400000).toISOString();
    const end = new Date(Date.now() + 86400000 * 30).toISOString();
    expect(getSeasonStatus(start, end)).toBe('active');
  });

  it('should detect ended season', () => {
    expect(getSeasonStatus('2020-01-01', '2020-12-31')).toBe('ended');
  });

  it('should detect upcoming season', () => {
    expect(getSeasonStatus('2030-01-01', '2030-12-31')).toBe('upcoming');
  });
});

describe('Leagues - Tier System', () => {
  const getTier = (xp: number): { name: string; minXP: number; color: string } => {
    const tiers = [
      { name: 'Bronze', minXP: 0, color: '#CD7F32' },
      { name: 'Prata', minXP: 1000, color: '#C0C0C0' },
      { name: 'Ouro', minXP: 3000, color: '#FFD700' },
      { name: 'Platina', minXP: 6000, color: '#E5E4E2' },
      { name: 'Diamante', minXP: 10000, color: '#B9F2FF' },
    ];
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (xp >= tiers[i].minXP) return tiers[i];
    }
    return tiers[0];
  };

  it('should assign Bronze for low XP', () => {
    expect(getTier(0).name).toBe('Bronze');
    expect(getTier(500).name).toBe('Bronze');
  });

  it('should assign correct tiers', () => {
    expect(getTier(1500).name).toBe('Prata');
    expect(getTier(5000).name).toBe('Ouro');
    expect(getTier(8000).name).toBe('Platina');
    expect(getTier(15000).name).toBe('Diamante');
  });
});

describe('Kudos System', () => {
  const KUDOS_TYPES = ['teamwork', 'creativity', 'persistence', 'leadership', 'helpfulness'];

  const canSendKudos = (fromId: string, toId: string, recentKudos: { from: string; to: string; date: string }[]): boolean => {
    if (fromId === toId) return false;
    const today = new Date().toISOString().split('T')[0];
    const sentToday = recentKudos.filter(k => k.from === fromId && k.to === toId && k.date === today);
    return sentToday.length < 1;
  };

  it('should have 5 kudos types', () => {
    expect(KUDOS_TYPES).toHaveLength(5);
  });

  it('should prevent self-kudos', () => {
    expect(canSendKudos('A', 'A', [])).toBe(false);
  });

  it('should allow first kudos', () => {
    expect(canSendKudos('A', 'B', [])).toBe(true);
  });

  it('should prevent duplicate daily kudos', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(canSendKudos('A', 'B', [{ from: 'A', to: 'B', date: today }])).toBe(false);
  });
});

describe('Victory Feed - Item Types', () => {
  const FEED_TYPES = ['sale_closed', 'goal_achieved', 'challenge_completed', 'badge_earned', 'streak_milestone'];

  const formatFeedMessage = (type: string, data: { name: string; value?: number }): string => {
    const templates: Record<string, string> = {
      sale_closed: `${data.name} fechou uma venda de R$ ${data.value?.toLocaleString('pt-BR')}!`,
      goal_achieved: `${data.name} bateu a meta! 🎯`,
      challenge_completed: `${data.name} completou um desafio! ⚡`,
      badge_earned: `${data.name} desbloqueou uma conquista! 🏆`,
      streak_milestone: `${data.name} mantém uma sequência de ${data.value} dias! 🔥`,
    };
    return templates[type] || `${data.name} realizou uma ação`;
  };

  it('should have 5 feed types', () => {
    expect(FEED_TYPES).toHaveLength(5);
  });

  it('should format sale message', () => {
    const msg = formatFeedMessage('sale_closed', { name: 'João', value: 50000 });
    expect(msg).toContain('João');
    expect(msg).toContain('50.000');
  });

  it('should format goal message', () => {
    expect(formatFeedMessage('goal_achieved', { name: 'Maria' })).toContain('meta');
  });

  it('should handle unknown type', () => {
    expect(formatFeedMessage('unknown', { name: 'Test' })).toContain('Test');
  });
});
