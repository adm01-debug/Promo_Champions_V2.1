import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const inserts: Array<Record<string, unknown>> = [];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table !== 'notification_preferences')
        throw new Error(`tabela inesperada ${table}`);
      const q = {
        select: () => q,
        limit: () => q,
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        insert: (row: Record<string, unknown>) => {
          inserts.push(row);
          return Promise.resolve({ error: null });
        },
      };
      return q;
    },
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/generateMonthlyReport', () => ({ generateCurrentMonthReport: vi.fn() }));

const authState: { user: { id: string } | null } = { user: { id: 'user-1' } };
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authState }));

const { EmailReportConfig } = await import('./EmailReportConfig');

function renderConfig() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    createElement(QueryClientProvider, { client }, createElement(EmailReportConfig))
  );
}

describe('EmailReportConfig — primeira configuração', () => {
  beforeEach(() => {
    inserts.length = 0;
    authState.user = { id: 'user-1' };
  });

  it('insere com user_id do usuário logado (RLS exige user_id = auth.uid())', async () => {
    renderConfig();
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'gestor@x.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Configurações/ }));
    await waitFor(() => expect(inserts).toHaveLength(1));
    expect(inserts[0]).toMatchObject({ email: 'gestor@x.com', user_id: 'user-1' });
  });
});
