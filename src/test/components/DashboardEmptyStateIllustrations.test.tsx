/**
 * DashboardEmptyState V2 Illustrations & Enhanced Tests
 * Verifies: SVG illustrations, gradient backgrounds, animations, CTA variants
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, layoutId, ...rest } = props;
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

describe('DashboardEmptyState Illustrations', () => {
  // === Each type renders unique SVG illustration ===
  it('revenue type renders chart bars SVG', () => {
    const { container } = wrap(<DashboardEmptyState type="revenue" />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
    // Revenue SVG has bar chart rects
    const rects = container.querySelectorAll('svg rect');
    expect(rects.length).toBeGreaterThanOrEqual(5);
  });

  it('sales type renders deal/checkmark SVG', () => {
    const { container } = wrap(<DashboardEmptyState type="sales" />);
    const circles = container.querySelectorAll('svg circle');
    expect(circles.length).toBeGreaterThanOrEqual(1);
  });

  it('clients type renders people SVG', () => {
    const { container } = wrap(<DashboardEmptyState type="clients" />);
    const circles = container.querySelectorAll('svg circle');
    expect(circles.length).toBeGreaterThanOrEqual(3);
  });

  it('conversion type renders funnel SVG', () => {
    const { container } = wrap(<DashboardEmptyState type="conversion" />);
    const paths = container.querySelectorAll('svg path');
    expect(paths.length).toBeGreaterThanOrEqual(3);
  });

  // === Gradient backgrounds ===
  it('revenue has primary gradient', () => {
    const { container } = wrap(<DashboardEmptyState type="revenue" />);
    const gradient = container.querySelector('[class*="from-primary"]');
    expect(gradient).toBeInTheDocument();
  });

  it('sales has accent gradient', () => {
    const { container } = wrap(<DashboardEmptyState type="sales" />);
    const gradient = container.querySelector('[class*="from-accent"]');
    expect(gradient).toBeInTheDocument();
  });

  it('clients has info gradient', () => {
    const { container } = wrap(<DashboardEmptyState type="clients" />);
    const gradient = container.querySelector('[class*="from-info"]');
    expect(gradient).toBeInTheDocument();
  });

  it('conversion has warning gradient', () => {
    const { container } = wrap(<DashboardEmptyState type="conversion" />);
    const gradient = container.querySelector('[class*="from-warning"]');
    expect(gradient).toBeInTheDocument();
  });

  // === CTA button variants ===
  it('revenue CTA uses glow-pulse variant', () => {
    wrap(<DashboardEmptyState type="revenue" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('glow-pulse');
  });

  it('non-revenue CTA uses glow variant', () => {
    wrap(<DashboardEmptyState type="sales" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('glow');
  });

  // === Card styling ===
  it('card has dashed border', () => {
    const { container } = wrap(<DashboardEmptyState type="revenue" />);
    const card = container.querySelector('[class*="border-dashed"]');
    expect(card).toBeInTheDocument();
  });

  it('card has hover transition', () => {
    const { container } = wrap(<DashboardEmptyState type="revenue" />);
    const card = container.querySelector('[class*="hover:border-primary"]');
    expect(card).toBeInTheDocument();
  });

  // === Content ===
  it('revenue title text', () => {
    wrap(<DashboardEmptyState type="revenue" />);
    expect(screen.getByText('Nenhum faturamento registrado')).toBeInTheDocument();
  });

  it('revenue description text', () => {
    wrap(<DashboardEmptyState type="revenue" />);
    expect(screen.getByText(/primeira venda/)).toBeInTheDocument();
  });

  it('sales description mentions pipeline', () => {
    wrap(<DashboardEmptyState type="sales" />);
    expect(screen.getByText(/deals ao seu pipeline/)).toBeInTheDocument();
  });

  it('clients CTA text', () => {
    wrap(<DashboardEmptyState type="clients" />);
    expect(screen.getByText('Adicionar Cliente')).toBeInTheDocument();
  });

  it('conversion CTA text', () => {
    wrap(<DashboardEmptyState type="conversion" />);
    expect(screen.getByText('Ver Pipeline')).toBeInTheDocument();
  });

  // === Links ===
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
});
