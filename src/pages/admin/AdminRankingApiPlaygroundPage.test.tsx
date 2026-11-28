import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-helmet-async', () => ({ Helmet: () => null }));

vi.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/transitions/PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));

import AdminRankingApiPlaygroundPage from './AdminRankingApiPlaygroundPage';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

describe('Playground da ranking-api', () => {
  it('não chama a API sem token', async () => {
    render(
      <MemoryRouter>
        <AdminRankingApiPlaygroundPage />
      </MemoryRouter>
    );
    await userEvent.click(screen.getByRole('button', { name: /executar/i }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/informe o token da api/i)).toBeInTheDocument();
  });

  it('chama a function com o Bearer e exibe o JSON da resposta', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: '1', name: 'Maria' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(
      <MemoryRouter>
        <AdminRankingApiPlaygroundPage />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/token da api/i), 'tok_123');
    await userEvent.click(screen.getByRole('button', { name: /executar/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toContain('/functions/v1/ranking-api/v2/users');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer tok_123');

    const output = await screen.findByLabelText(/corpo da resposta/i);
    expect((output as HTMLTextAreaElement).value).toContain('Maria');
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('mostra o motivo do erro HTTP devolvido pela API', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Token inválido ou expirado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(
      <MemoryRouter>
        <AdminRankingApiPlaygroundPage />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/token da api/i), 'tok_errado');
    await userEvent.click(screen.getByRole('button', { name: /executar/i }));

    expect(await screen.findByText('403')).toBeInTheDocument();
    expect(screen.getByText(/token ausente, inválido ou expirado/i)).toBeInTheDocument();
    const output = screen.getByLabelText(/corpo da resposta/i) as HTMLTextAreaElement;
    expect(output.value).toContain('Token inválido ou expirado');
  });
});
