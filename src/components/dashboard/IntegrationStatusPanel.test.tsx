import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { allowConsoleError } from '@/test/consoleGuard';

const from = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: unknown[]) => from(...args) },
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    promise: vi.fn(),
  }),
}));

import { toast } from 'sonner';

import { IntegrationStatusPanel } from './IntegrationStatusPanel';

type ChainResult = { data: unknown; error: unknown };

function chain(result: ChainResult) {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'order', 'limit', 'eq']) {
    builder[method] = () => builder;
  }
  builder.then = (
    resolve: (value: unknown) => unknown,
    reject?: (reason: unknown) => unknown
  ) => Promise.resolve(result).then(resolve, reject);
  return builder;
}

function renderPanel() {
  return render(<IntegrationStatusPanel />);
}

describe('IntegrationStatusPanel', () => {
  beforeEach(() => {
    from.mockReset();
    vi.mocked(toast.error).mockClear();
  });

  it('le os logs reais de email em vez da tabela sem produtor', async () => {
    from.mockReturnValue(chain({ data: [], error: null }));

    renderPanel();

    await waitFor(() => expect(from).toHaveBeenCalledWith('email_logs'));
    expect(from).not.toHaveBeenCalledWith('integration_logs');
  });

  it('mostra o evento de email gravado pelo servidor', async () => {
    from.mockReturnValue(
      chain({
        data: [
          {
            id: 'log-1',
            created_at: '2026-11-26T10:00:00Z',
            subject: 'Alerta de SLA estourado',
            status: 'sent',
            error_message: null,
            recipient_email: 'gestor@promobrindes.com.br',
          },
        ],
        error: null,
      })
    );

    renderPanel();

    expect(await screen.findByText('Alerta de SLA estourado')).toBeInTheDocument();
  });

  it('declara ausencia de fonte de log para push em vez de simular sucesso', async () => {
    from.mockReturnValue(chain({ data: [], error: null }));

    renderPanel();

    expect(await screen.findByText('SEM LOG')).toBeInTheDocument();
  });

  it('reporta erro de leitura em vez de fingir diagnostico limpo', async () => {
    allowConsoleError('Error fetching logs');
    from.mockReturnValue(chain({ data: null, error: { message: 'permission denied' } }));

    renderPanel();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(toast.error).toHaveBeenCalled();
  });
});
