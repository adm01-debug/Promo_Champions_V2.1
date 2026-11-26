import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const challengeHookCalls: Array<string | undefined> = [];

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'auth-user-logado' },
    salesperson: { id: 'sp-logado' },
    loading: false,
  }),
}));

vi.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: () => ({ isAdmin: false, isManager: false }),
}));

vi.mock('@/hooks/gamification/useGamificationData', () => ({
  useGamificationData: () => ({
    data: [
      {
        salesperson_id: 'sp-outro',
        name: 'Outro Vendedor',
        avatar_url: null,
        role: 'sdr',
        totalXP: 999,
        level: 3,
        xpInLevel: 0,
        xpToNext: 100,
        levelTitle: 'Bronze',
        levelEmoji: '\u{1F949}',
        levelColor: 'text-amber-600',
        currentStreak: 4,
        bestStreak: 9,
        totalAchievements: 2,
        dailyGoalsAchieved: 1,
        streakMilestonesAchieved: 1,
      },
      {
        salesperson_id: 'sp-logado',
        name: 'Vendedor Logado',
        avatar_url: null,
        role: 'closer',
        totalXP: 10,
        level: 1,
        xpInLevel: 0,
        xpToNext: 100,
        levelTitle: 'Iniciante',
        levelEmoji: '\u{1F331}',
        levelColor: 'text-emerald-600',
        currentStreak: 0,
        bestStreak: 0,
        totalAchievements: 0,
        dailyGoalsAchieved: 0,
        streakMilestonesAchieved: 0,
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/gamification/useWeeklyChallenges', () => ({
  useChallengesWithProgress: (salespersonId?: string) => {
    challengeHookCalls.push(salespersonId);
    return { challenges: [], isLoading: false };
  },
  useClaimChallengeReward: () => ({ mutate: vi.fn(), isPending: false }),
  useDeactivateWeeklyChallenge: () => ({ mutate: vi.fn(), isPending: false }),
  CHALLENGE_ICONS: { calls: '\u{1F4DE}' },
  CHALLENGE_COLORS: { calls: 'from-blue-500 to-blue-600' },
}));

const { default: DesafiosSemanais } = await import('./DesafiosSemanais');

describe('DesafiosSemanais - desafios do vendedor logado', () => {
  beforeEach(() => {
    challengeHookCalls.length = 0;
  });

  it('pede os desafios do vendedor autenticado, nao do primeiro da lista', () => {
    render(
      <MemoryRouter>
        <HelmetProvider>
          <DesafiosSemanais />
        </HelmetProvider>
      </MemoryRouter>
    );

    // a pagina e o cartao de desafios consultam o vendedor logado
    expect(challengeHookCalls.length).toBeGreaterThan(0);
    expect(challengeHookCalls).toEqual(challengeHookCalls.map(() => 'sp-logado'));
    expect(challengeHookCalls).not.toContain('sp-outro');
    expect(screen.getByText('Meus Desafios')).toBeInTheDocument();
  });
});
