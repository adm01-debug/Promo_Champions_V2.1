import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const eq = vi.fn();
let row: {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
} | null = null;

vi.mock('@/integrations/supabase/client', () => {
  const query = {
    select: () => query,
    eq: (...args: unknown[]) => {
      eq(...args);
      return query;
    },
    maybeSingle: () => Promise.resolve({ data: row, error: null }),
  };
  return { supabase: { from: () => query } };
});

const { BattleCardSuggestion } = await import('./BattleCardSuggestion');

function renderSuggestion() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BattleCardSuggestion battleCardId="card-1" competitorName="Concorrente X" />
    </QueryClientProvider>
  );
}

describe('BattleCardSuggestion', () => {
  beforeEach(() => {
    eq.mockClear();
    row = null;
  });

  it('busca só battle card ativo (arquivado não é sugerido)', async () => {
    renderSuggestion();
    await waitFor(() => expect(eq).toHaveBeenCalledWith('is_active', true));
    expect(eq).toHaveBeenCalledWith('id', 'card-1');
  });

  it('não renderiza nada quando o material não volta (arquivado ou inexistente)', async () => {
    const { container } = renderSuggestion();
    await waitFor(() => expect(eq).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra o material ativo sugerido', async () => {
    row = {
      id: 'card-1',
      title: 'Battle card X',
      description: 'Pontos fortes',
      file_url: null,
    };
    renderSuggestion();
    expect(await screen.findByText('Battle card X')).toBeInTheDocument();
  });
});
