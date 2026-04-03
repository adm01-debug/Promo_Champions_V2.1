/**
 * Breadcrumbs Component Tests
 * Verifies: route mapping, home link, nested routes, null on single-segment
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
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing on single-segment routes (e.g., /vendas)', () => {
    const { container } = renderAtRoute('/vendas');
    expect(container.innerHTML).toBe('');
  });

  it('renders breadcrumbs for nested route /vendas/123', () => {
    renderAtRoute('/vendas/123');
    expect(screen.getByText('Vendas')).toBeInTheDocument();
  });

  it('renders breadcrumbs for nested route /clientes/abc', () => {
    renderAtRoute('/clientes/abc');
    expect(screen.getByText('Clientes')).toBeInTheDocument();
  });

  it('renders breadcrumbs for nested route /pipeline/deal', () => {
    renderAtRoute('/pipeline/deal');
    expect(screen.getByText('Pipeline')).toBeInTheDocument();
  });

  it('shows home icon for first breadcrumb', () => {
    renderAtRoute('/vendas/123');
    const nav = screen.getByLabelText('Breadcrumb');
    expect(nav).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/');
  });

  it('last segment is not a link (aria-current="page")', () => {
    renderAtRoute('/vendas/123');
    const current = screen.getByText('123');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('capitalizes unknown segments', () => {
    renderAtRoute('/vendas/custom-page');
    expect(screen.getByText('Custom-page')).toBeInTheDocument();
  });

  it('renders known route labels correctly', () => {
    renderAtRoute('/relatorios/detalhes');
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
  });
});
