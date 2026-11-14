import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { vi, describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import type { ActivityGoalProgress } from '@/hooks/activities/useActivityGoals';
import MetasAtividades from './MetasAtividades';

const progressMock = vi.hoisted(() => ({ data: [] as ActivityGoalProgress[] }));

vi.mock('@/hooks/activities/useActivityGoals', () => ({
  useActivityGoalProgress: () => ({ data: progressMock.data, isLoading: false }),
}));
vi.mock('@/hooks/sales/useSalespeople', () => ({
  useSalespeople: () => ({ data: [] }),
}));

// Componentes filhos com dados próprios: fora do escopo deste teste.
vi.mock('@/components/activities/ActivityGoalEditDialog', () => ({
  ActivityGoalEditDialog: () => null,
}));
vi.mock('@/components/activities/DailyActivityRanking', () => ({
  DailyActivityRanking: () => null,
}));
vi.mock('@/components/achievements/AchievementsHistory', () => ({
  AchievementsHistory: () => null,
}));
vi.mock('@/components/achievements/StreakRanking', () => ({
  StreakRanking: () => null,
}));
vi.mock('@/components/achievements/TeamAchievementStats', () => ({
  TeamAchievementStats: () => null,
}));
vi.mock('@/components/activities/ArenaPulseFeed', () => ({ ArenaPulseFeed: () => null }));
vi.mock('@/components/activities/ActivityVersusDuel', () => ({
  ActivityVersusDuel: () => null,
}));
vi.mock('@/components/activities/PredictiveVelocity', () => ({
  PredictiveVelocity: () => null,
}));
vi.mock('@/components/activities/ActivityHeatmap', () => ({
  ActivityHeatmap: () => null,
}));
vi.mock('@/components/activities/ArenaAITips', () => ({ ArenaAITips: () => null }));
vi.mock('@/components/activities/AchievementBadgeDisplay', () => ({
  AchievementBadgeDisplay: () => null,
}));
vi.mock('@/components/arena/EnhancedActivityCard', () => ({
  EnhancedActivityCard: () => null,
}));
vi.mock('@/components/activities/ActivityLogForm', () => ({
  ActivityLogForm: () => <div data-testid="activity-log-form" />,
}));

function makeProgress(id: string, name: string, overall: number): ActivityGoalProgress {
  const zero = { calls: 0, emails: 0, meetings: 0, linkedin: 0, whatsapp: 0 };
  return {
    salesperson_id: id,
    salesperson_name: name,
    avatar_url: null,
    role: 'sdr',
    goals: { ...zero, calls: 10 },
    current: zero,
    progress: { ...zero, overall },
    hasGoals: true,
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MetasAtividades />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

describe('MetasAtividades', () => {
  it('mostra indicadores calculados das metas reais, sem valores fixos', async () => {
    progressMock.data = [
      makeProgress('a', 'Ana Souza', 100),
      makeProgress('b', 'Bruno Lima', 80),
      makeProgress('c', 'Carla Dias', 20),
    ];
    renderPage();

    // 1 concluída de 3 com metas; 2 acima de 70% de 3.
    expect(await screen.findByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.queryByText('14/10')).not.toBeInTheDocument();
    expect(screen.queryByText('+12%')).not.toBeInTheDocument();
    // Avatares vêm dos vendedores reais (iniciais no fallback).
    expect(screen.getByTitle('Ana Souza')).toBeInTheDocument();
    expect(screen.queryByText('Modo Foco')).not.toBeInTheDocument();
  });

  it('"Registrar Atividade" abre o formulário real de registro', async () => {
    progressMock.data = [];
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /Registrar Atividade/i }));
    expect(await screen.findByTestId('activity-log-form')).toBeInTheDocument();
  });
});
