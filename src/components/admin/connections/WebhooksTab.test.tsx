import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const hooks = vi.hoisted(() => ({
  list: { data: [] as unknown[], isLoading: false },
  del: { mutate: vi.fn(), isPending: false },
  test: { mutate: vi.fn(), isPending: false },
}));

vi.mock('@/hooks/useWebhooks', () => ({
  WEBHOOK_EVENTS: ['deal.created', 'deal.won'],
  useWebhooks: () => hooks.list,
  useDeleteWebhook: () => hooks.del,
  useTestWebhook: () => hooks.test,
}));

import { WebhooksTab } from './WebhooksTab';

const webhook = {
  id: 'w-1',
  name: 'CRM Bitrix',
  url: 'https://exemplo.test/hook',
  events: ['deal.won'],
  secret: 's',
  headers: null,
  is_active: true,
  failure_count: 0,
  last_triggered_at: null,
  last_success_at: null,
  last_failure_at: null,
  created_at: '2026-11-01T00:00:00Z',
};

function renderTab() {
  return render(
    <MemoryRouter>
      <WebhooksTab />
    </MemoryRouter>
  );
}

describe('WebhooksTab (confirmação de remoção)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.list = { data: [], isLoading: false };
    hooks.del = { mutate: vi.fn(), isPending: false };
    hooks.test = { mutate: vi.fn(), isPending: false };
  });

  it('não remove o webhook antes da confirmação', async () => {
    hooks.list = { data: [webhook], isLoading: false };
    renderTab();

    fireEvent.click(screen.getByRole('button', { name: 'Remover webhook CRM Bitrix' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog.textContent).toContain('CRM Bitrix');
    expect(hooks.del.mutate).not.toHaveBeenCalled();
  });

  it('remove o webhook ao confirmar', async () => {
    hooks.list = { data: [webhook], isLoading: false };
    renderTab();

    fireEvent.click(screen.getByRole('button', { name: 'Remover webhook CRM Bitrix' }));
    await screen.findByRole('alertdialog');
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(hooks.del.mutate).toHaveBeenCalledTimes(1));
    expect(hooks.del.mutate).toHaveBeenCalledWith('w-1', expect.anything());
  });

  it('cancelar mantém o webhook', async () => {
    hooks.list = { data: [webhook], isLoading: false };
    renderTab();

    fireEvent.click(screen.getByRole('button', { name: 'Remover webhook CRM Bitrix' }));
    await screen.findByRole('alertdialog');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(hooks.del.mutate).not.toHaveBeenCalled();
  });
});
