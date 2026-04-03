/**
 * StatCard Component Tests
 * Verifies: variants, hero mode, change indicators, count-up, formatting
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react';

// Mock the useCountUp hook to return the value directly
vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: (value: number) => value,
}));

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Revenue" value="R$ 50.000" icon={DollarSign} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('R$ 50.000')).toBeInTheDocument();
  });

  it('shows positive change with TrendingUp', () => {
    render(<StatCard title="Sales" value="45" change={18.4} icon={TrendingUp} />);
    expect(screen.getByText('+18.4%')).toBeInTheDocument();
  });

  it('shows negative change with TrendingDown', () => {
    render(<StatCard title="Clients" value="10" change={-5.2} icon={Users} />);
    expect(screen.getByText('-5.2%')).toBeInTheDocument();
  });

  it('shows previousValue when provided', () => {
    render(<StatCard title="Rate" value="32%" change={4} previousValue="28%" icon={Target} />);
    expect(screen.getByText('vs 28%')).toBeInTheDocument();
  });

  describe('variants', () => {
    const variants = ['default', 'primary', 'success', 'warning'] as const;
    variants.forEach((variant) => {
      it(`renders "${variant}" variant`, () => {
        render(<StatCard title="Test" value="100" icon={DollarSign} variant={variant} />);
        expect(screen.getByText('Test')).toBeInTheDocument();
      });
    });
  });

  it('hero mode applies larger styling', () => {
    const { container } = render(<StatCard title="Hero" value="R$ 100.000" icon={DollarSign} hero />);
    // Hero adds decorative blurred circles
    const decorative = container.querySelectorAll('.pointer-events-none');
    expect(decorative.length).toBeGreaterThan(0);
  });

  it('uses numericValue for animated display when prefix is R$', () => {
    render(<StatCard title="Rev" value="R$ 50000" numericValue={50000} icon={DollarSign} />);
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
  });

  it('uses numericValue with % suffix', () => {
    render(<StatCard title="Rate" value="32.5%" numericValue={32.5} icon={Target} />);
    expect(screen.getByText('32.5%')).toBeInTheDocument();
  });
});
