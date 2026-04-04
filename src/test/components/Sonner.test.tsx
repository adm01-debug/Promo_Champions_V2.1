/**
 * Sonner Toaster Component Tests
 * Verifies: glassmorphism styling, semantic colors, position
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Toaster } from '@/components/ui/sonner';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark' }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  Toaster: ({ toastOptions, position, richColors, closeButton, ..._props }: any) => {
    return (
      <div 
        data-testid="sonner" 
        data-position={position} 
        data-rich-colors={String(richColors)}
        data-close-button={String(closeButton)}
        data-toast-class={toastOptions?.classNames?.toast || ''}
        data-success-class={toastOptions?.classNames?.success || ''}
        data-error-class={toastOptions?.classNames?.error || ''}
        data-warning-class={toastOptions?.classNames?.warning || ''}
        data-info-class={toastOptions?.classNames?.info || ''}
      />
    );
  },
  toast: vi.fn(),
}));

describe('Toaster', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('sonner')).toBeInTheDocument();
  });

  it('is positioned at bottom-right', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('sonner')).toHaveAttribute('data-position', 'bottom-right');
  });

  it('has richColors enabled', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('sonner')).toHaveAttribute('data-rich-colors', 'true');
  });

  it('has closeButton enabled', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('sonner')).toHaveAttribute('data-close-button', 'true');
  });

  it('toast has backdrop-blur-xl (glassmorphism)', () => {
    const { getByTestId } = render(<Toaster />);
    const toastClass = getByTestId('sonner').getAttribute('data-toast-class');
    expect(toastClass).toContain('backdrop-blur-xl');
  });

  it('toast has rounded-xl', () => {
    const { getByTestId } = render(<Toaster />);
    const toastClass = getByTestId('sonner').getAttribute('data-toast-class');
    expect(toastClass).toContain('rounded-xl');
  });

  it('success toast has success colors', () => {
    const { getByTestId } = render(<Toaster />);
    const cls = getByTestId('sonner').getAttribute('data-success-class');
    expect(cls).toContain('status-success');
  });

  it('error toast has destructive colors', () => {
    const { getByTestId } = render(<Toaster />);
    const cls = getByTestId('sonner').getAttribute('data-error-class');
    expect(cls).toContain('destructive');
  });

  it('warning toast has warning colors', () => {
    const { getByTestId } = render(<Toaster />);
    const cls = getByTestId('sonner').getAttribute('data-warning-class');
    expect(cls).toContain('status-warning');
  });

  it('info toast has info colors', () => {
    const { getByTestId } = render(<Toaster />);
    const cls = getByTestId('sonner').getAttribute('data-info-class');
    expect(cls).toContain('status-info');
  });
});
