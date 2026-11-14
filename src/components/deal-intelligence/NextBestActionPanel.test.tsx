import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextBestActionPanel } from './NextBestActionPanel';

vi.mock('@/hooks/deal-intelligence/useDealHealth', () => ({
  useDealHealth: vi.fn(),
}));

import { useDealHealth } from '@/hooks/deal-intelligence/useDealHealth';

describe('NextBestActionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra estado vazio sem recomendação real (sem texto inventado)', () => {
    vi.mocked(useDealHealth).mockReturnValue({ data: null, isLoading: false } as never);

    render(<NextBestActionPanel saleId="s1" />);

    expect(
      screen.getByText('Sem recomendações para este deal ainda.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Raciocínio da IA')).not.toBeInTheDocument();
    expect(screen.queryByText(/65% de chance de estagnação/)).not.toBeInTheDocument();
    expect(screen.queryByText('Mapear Economic Buyer no deal')).not.toBeInTheDocument();
  });

  it('exibe ações e raciocínio vindos de deal_health_scores', () => {
    vi.mocked(useDealHealth).mockReturnValue({
      data: {
        recommended_actions: [{ title: 'Ligar para o decisor', priority: 'high' }],
        ai_recommendation: 'Deal sem atividade há 10 dias.',
      },
      isLoading: false,
    } as never);

    render(<NextBestActionPanel saleId="s1" />);

    expect(screen.getByText('Ligar para o decisor')).toBeInTheDocument();
    expect(screen.getByText('"Deal sem atividade há 10 dias."')).toBeInTheDocument();
    expect(
      screen.queryByText('Sem recomendações para este deal ainda.')
    ).not.toBeInTheDocument();
  });
});
