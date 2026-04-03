/**
 * SalesForecast Component Tests
 * Verifies: confidence levels, color coding, tooltip, progress bar
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SalesForecast } from '@/components/dashboard/SalesForecast';

describe('SalesForecast', () => {
  it('renders forecast value', () => {
    render(<SalesForecast />);
    expect(screen.getByText(/85\.000/)).toBeInTheDocument();
  });

  it('shows "próximo mês" label', () => {
    render(<SalesForecast />);
    expect(screen.getByText('próximo mês')).toBeInTheDocument();
  });

  it('shows confidence percentage', () => {
    render(<SalesForecast />);
    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('renders confidence label', () => {
    render(<SalesForecast />);
    expect(screen.getByText('Média')).toBeInTheDocument();
  });

  it('renders progress bar', () => {
    render(<SalesForecast />);
    const bar = document.querySelector('[style*="width: 78%"]');
    expect(bar).toBeInTheDocument();
  });

  it('renders info tooltip trigger', () => {
    render(<SalesForecast />);
    // Info icon for confidence tooltip
    expect(screen.getByText('Confiança')).toBeInTheDocument();
  });

  it('renders title with icon', () => {
    render(<SalesForecast />);
    expect(screen.getByText('Previsão')).toBeInTheDocument();
  });
});
