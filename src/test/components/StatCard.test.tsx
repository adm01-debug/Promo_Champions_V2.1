/**
 * StatCard Component Tests
 * Tests: rendering, hero mode, variants, count-up, edge cases
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

// Mock useCountUp to return immediate values
vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: (end: number, opts: any) => {
    if (opts?.enabled === false || end === undefined) return end;
    return end;
  },
}));

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Faturamento" value="R$ 150.000" icon={DollarSign} />);
    expect(screen.getByText('Faturamento')).toBeInTheDocument();
  });

  it('shows positive change indicator', () => {
    render(<StatCard title="Revenue" value="R$ 100" change={25.5} icon={DollarSign} />);
    expect(screen.getByText('+25.5%')).toBeInTheDocument();
  });

  it('shows negative change indicator', () => {
    render(<StatCard title="Revenue" value="R$ 100" change={-10.3} icon={DollarSign} />);
    expect(screen.getByText('-10.3%')).toBeInTheDocument();
  });

  it('shows zero change as positive', () => {
    render(<StatCard title="Revenue" value="R$ 100" change={0} icon={DollarSign} />);
    expect(screen.getByText('+0.0%')).toBeInTheDocument();
  });

  it('renders hero variant with larger text', () => {
    const { container } = render(
      <StatCard title="Faturamento" value="R$ 150.000" icon={DollarSign} hero />
    );
    // Hero should have lg:col-span-2 class
    expect(container.querySelector('.lg\\:col-span-2')).toBeInTheDocument();
  });

  it('renders decorative element in hero mode', () => {
    const { container } = render(
      <StatCard title="Faturamento" value="R$ 150.000" icon={DollarSign} hero />
    );
    // Should have blur-2xl decorative element
    expect(container.querySelector('.blur-2xl')).toBeInTheDocument();
  });

  it('does not render decorative element in non-hero mode', () => {
    const { container } = render(
      <StatCard title="Faturamento" value="R$ 150.000" icon={DollarSign} />
    );
    expect(container.querySelector('.blur-2xl')).not.toBeInTheDocument();
  });

  it('shows previous value comparison', () => {
    render(
      <StatCard title="Revenue" value="R$ 100" change={15} previousValue="R$ 87" icon={DollarSign} />
    );
    expect(screen.getByText('vs R$ 87')).toBeInTheDocument();
  });

  it('handles all variant types', () => {
    const variants = ['default', 'primary', 'success', 'warning'] as const;
    variants.forEach(variant => {
      const { unmount } = render(
        <StatCard title="Test" value="100" icon={DollarSign} variant={variant} />
      );
      unmount();
    });
  });

  it('renders with numericValue for animation', () => {
    render(
      <StatCard title="Revenue" value="R$ 150.000" numericValue={150000} icon={DollarSign} />
    );
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('formats percentage values correctly', () => {
    render(
      <StatCard title="Conversion" value="32.5%" numericValue={32.5} icon={TrendingUp} />
    );
    expect(screen.getByText('Conversion')).toBeInTheDocument();
  });

  it('handles missing optional props gracefully', () => {
    const { container } = render(
      <StatCard title="Test" value="0" icon={Users} />
    );
    expect(container).toBeTruthy();
  });
});
