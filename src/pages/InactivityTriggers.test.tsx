import { render, screen, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { subDays } from 'date-fns';

const mutate = vi.fn<(payload: unknown, options: { onSuccess: () => void }) => void>();
const refetch = vi.fn();
const toastSuccess = vi.fn();
let hookState: Record<string, unknown> = {};

vi.mock('@/hooks/useInactiveDeals', () => ({
  INACTIVITY_RULES: [],
  useInactiveDeals: () => hookState,
}));

vi.mock('@/hooks/useNotifications', () => ({
  useSendNotification: () => ({ mutate, isPending: false, variables: undefined }),
}));

vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args), error: vi.fn() },
}));

const { default: InactivityTriggers } = await import('./InactivityTriggers');

const baseDeal = {
  stage: 'proposal',
  daysInactive: 12,
  mildDays: 5,
  moderateDays: 8,
  criticalDays: 10,
  severity: 'critical' as const,
  lastActivityDate: subDays(new Date(), 12).toISOString(),
};

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <InactivityTriggers />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('InactivityTriggers', () => {
  beforeEach(() => {
    mutate.mockReset();
    refetch.mockReset();
    toastSuccess.mockReset();
    hookState = {
      inactiveDeals: [],
      isLoading: false,
      isError: false,
      refetch,
    };
  });

  it('não afirma "Tudo em dia" enquanto carrega', () => {
    hookState = { ...hookState, isLoading: true };
    renderPage();
    expect(screen.queryByText(/Tudo em dia/)).toBeNull();
  });

  it('mostra erro com nova tentativa real quando a consulta falha', () => {
    hookState = { ...hookState, isError: true };
    renderPage();
    expect(screen.queryByText(/Tudo em dia/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('notifica o vendedor via send_notification e só confirma após sucesso', () => {
    hookState = {
      ...hookState,
      inactiveDeals: [
        {
          ...baseDeal,
          id: 'sale-1',
          clientName: 'Cliente A',
          salespersonName: 'Ana',
          salespersonUserId: 'user-ana',
        },
      ],
    };
    renderPage();

    expect(screen.queryByRole('button', { name: 'Ver deal' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Notificar vendedor' }));

    expect(mutate).toHaveBeenCalledTimes(1);
    const [payload, options] = mutate.mock.calls[0] ?? [];
    expect(payload).toMatchObject({
      user_id: 'user-ana',
      type: 'inactivity_alert',
      category: 'sales',
      priority: 'high',
      action_url: '/pipeline',
      metadata: { sale_id: 'sale-1', severity: 'critical', days_inactive: 12 },
    });
    expect(toastSuccess).not.toHaveBeenCalled();

    options?.onSuccess();
    expect(toastSuccess).toHaveBeenCalledWith('Ana notificado sobre "Cliente A"');
  });

  it('desabilita a notificação quando o deal não tem vendedor com acesso', () => {
    hookState = {
      ...hookState,
      inactiveDeals: [
        {
          ...baseDeal,
          id: 'sale-2',
          clientName: 'Cliente B',
          salespersonName: null,
          salespersonUserId: null,
        },
      ],
    };
    renderPage();

    const button = screen.getByRole('button', { name: 'Notificar vendedor' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mutate).not.toHaveBeenCalled();
  });
});
