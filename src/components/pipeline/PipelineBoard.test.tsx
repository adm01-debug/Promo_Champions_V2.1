import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const weekly: { data: number | undefined; isError: boolean } = {
  data: undefined,
  isError: false,
};
const emptyStages = {
  lead: [],
  qualified: [],
  proposal: [],
  negotiation: [],
  won: [],
  lost: [],
  closed: [],
};
const idleMutation = { mutate: vi.fn(), isPending: false };

function renderBoard() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PipelineBoard />
    </QueryClientProvider>
  );
}

vi.mock('@/hooks/pipeline/useWeeklyWonDeals', () => ({
  WEEKLY_WON_DEALS_WINDOW_DAYS: 7,
  useWeeklyWonDeals: () => weekly,
}));
vi.mock('@/hooks/usePipeline', async importOriginal => ({
  ...(await importOriginal<typeof import('@/hooks/usePipeline')>()),
  usePipelineDeals: () => ({
    data: emptyStages,
    isLoading: false,
    refetch: vi.fn(),
    isRefetching: false,
  }),
  useMoveDeal: () => idleMutation,
}));
vi.mock('@/hooks/useMultiplePipelines', () => ({
  usePipelines: () => ({ data: [], isLoading: false }),
  usePipelineStages: () => ({ data: [], isLoading: false }),
  usePipelineDealsByPipeline: () => ({
    data: undefined,
    isLoading: false,
    refetch: vi.fn(),
    isRefetching: false,
  }),
  useMoveDealMultiPipeline: () => idleMutation,
}));
vi.mock('@/hooks/useStageProbabilities', () => ({
  useStageProbabilities: () => ({ data: undefined }),
}));
vi.mock('@/hooks/useDealProbability', () => ({
  useDealProbabilities: () => ({ data: undefined }),
}));
vi.mock('@/hooks/useLeadScoring', () => ({
  useLeadScores: () => ({ data: undefined }),
  useCalculateLeadScores: () => idleMutation,
}));
vi.mock('@/hooks/useCadences', () => ({
  useActiveCadencesBySaleIds: () => ({ data: undefined }),
}));
vi.mock('@/hooks/useICPData', () => ({
  useICPByClientName: () => ({ data: undefined }),
}));
vi.mock('./PipelineColumn', () => ({ PipelineColumn: () => null }));
vi.mock('./PipelineSelector', () => ({ PipelineSelector: () => null }));
vi.mock('./PipelineHealthScore', () => ({ PipelineHealthScore: () => null }));
vi.mock('./DealCard', () => ({ DealCard: () => null }));

const { PipelineBoard } = await import('./PipelineBoard');

describe('PipelineBoard — vendas ganhas na semana', () => {
  beforeEach(() => {
    weekly.data = undefined;
    weekly.isError = false;
  });

  it('mostra a contagem real de vendas ganhas nos últimos 7 dias', () => {
    weekly.data = 3;
    renderBoard();

    expect(screen.getByTestId('weekly-won-deals')).toHaveTextContent('3 Deals');
    expect(screen.getByText('/ 7 dias')).toBeInTheDocument();
    expect(screen.queryByText('+12 Deals')).not.toBeInTheDocument();
  });

  it('não exibe o indicador fixo de Pipeline Health (92.4%)', () => {
    weekly.data = 2;
    renderBoard();

    expect(screen.getByTestId('weekly-won-deals')).toHaveTextContent('2 Deals');
    expect(screen.queryByText(/92\.4%/)).not.toBeInTheDocument();
    expect(screen.queryByText('Pipeline Health (P2)')).not.toBeInTheDocument();
  });

  it('usa singular quando há uma única venda ganha', () => {
    weekly.data = 1;
    renderBoard();

    expect(screen.getByTestId('weekly-won-deals')).toHaveTextContent('1 Deal');
  });

  it('não inventa número enquanto carrega ou quando a consulta falha', () => {
    weekly.isError = true;
    renderBoard();

    const value = screen.getByTestId('weekly-won-deals');
    expect(value).toHaveTextContent('—');
    expect(value).toHaveAttribute('title', 'Não foi possível carregar');
  });
});
