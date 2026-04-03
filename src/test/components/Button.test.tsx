/**
 * Button Component Tests
 * Verifies: loading state, variants, sizes, accessibility, glow variants
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  // === Loading state ===
  describe('loading state', () => {
    it('renders spinner when loading=true', () => {
      render(<Button loading>Submit</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveAttribute('aria-busy', 'true');
      expect(btn).toBeDisabled();
    });

    it('hides children text when loading without loadingText', () => {
      render(<Button loading>Submit</Button>);
      const span = screen.getByText('Submit');
      expect(span.className).toContain('opacity-0');
    });

    it('shows loadingText when provided', () => {
      render(<Button loading loadingText="Salvando...">Submit</Button>);
      expect(screen.getByText('Salvando...')).toBeInTheDocument();
    });

    it('does not have aria-busy when not loading', () => {
      render(<Button>Submit</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
    });

    it('is not disabled when not loading', () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('prevents click when loading', async () => {
      const onClick = vi.fn();
      render(<Button loading onClick={onClick}>Go</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // === Variants ===
  describe('variants', () => {
    const variants = [
      'default', 'destructive', 'outline', 'secondary', 'ghost', 'link',
      'glow', 'glow-secondary', 'glow-success', 'glow-accent',
      'glow-pulse', 'glow-pulse-success', 'glow-pulse-accent',
    ] as const;

    variants.forEach((variant) => {
      it(`renders "${variant}" variant without crashing`, () => {
        render(<Button variant={variant}>Test</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });

  // === Sizes ===
  describe('sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'] as const;

    sizes.forEach((size) => {
      it(`renders "${size}" size without crashing`, () => {
        render(<Button size={size}>X</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });

  // === asChild ===
  it('renders as child element when asChild=true', () => {
    render(<Button asChild><a href="/test">Link</a></Button>);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  // === Disabled ===
  it('respects disabled prop independently of loading', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
