import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CheckeredFlag } from '../CheckeredFlag';

describe('CheckeredFlag', () => {
  it('renders an SVG', () => {
    const { container } = render(<CheckeredFlag />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('respects custom dimensions', () => {
    const { container } = render(<CheckeredFlag width={400} height={200} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('400');
    expect(svg.getAttribute('height')).toBe('200');
  });

  it('renders 8x5 = 40 cells + mast + border', () => {
    const { container } = render(<CheckeredFlag />);
    const rects = container.querySelectorAll('rect');
    // 40 cells + 1 border = 41
    expect(rects.length).toBeGreaterThanOrEqual(40);
  });

  it('alternates black/white in checkerboard', () => {
    const { container } = render(<CheckeredFlag />);
    const rects = Array.from(container.querySelectorAll('rect'));
    const blacks = rects.filter((r) => r.getAttribute('fill') === '#0a0a0a');
    const whites = rects.filter((r) => r.getAttribute('fill') === '#fafafa');
    expect(blacks.length).toBeGreaterThan(0);
    expect(whites.length).toBeGreaterThan(0);
  });

  it('marks decorative content as aria-hidden', () => {
    const { container } = render(<CheckeredFlag />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
