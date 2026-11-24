import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/win-loss/useDeadLettersCounts', () => ({
  useDeadLettersCounts: () => ({ data: { pending: 0 } }),
}));

import { AdminQuickLinks } from './AdminQuickLinks';

function renderLinks() {
  return render(
    <MemoryRouter>
      <AdminQuickLinks />
    </MemoryRouter>
  );
}

describe('AdminQuickLinks — telas de alerta de webhook (etapa 110)', () => {
  it('leva às configurações de alerta de webhook', () => {
    renderLinks();

    expect(screen.getByRole('link', { name: /Alertas de Webhook/ })).toHaveAttribute(
      'href',
      '/admin/webhooks-alert-settings'
    );
  });

  it('leva ao histórico de alertas de webhook', () => {
    renderLinks();

    expect(screen.getByRole('link', { name: /Histórico de Alertas/ })).toHaveAttribute(
      'href',
      '/admin/webhooks-alert-history'
    );
  });
});

describe('AdminQuickLinks — telas de conformidade (etapa 111)', () => {
  it('leva às solicitações do titular (LGPD)', () => {
    renderLinks();

    expect(screen.getByRole('link', { name: /LGPD — Titular/ })).toHaveAttribute(
      'href',
      '/admin/solicitacoes-titular'
    );
  });

  it('leva à supressão de e-mails', () => {
    renderLinks();

    expect(screen.getByRole('link', { name: /Supressão de E-mails/ })).toHaveAttribute(
      'href',
      '/admin/supressao-emails'
    );
  });
});
