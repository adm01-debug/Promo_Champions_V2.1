import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeagueSystem } from './LeagueSystem';

const mockUseLeagues = vi.fn();
const mockUseLeagueEnrollment = vi.fn();
const mockMutate = vi.fn();
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock('@/hooks/gamification/useLeagues', async importOriginal => {
  const actual = await importOriginal<typeof import('@/hooks/gamification/useLeagues')>();
  return {
    ...actual,
    useLeagues: () => mockUseLeagues(),
    useLeagueEnrollment: () => mockUseLeagueEnrollment(),
    useJoinLeague: () => ({ mutate: mockMutate, isPending: false }),
  };
});

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

const vendedor = (id: string, leagueId: string | null, points = 0) => ({
  id,
  salesperson_id: id,
  name: `Vendedor ${id}`,
  avatar_url: null,
  league: 'bronze' as const,
  points,
  league_id: leagueId,
});

const inscricao = (salespersonId: string | null, starterLeagueId: string | null) => ({
  data: { salespersonId, starterLeagueId },
  isError: false,
});

describe('LeagueSystem', () => {
  beforeEach(() => {
    mockUseLeagues.mockReset();
    mockUseLeagueEnrollment.mockReset();
    mockMutate.mockReset();
    mockToastError.mockReset();
    mockToastSuccess.mockReset();
  });

  it('não coloca vendedores sem inscrição na Liga Bronze', () => {
    mockUseLeagues.mockReturnValue({
      data: [vendedor('a', null), vendedor('b', null)],
      isLoading: false,
      isError: false,
    });
    mockUseLeagueEnrollment.mockReturnValue(inscricao('a', 'liga-1'));
    render(<LeagueSystem />);

    expect(screen.queryByText('Liga Bronze')).toBeNull();
    expect(screen.queryByText('Vendedor a')).toBeNull();
    expect(screen.getByText('Nenhum vendedor participa de uma liga ainda')).toBeTruthy();
  });

  it('sem liga cadastrada não oferece botão de entrar e explica o motivo', () => {
    mockUseLeagues.mockReturnValue({
      data: [vendedor('a', null)],
      isLoading: false,
      isError: false,
    });
    mockUseLeagueEnrollment.mockReturnValue(inscricao('a', null));
    render(<LeagueSystem />);

    expect(screen.queryByRole('button', { name: /Entrar na Liga/ })).toBeNull();
    expect(screen.getByText(/Nenhuma liga cadastrada ainda/)).toBeTruthy();
  });

  it('inscreve o vendedor logado na liga de entrada ao clicar em Entrar na Liga', () => {
    mockUseLeagues.mockReturnValue({
      data: [vendedor('a', 'liga-1', 120), vendedor('me', null)],
      isLoading: false,
      isError: false,
    });
    mockUseLeagueEnrollment.mockReturnValue(inscricao('me', 'liga-1'));
    render(<LeagueSystem />);

    fireEvent.click(screen.getByRole('button', { name: /Entrar na Liga/ }));
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0]?.[0]).toEqual({
      salespersonId: 'me',
      leagueId: 'liga-1',
    });

    const { onSuccess } = mockMutate.mock.calls[0]?.[1] ?? {};
    onSuccess();
    expect(mockToastSuccess).toHaveBeenCalledWith('Você entrou na liga!');
  });

  it('mostra toast de erro quando a inscrição falha', () => {
    mockUseLeagues.mockReturnValue({
      data: [vendedor('me', null)],
      isLoading: false,
      isError: false,
    });
    mockUseLeagueEnrollment.mockReturnValue(inscricao('me', 'liga-1'));
    render(<LeagueSystem />);

    fireEvent.click(screen.getByRole('button', { name: /Entrar na Liga/ }));
    const { onError } = mockMutate.mock.calls[0]?.[1] ?? {};
    onError(new Error('Você já participa de uma liga.'));
    expect(mockToastError).toHaveBeenCalledWith('Não foi possível entrar na liga', {
      description: 'Você já participa de uma liga.',
    });
  });

  it('lista apenas quem tem inscrição real e não oferece entrar a quem já participa', () => {
    mockUseLeagues.mockReturnValue({
      data: [vendedor('a', 'liga-1', 120), vendedor('b', null)],
      isLoading: false,
      isError: false,
    });
    mockUseLeagueEnrollment.mockReturnValue(inscricao('a', 'liga-1'));
    render(<LeagueSystem />);

    expect(screen.getByText('Liga Bronze')).toBeTruthy();
    expect(screen.getByText('Vendedor a')).toBeTruthy();
    expect(screen.queryByText('Vendedor b')).toBeNull();
    expect(screen.queryByRole('button', { name: /Entrar na Liga/ })).toBeNull();
  });

  it('usuário que não é vendedor não vê o botão de entrar', () => {
    mockUseLeagues.mockReturnValue({ data: [], isLoading: false, isError: false });
    mockUseLeagueEnrollment.mockReturnValue(inscricao(null, 'liga-1'));
    render(<LeagueSystem />);
    expect(screen.queryByRole('button', { name: /Entrar na Liga/ })).toBeNull();
  });

  it('mostra erro quando a consulta falha', () => {
    mockUseLeagues.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    mockUseLeagueEnrollment.mockReturnValue(inscricao('a', 'liga-1'));
    render(<LeagueSystem />);
    expect(screen.getByText(/Não foi possível carregar as ligas/)).toBeTruthy();
  });
});
