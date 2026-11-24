import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it, vi } from 'vitest';

const removeChannel = vi.fn();
const loadRows = vi.fn(() => Promise.resolve({ data: [], error: null }));

vi.mock('@/integrations/supabase/client', () => {
  const channel = {
    on: () => channel,
    subscribe: () => channel,
  };
  return {
    supabase: {
      channel: () => channel,
      removeChannel: (...args: unknown[]) => removeChannel(...args),
      from: () => {
        const builder = {
          select: () => builder,
          eq: () => loadRows(),
        };
        return builder;
      },
    },
  };
});

import RaceSpectator from './RaceSpectator';

function renderSpectator() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/corrida/espectador/season-1']}>
        <Routes>
          <Route path="/corrida/espectador/:seasonId" element={<RaceSpectator />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('RaceSpectator — canais de tempo real liberados (etapa 138)', () => {
  it('remove o canal ao desmontar a tela', () => {
    removeChannel.mockClear();
    const { unmount } = renderSpectator();

    expect(removeChannel).not.toHaveBeenCalled();
    unmount();
    expect(removeChannel).toHaveBeenCalledTimes(1);
  });
});
