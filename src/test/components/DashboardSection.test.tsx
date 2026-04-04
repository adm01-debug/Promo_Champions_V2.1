/**
 * DashboardSection Component Tests
 * Verifies: collapsible behavior, teaser, alwaysOpen, icon, badge
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardSection } from '@/components/dashboard/DashboardSection';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    span: ({ children, ...props }: any) => {
      const { animate, transition, ...rest } = props;
      return <span {...rest}>{children}</span>;
    },
    button: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
  },
}));

describe('DashboardSection', () => {
  it('renders children when defaultOpen=true', () => {
    render(
      <DashboardSection title="Section 1" defaultOpen>
        <p>Content visible</p>
      </DashboardSection>
    );
    expect(screen.getByText('Content visible')).toBeInTheDocument();
  });

  it('hides children when defaultOpen=false', () => {
    render(
      <DashboardSection title="Section 2" defaultOpen={false}>
        <p>Hidden content</p>
      </DashboardSection>
    );
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('toggles on button click', () => {
    render(
      <DashboardSection title="Toggle" defaultOpen>
        <p>Toggleable</p>
      </DashboardSection>
    );
    expect(screen.getByText('Toggleable')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /toggle/i }));
    expect(screen.queryByText('Toggleable')).not.toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(
      <DashboardSection title="With Badge" badge="NEW">
        <p>Content</p>
      </DashboardSection>
    );
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('renders teaser when collapsed and teaser provided', () => {
    render(
      <DashboardSection title="Teaser" defaultOpen={false} teaser="Click to see more">
        <p>Hidden</p>
      </DashboardSection>
    );
    expect(screen.getByText(/Click to see more/)).toBeInTheDocument();
    expect(screen.getByText(/Expandir/)).toBeInTheDocument();
  });

  it('teaser click expands section', () => {
    render(
      <DashboardSection title="Expand" defaultOpen={false} teaser="Preview">
        <p>Expanded content</p>
      </DashboardSection>
    );
    fireEvent.click(screen.getByText(/Expandir/));
    expect(screen.getByText('Expanded content')).toBeInTheDocument();
  });

  it('renders directly without wrapper when alwaysOpen=true', () => {
    render(
      <DashboardSection title="Always" alwaysOpen>
        <p>Always visible</p>
      </DashboardSection>
    );
    expect(screen.getByText('Always visible')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has aria-expanded attribute', () => {
    render(
      <DashboardSection title="Aria">
        <p>Content</p>
      </DashboardSection>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('icon renders when provided', () => {
    const Icon = () => <svg data-testid="icon" />;
    render(
      <DashboardSection title="Iconified" icon={<Icon />}>
        <p>Content</p>
      </DashboardSection>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
