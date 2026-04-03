/**
 * Card Component Tests
 * Verifies: all variants, hover prop, sub-components
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card', () => {
  const variants = [
    'default', 'elevated', 'floating', 'glass', 'depth', 'interactive',
    'ghost', 'modern', 'glow', 'gradient', 'outlined',
    'success', 'warning', 'destructive', 'primary',
  ] as const;

  variants.forEach((variant) => {
    it(`renders "${variant}" variant`, () => {
      render(<Card variant={variant} data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });
  });

  it('disables hover effects when hover=false', () => {
    render(<Card hover={false} data-testid="card">No hover</Card>);
    const el = screen.getByTestId('card');
    expect(el.className).toContain('hover:transform-none');
  });

  it('renders all sub-components', () => {
    render(
      <Card>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
        <CardDescription>Desc</CardDescription>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('CardTitle uses h3 tag with font-display', () => {
    render(<CardTitle data-testid="title">Hello</CardTitle>);
    const el = screen.getByTestId('title');
    expect(el.tagName).toBe('H3');
    expect(el.className).toContain('font-display');
  });
});
