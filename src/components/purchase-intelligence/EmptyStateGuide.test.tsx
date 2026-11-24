import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EmptyStateGuide } from './EmptyStateGuide';

function renderGuide() {
  return render(
    <MemoryRouter initialEntries={['/inteligencia-compras']}>
      <Routes>
        <Route path="/inteligencia-compras" element={<EmptyStateGuide />} />
        <Route path="/configuracoes" element={<div>tela de configuracoes</div>} />
        <Route path="/docs" element={<div>tela de documentacao</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EmptyStateGuide — guia de estado vazio com ações reais (etapa 105)', () => {
  it('leva para a configuração ao clicar em Começar Configuração', async () => {
    renderGuide();
    await userEvent.click(screen.getByRole('button', { name: /Começar Configuração/i }));
    expect(screen.getByText('tela de configuracoes')).toBeTruthy();
  });

  it('leva para a documentação ao clicar em Ver Documentação', async () => {
    renderGuide();
    await userEvent.click(screen.getByRole('button', { name: /Ver Documentação/i }));
    expect(screen.getByText('tela de documentacao')).toBeTruthy();
  });
});
