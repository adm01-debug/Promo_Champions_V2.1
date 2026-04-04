/**
 * StatCard + Sparkline Integration Tests
 * Verifies: sparkline rendering in hero/non-hero modes, conditional display
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign } from 'lucide-react';

vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: (end: number) => end,
}));

describe('StatCard with Sparkline', () => {
  const sparkData = [10, 15, 12, 18, 22, 20, 25];

  it('renders sparkline SVG when sparklineData provided (non-hero)', () => {
    const { container } = render(
      <StatCard title="Sales" value="100" icon={DollarSign} sparklineData={sparkData} />
    );
    const svgs = container.querySelectorAll('svg');
    // Should have icon SVG + sparkline SVG
    const sparklineSvg = Array.from(svgs).find(s => s.getAttribute('aria-hidden') === 'true');
    expect(sparklineSvg).toBeInTheDocument();
  });

  it('renders hero sparkline at bottom (full width)', () => {
    const { container } = render(
      <StatCard title="Revenue" value="R$ 100" icon={DollarSign} hero sparklineData={sparkData} />
    );
    const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
    // Hero sparkline should have width=240
    const heroSparkline = Array.from(svgs).find(s => s.getAttribute('width') === '240');
    expect(heroSparkline).toBeInTheDocument();
  });

  it('does not render sparkline when sparklineData is undefined', () => {
    const { container } = render(
      <StatCard title="Sales" value="100" icon={DollarSign} />
    );
    const sparklineSvgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(sparklineSvgs.length).toBe(0);
  });

  it('does not render sparkline when data has < 2 points', () => {
    const { container } = render(
      <StatCard title="Sales" value="100" icon={DollarSign} sparklineData={[42]} />
    );
    const sparklineSvgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(sparklineSvgs.length).toBe(0);
  });

  it('non-hero sparkline has width=56', () => {
    const { container } = render(
      <StatCard title="Sales" value="100" icon={DollarSign} sparklineData={sparkData} />
    );
    const sparkline = container.querySelector('svg[aria-hidden="true"]');
    expect(sparkline?.getAttribute('width')).toBe('56');
  });

  it('hero sparkline has strokeWidth=2', () => {
    const { container } = render(
      <StatCard title="Revenue" value="R$ 100" icon={DollarSign} hero sparklineData={sparkData} />
    );
    const heroSparkline = container.querySelector('svg[width="240"]');
    const linePath = heroSparkline?.querySelectorAll('path')[1];
    expect(linePath?.getAttribute('stroke-width')).toBe('2');
  });

  it('renders primary variant sparkline color class', () => {
    const { container } = render(
      <StatCard title="Rev" value="100" icon={DollarSign} variant="primary" sparklineData={sparkData} />
    );
    const sparkline = container.querySelector('svg[aria-hidden="true"]');
    expect(sparkline?.classList.contains('text-primary')).toBe(true);
  });

  it('renders success variant sparkline color class', () => {
    const { container } = render(
      <StatCard title="Rev" value="100" icon={DollarSign} variant="success" sparklineData={sparkData} />
    );
    const sparkline = container.querySelector('svg[aria-hidden="true"]');
    expect(sparkline?.classList.contains('text-success')).toBe(true);
  });

  it('renders warning variant sparkline color class', () => {
    const { container } = render(
      <StatCard title="Rev" value="100" icon={DollarSign} variant="warning" sparklineData={sparkData} />
    );
    const sparkline = container.querySelector('svg[aria-hidden="true"]');
    expect(sparkline?.classList.contains('text-warning')).toBe(true);
  });
});
