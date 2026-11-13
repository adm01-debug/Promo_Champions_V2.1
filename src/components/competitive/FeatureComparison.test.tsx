import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/conversational/useCompetitorsRegistry', () => ({
  useCompetitorMarketIntel: vi.fn(),
}));

import { useCompetitorMarketIntel } from '@/hooks/conversational/useCompetitorsRegistry';
import { FeatureComparison } from './FeatureComparison';

const mockHook = (value: Record<string, unknown>) =>
  vi.mocked(useCompetitorMarketIntel).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...value,
  } as never);

const renderComponent = () =>
  render(
    <MemoryRouter>
      <FeatureComparison />
    </MemoryRouter>
  );

describe('FeatureComparison (Market Intel)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mostra estado vazio honesto quando não há concorrentes cadastrados', () => {
    mockHook({ data: [] });
    renderComponent();

    expect(screen.getByText('Nenhum concorrente cadastrado')).toBeInTheDocument();
    expect(screen.queryByText(/Ramper/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Export PDF/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Executar Roadmap/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gerenciar concorrentes/i })).toHaveAttribute(
      'href',
      '/conversational-intelligence'
    );
  });

  it('lista concorrentes reais com menções e battle card vinculado', () => {
    mockHook({
      data: [
        {
          id: 'c1',
          name: 'Brindes XYZ',
          aliases: ['XYZ'],
          mentions: 7,
          battleCard: {
            id: 'a1',
            title: 'Card XYZ',
            file_url: 'https://exemplo.test/xyz',
          },
        },
        { id: 'c2', name: 'Outra Marca', aliases: [], mentions: 0, battleCard: null },
      ],
    });
    renderComponent();

    expect(screen.getByText('Brindes XYZ')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Card XYZ')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Abrir battle card Card XYZ/i })
    ).toHaveAttribute('href', 'https://exemplo.test/xyz');
    expect(screen.getByText('Sem battle card')).toBeInTheDocument();
  });

  it('mostra erro com ação de tentar novamente', () => {
    const refetch = vi.fn();
    mockHook({ isError: true, refetch });
    renderComponent();

    expect(
      screen.getByText('Não foi possível carregar os concorrentes.')
    ).toBeInTheDocument();
    screen.getByRole('button', { name: 'Tentar novamente' }).click();
    expect(refetch).toHaveBeenCalled();
  });
});
