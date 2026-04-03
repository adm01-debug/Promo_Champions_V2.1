/**
 * ScrollToTop Component Tests
 * Verifies: visibility logic, scroll behavior, accessibility, animation props
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

// Mock framer-motion to render children directly
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    button: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
  },
}));

describe('ScrollToTop', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  it('is hidden when scrollY < 400', () => {
    render(<ScrollToTop />);
    expect(screen.queryByLabelText('Voltar ao topo')).not.toBeInTheDocument();
  });

  it('becomes visible when scrollY > 400', () => {
    render(<ScrollToTop />);
    Object.defineProperty(window, 'scrollY', { value: 500 });
    fireEvent.scroll(window);
    expect(screen.getByLabelText('Voltar ao topo')).toBeInTheDocument();
  });

  it('calls scrollTo on click', () => {
    render(<ScrollToTop />);
    Object.defineProperty(window, 'scrollY', { value: 500 });
    fireEvent.scroll(window);
    fireEvent.click(screen.getByLabelText('Voltar ao topo'));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('has correct aria-label for accessibility', () => {
    render(<ScrollToTop />);
    Object.defineProperty(window, 'scrollY', { value: 500 });
    fireEvent.scroll(window);
    const btn = screen.getByLabelText('Voltar ao topo');
    expect(btn).toHaveAttribute('aria-label', 'Voltar ao topo');
  });

  it('hides again when scrolling back up', () => {
    render(<ScrollToTop />);
    Object.defineProperty(window, 'scrollY', { value: 500 });
    fireEvent.scroll(window);
    expect(screen.getByLabelText('Voltar ao topo')).toBeInTheDocument();
    Object.defineProperty(window, 'scrollY', { value: 100 });
    fireEvent.scroll(window);
    expect(screen.queryByLabelText('Voltar ao topo')).not.toBeInTheDocument();
  });
});
