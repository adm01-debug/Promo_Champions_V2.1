/**
 * MiniSparkline Component Tests
 * Verifies: SVG rendering, path generation, edge cases, accessibility
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MiniSparkline } from '@/components/dashboard/MiniSparkline';

describe('MiniSparkline', () => {
  // === Rendering ===
  it('renders an SVG element with correct dimensions', () => {
    const { container } = render(<MiniSparkline data={[1, 2, 3, 4, 5]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('width')).toBe('56');
    expect(svg?.getAttribute('height')).toBe('20');
  });

  it('renders with custom dimensions', () => {
    const { container } = render(<MiniSparkline data={[1, 2, 3]} width={120} height={40} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('120');
    expect(svg?.getAttribute('height')).toBe('40');
  });

  it('renders two path elements (line + area)', () => {
    const { container } = render(<MiniSparkline data={[10, 20, 30]} />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(2);
  });

  // === Edge cases ===
  it('returns null for empty data', () => {
    const { container } = render(<MiniSparkline data={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null for single data point', () => {
    const { container } = render(<MiniSparkline data={[42]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders correctly with exactly 2 data points', () => {
    const { container } = render(<MiniSparkline data={[10, 20]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('handles all equal values (range = 0)', () => {
    const { container } = render(<MiniSparkline data={[5, 5, 5, 5]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles negative values', () => {
    const { container } = render(<MiniSparkline data={[-10, -5, 0, 5]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('handles very large values', () => {
    const { container } = render(<MiniSparkline data={[1000000, 2000000, 1500000]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('handles decimal values', () => {
    const { container } = render(<MiniSparkline data={[0.1, 0.5, 0.3, 0.8]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // === Gradient direction ===
  it('uses "up" gradient for uptrend (last >= first)', () => {
    const { container } = render(<MiniSparkline data={[1, 3, 5]} />);
    const gradient = container.querySelector('linearGradient');
    expect(gradient?.id).toContain('up');
  });

  it('uses "down" gradient for downtrend (last < first)', () => {
    const { container } = render(<MiniSparkline data={[5, 3, 1]} />);
    const gradient = container.querySelector('linearGradient');
    expect(gradient?.id).toContain('down');
  });

  it('uses "up" gradient for flat trend (equal start/end)', () => {
    const { container } = render(<MiniSparkline data={[5, 3, 5]} />);
    const gradient = container.querySelector('linearGradient');
    expect(gradient?.id).toContain('up');
  });

  // === Accessibility ===
  it('has aria-hidden="true" on SVG', () => {
    const { container } = render(<MiniSparkline data={[1, 2, 3]} />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  // === Path attributes ===
  it('line path has no fill', () => {
    const { container } = render(<MiniSparkline data={[1, 2, 3]} />);
    const paths = container.querySelectorAll('path');
    const linePath = paths[1]; // second path is the line
    expect(linePath?.getAttribute('fill')).toBe('none');
  });

  it('line path has stroke="currentColor"', () => {
    const { container } = render(<MiniSparkline data={[1, 2, 3]} />);
    const paths = container.querySelectorAll('path');
    const linePath = paths[1];
    expect(linePath?.getAttribute('stroke')).toBe('currentColor');
  });

  it('line uses round linecap and linejoin', () => {
    const { container } = render(<MiniSparkline data={[1, 2, 3]} />);
    const paths = container.querySelectorAll('path');
    const linePath = paths[1];
    expect(linePath?.getAttribute('stroke-linecap')).toBe('round');
    expect(linePath?.getAttribute('stroke-linejoin')).toBe('round');
  });

  it('applies custom strokeWidth', () => {
    const { container } = render(<MiniSparkline data={[1, 2, 3]} strokeWidth={3} />);
    const paths = container.querySelectorAll('path');
    expect(paths[1]?.getAttribute('stroke-width')).toBe('3');
  });

  // === CSS ===
  it('has shrink-0 class to prevent flexbox shrinking', () => {
    const { container } = render(<MiniSparkline data={[1, 2, 3]} />);
    expect(container.querySelector('svg')?.classList.contains('shrink-0')).toBe(true);
  });

  it('applies custom className', () => {
    const { container } = render(<MiniSparkline data={[1, 2, 3]} className="text-primary" />);
    expect(container.querySelector('svg')?.classList.contains('text-primary')).toBe(true);
  });

  // === Large datasets ===
  it('handles 30+ data points without error', () => {
    const data = Array.from({ length: 30 }, (_, i) => Math.sin(i) * 100);
    const { container } = render(<MiniSparkline data={data} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
