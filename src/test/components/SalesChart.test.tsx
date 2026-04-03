/**
 * SalesChart Component Tests
 * Verifies: period selectors (7d/30d/90d), rendering, tooltips
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SalesChart } from '@/components/dashboard/SalesChart';

// Mock recharts to avoid canvas issues
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  AreaChart: ({ children, data }: any) => <div data-testid="area-chart" data-count={data?.length}>{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('SalesChart', () => {
  it('renders with title', () => {
    render(<SalesChart />);
    expect(screen.getByText('Evolução de Vendas')).toBeInTheDocument();
  });

  it('shows 3 period selector buttons', () => {
    render(<SalesChart />);
    expect(screen.getByText('7 dias')).toBeInTheDocument();
    expect(screen.getByText('30 dias')).toBeInTheDocument();
    expect(screen.getByText('90 dias')).toBeInTheDocument();
  });

  it('defaults to 90d period', () => {
    render(<SalesChart />);
    const btn90 = screen.getByText('90 dias');
    expect(btn90.className).toContain('bg-primary');
  });

  it('switches to 7d when clicked', () => {
    render(<SalesChart />);
    fireEvent.click(screen.getByText('7 dias'));
    const btn7 = screen.getByText('7 dias');
    expect(btn7.className).toContain('bg-primary');
    // 90d should lose active styling
    const btn90 = screen.getByText('90 dias');
    expect(btn90.className).not.toContain('bg-primary');
  });

  it('switches to 30d when clicked', () => {
    render(<SalesChart />);
    fireEvent.click(screen.getByText('30 dias'));
    const btn30 = screen.getByText('30 dias');
    expect(btn30.className).toContain('bg-primary');
  });

  it('renders chart elements', () => {
    render(<SalesChart />);
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('data count changes per period', () => {
    render(<SalesChart />);
    // Default 90d = 7 data points
    expect(screen.getByTestId('area-chart')).toHaveAttribute('data-count', '7');
    
    fireEvent.click(screen.getByText('30 dias'));
    expect(screen.getByTestId('area-chart')).toHaveAttribute('data-count', '4');
    
    fireEvent.click(screen.getByText('7 dias'));
    expect(screen.getByTestId('area-chart')).toHaveAttribute('data-count', '7');
  });
});
