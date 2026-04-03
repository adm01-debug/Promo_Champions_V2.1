/**
 * DashboardEmptyState V2 (Enhanced) Tests
 * Verifies: gradient backgrounds, animated icons, glow-pulse CTA, all types
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
}));

const wrap = (ui: React.ReactElement) =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {ui}
    </MemoryRouter>
  );

describe('DashboardEmptyState V2', () => {
  const types = ['revenue', 'sales', 'clients', 'conversion'] as const;

  types.forEach((type) => {
    it(`renders ${type} type without crashing`, () => {
      const { unmount } = wrap(<DashboardEmptyState type={type} />);
      unmount();
    });
  });

  it('revenue type has glow-pulse variant on CTA', () => {
    wrap(<DashboardEmptyState type="revenue" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('glow-pulse');
  });

  it('sales type has glow variant on CTA', () => {
    wrap(<DashboardEmptyState type="sales" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('glow');
  });

  it('has gradient background overlay', () => {
    const { container } = wrap(<DashboardEmptyState type="revenue" />);
    const gradient = container.querySelector('[class*="bg-gradient-to-br"]');
    expect(gradient).toBeInTheDocument();
  });

  it('renders dashed border card', () => {
    const { container } = wrap(<DashboardEmptyState type="clients" />);
    const card = container.querySelector('[class*="border-dashed"]');
    expect(card).toBeInTheDocument();
  });

  it('revenue CTA links to /vendas', () => {
    wrap(<DashboardEmptyState type="revenue" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/vendas');
  });

  it('sales CTA links to /pipeline', () => {
    wrap(<DashboardEmptyState type="sales" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/pipeline');
  });

  it('clients CTA links to /clientes', () => {
    wrap(<DashboardEmptyState type="clients" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/clientes');
  });

  it('conversion CTA links to /pipeline', () => {
    wrap(<DashboardEmptyState type="conversion" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/pipeline');
  });

  it('renders title for each type', () => {
    wrap(<DashboardEmptyState type="revenue" />);
    expect(screen.getByText('Nenhum faturamento registrado')).toBeInTheDocument();
  });

  it('renders description text', () => {
    wrap(<DashboardEmptyState type="sales" />);
    expect(screen.getByText('Comece adicionando deals ao seu pipeline.')).toBeInTheDocument();
  });

  it('renders CTA button text', () => {
    wrap(<DashboardEmptyState type="clients" />);
    expect(screen.getByText('Adicionar Cliente')).toBeInTheDocument();
  });
});
