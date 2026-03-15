/**
 * DashboardEmptyState Component Tests
 * Tests: all types, CTAs, icons, routing
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('DashboardEmptyState', () => {
  it('renders revenue empty state', () => {
    renderWithRouter(<DashboardEmptyState type="revenue" />);
    expect(screen.getByText('Nenhum faturamento registrado')).toBeInTheDocument();
    expect(screen.getByText('Registrar Venda')).toBeInTheDocument();
  });

  it('renders sales empty state', () => {
    renderWithRouter(<DashboardEmptyState type="sales" />);
    expect(screen.getByText('Sem vendas ainda')).toBeInTheDocument();
    expect(screen.getByText('Ir ao Pipeline')).toBeInTheDocument();
  });

  it('renders clients empty state', () => {
    renderWithRouter(<DashboardEmptyState type="clients" />);
    expect(screen.getByText(/Nenhum (novo )?cliente/i)).toBeInTheDocument();
  });

  it('renders conversion empty state', () => {
    renderWithRouter(<DashboardEmptyState type="conversion" />);
    expect(screen.getByText(/conversão|taxa/i)).toBeInTheDocument();
  });

  it('CTA links to correct routes', () => {
    renderWithRouter(<DashboardEmptyState type="revenue" />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/vendas');
  });

  it('sales CTA links to pipeline', () => {
    renderWithRouter(<DashboardEmptyState type="sales" />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/pipeline');
  });

  it('each type renders without crashing', () => {
    const types = ['revenue', 'sales', 'clients', 'conversion'] as const;
    types.forEach(type => {
      const { unmount } = renderWithRouter(<DashboardEmptyState type={type} />);
      unmount();
    });
  });
});
