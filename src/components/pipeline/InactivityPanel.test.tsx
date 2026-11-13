import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { useInactiveDeals as UseInactiveDeals } from '@/hooks/useInactiveDeals';

type HookResult = ReturnType<typeof UseInactiveDeals>;

const refetch = vi.fn();
let hookResult: HookResult;

vi.mock('@/hooks/useInactiveDeals', () => ({
  useInactiveDeals: () => hookResult,
}));

const { InactivityPanel } = await import('./InactivityPanel');

const emptySummary = { critical: 0, moderate: 0, mild: 0, total: 0 };

function setHook(partial: Partial<HookResult>) {
  hookResult = {
    inactiveDeals: [],
    summary: emptySummary,
    isLoading: false,
    isError: false,
    refetch,
    ...partial,
  } as HookResult;
}

describe('InactivityPanel', () => {
  beforeEach(() => {
    refetch.mockReset();
  });

  it('mostra skeleton durante o carregamento, sem estado vazio', () => {
    setHook({ isLoading: true });
    render(<InactivityPanel />);

    expect(screen.getByTestId('inactivity-panel-loading')).toBeInTheDocument();
    expect(screen.queryByText(/Nenhum deal inativo/)).not.toBeInTheDocument();
  });

  it('mostra erro com retry quando a consulta falha, sem estado vazio', () => {
    setHook({ isError: true });
    render(<InactivityPanel />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Erro ao carregar deals inativos.'
    );
    expect(screen.queryByText(/Nenhum deal inativo/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('mostra estado vazio só quando carregou sem deals inativos', () => {
    setHook({});
    render(<InactivityPanel />);

    expect(screen.getByText(/Nenhum deal inativo/)).toBeInTheDocument();
  });

  it('lista os deals inativos retornados', () => {
    setHook({
      inactiveDeals: [
        {
          id: 'd1',
          clientName: 'Cliente X',
          stage: 'lead',
          daysInactive: 9,
          mildDays: 2,
          moderateDays: 3,
          criticalDays: 4,
          severity: 'critical',
          lastActivityDate: '2026-01-01T00:00:00Z',
          salespersonName: null,
          salespersonUserId: null,
        },
      ],
      summary: { critical: 1, moderate: 0, mild: 0, total: 1 },
    });
    render(<InactivityPanel />);

    expect(screen.getByText('Cliente X')).toBeInTheDocument();
    expect(screen.getByText('9d')).toBeInTheDocument();
  });
});
