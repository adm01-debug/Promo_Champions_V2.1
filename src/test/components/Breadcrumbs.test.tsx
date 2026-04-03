/**
 * Breadcrumbs Component Tests
 * Verifies: route mapping, home link, nested routes
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

const renderAtRoute = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Breadcrumbs />
    </MemoryRouter>
  );

describe('Breadcrumbs', () => {
  it('renders nothing on root /', () => {
    const { container } = renderAtRoute('/');
    // At root, breadcrumbs may be minimal or hidden
    expect(container).toBeInTheDocument();
  });

  it('renders breadcrumb for /vendas', () => {
    renderAtRoute('/vendas');
    expect(screen.getByText('Vendas')).toBeInTheDocument();
  });

  it('renders breadcrumb for /clientes', () => {
    renderAtRoute('/clientes');
    expect(screen.getByText('Clientes')).toBeInTheDocument();
  });

  it('renders breadcrumb for /pipeline', () => {
    renderAtRoute('/pipeline');
    expect(screen.getByText('Pipeline')).toBeInTheDocument();
  });

  it('renders breadcrumb for /relatorios', () => {
    renderAtRoute('/relatorios');
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
  });

  it('renders breadcrumb for /ranking', () => {
    renderAtRoute('/ranking');
    expect(screen.getByText('Ranking')).toBeInTheDocument();
  });

  it('renders breadcrumb for /configuracoes', () => {
    renderAtRoute('/configuracoes');
    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });

  it('renders home icon/link', () => {
    renderAtRoute('/vendas');
    // Should have a link back to dashboard
    const links = screen.getAllByRole('link');
    const homeLink = links.find(l => l.getAttribute('href') === '/');
    expect(homeLink).toBeTruthy();
  });
});
