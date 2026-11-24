import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const data = vi.hoisted(() => ({
  row: {
    id: 'opt-1',
    email: 'maria@exemplo.com',
    source: 'unsubscribe_link',
    reason: null,
    created_at: '2026-11-01T00:00:00.000Z',
  },
  removeAsync: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/hooks/email/useEmailOptOuts', () => ({
  useEmailOptOuts: () => ({
    data: { rows: [data.row], total: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useAddEmailOptOut: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRemoveEmailOptOut: () => ({ mutateAsync: data.removeAsync, isPending: false }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('react-helmet-async', () => ({ Helmet: () => null }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: vi.fn() } }));
vi.mock('@/components/email/CampaignDeliveryLatencyCard', () => ({
  CampaignDeliveryLatencyCard: () => null,
}));
vi.mock('@/components/email/CampaignHealthAlertsCard', () => ({
  CampaignHealthAlertsCard: () => null,
}));
vi.mock('@/components/email/CampaignOptOutRateCard', () => ({
  CampaignOptOutRateCard: () => null,
}));
vi.mock('@/components/email/EmailSuppressionMetricsCard', () => ({
  EmailSuppressionMetricsCard: () => null,
}));
vi.mock('@/components/email/FailedDraftsCard', () => ({ FailedDraftsCard: () => null }));
vi.mock('@/components/email/RecoveryRateCard', () => ({ RecoveryRateCard: () => null }));

const { default: AdminSupressaoEmails } = await import('./AdminSupressaoEmails');

describe('AdminSupressaoEmails \u2014 remover da supressao', () => {
  beforeEach(() => {
    data.removeAsync.mockClear();
  });

  it('pede confirmacao antes de liberar o e-mail para disparo', async () => {
    render(
      <MemoryRouter>
        <AdminSupressaoEmails />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Remover maria@exemplo\.com da supress/ })
    );

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog.textContent).toContain('maria@exemplo.com');
    expect(data.removeAsync).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(data.removeAsync).toHaveBeenCalledWith('opt-1'));
  });

  it('cancelar mantem o e-mail suprimido', async () => {
    render(
      <MemoryRouter>
        <AdminSupressaoEmails />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Remover maria@exemplo\.com da supress/ })
    );
    await screen.findByRole('alertdialog');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(data.removeAsync).not.toHaveBeenCalled();
  });
});
