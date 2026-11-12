import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeagueSystem } from './LeagueSystem';

const mockUseLeagues = vi.fn();

vi.mock('@/hooks/gamification/useLeagues', async importOriginal => {
  const actual = await importOriginal<typeof import('@/hooks/gamification/useLeagues')>();
  return { ...actual, useLeagues: () => mockUseLeagues() };
});

const vendedor = (id: string, leagueId: string | null, points = 0) => ({
  id,
  salesperson_id: id,
  name: `Vendedor ${id}`,
  avatar_url: null,
  league: 'bronze' as const,
  points,
  league_id: leagueId,
});

describe('LeagueSystem', () => {
  beforeEach(() => mockUseLeagues.mockReset());

  it('não coloca vendedores sem inscrição na Liga Bronze e mostra o bloqueio', () => {
    mockUseLeagues.mockReturnValue({
      data: [vendedor('a', null), vendedor('b', null)],
      isLoading: false,
      isError: false,
    });
    render(<LeagueSystem />);

    expect(screen.queryByText('Liga Bronze')).toBeNull();
    expect(screen.queryByText('Vendedor a')).toBeNull();
    expect(screen.getByText('Nenhum vendedor participa de uma liga ainda')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Entrar na Liga/ })).toHaveProperty(
      'disabled',
      true
    );
  });

  it('lista apenas quem tem inscrição real em league_members', () => {
    mockUseLeagues.mockReturnValue({
      data: [vendedor('a', 'liga-1', 120), vendedor('b', null)],
      isLoading: false,
      isError: false,
    });
    render(<LeagueSystem />);

    expect(screen.getByText('Liga Bronze')).toBeTruthy();
    expect(screen.getByText('Vendedor a')).toBeTruthy();
    expect(screen.queryByText('Vendedor b')).toBeNull();
    expect(screen.queryByRole('button', { name: /Entrar na Liga/ })).toBeNull();
  });

  it('mostra erro quando a consulta falha', () => {
    mockUseLeagues.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<LeagueSystem />);
    expect(screen.getByText(/Não foi possível carregar as ligas/)).toBeTruthy();
  });
});
