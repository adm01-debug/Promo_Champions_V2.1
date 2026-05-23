import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Index from './Index';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardKPIsPeriod } from '@/hooks/dashboard/useDashboardKPIsPeriod';
import { useGoalsDashboard } from '@/hooks/dashboard/useGoalsDashboard';
import { useSalesChartData } from '@/hooks/sales/useSalesChartData';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { DashboardThemeProvider } from '@/contexts/DashboardThemeContext';

// Mock the hooks
vi.mock('@/contexts/AuthContext');
vi.mock('@/hooks/dashboard/useDashboardKPIsPeriod');
vi.mock('@/hooks/dashboard/useGoalsDashboard');
vi.mock('@/hooks/sales/useSalesChartData');
vi.mock('@/hooks/dashboard/useDashboardPriorities', () => ({
  useDashboardPriorities: () => ({ roleHint: 'Foco em Vendas' })
}));
vi.mock('@/hooks/sales/useSalesRealtime', () => ({
  useSalesRealtime: vi.fn()
}));
vi.mock('@/hooks/dashboard/useDashboardRedirect', () => ({
  useDashboardRedirect: vi.fn()
}));

// Mock lazy components to avoid async loading issues in tests
vi.mock('@/components/dashboard/modules/OverviewModule', () => ({
  OverviewModule: () => <div data-testid="overview-module">Overview Module</div>
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <DashboardThemeProvider>
          <BrowserRouter>
            {ui}
          </BrowserRouter>
        </DashboardThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

describe('Dashboard Integration Tests', () => {
  const mockSalesperson = {
    id: '123',
    name: 'John Doe',
    role: 'closer'
  };

  const mockKPIs = {
    current: {
      totalRevenue: 10000,
      totalSales: 50,
      newClients: 10,
      conversionRate: 5.5,
      firstSaleRevenue: 2000,
      recurringRevenue: 8000
    },
    previous: {
      totalRevenue: 8000,
      totalSales: 40,
      newClients: 8,
      conversionRate: 5.0,
      firstSaleRevenue: 1500,
      recurringRevenue: 6500
    },
    changes: {
      revenue: 25,
      sales: 25,
      clients: 25,
      conversion: 10,
      firstSaleRevenue: 33.3,
      recurringRevenue: 23.1
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ salesperson: mockSalesperson });
    (useDashboardKPIsPeriod as any).mockReturnValue({ data: mockKPIs, isLoading: false, isError: false });
    (useGoalsDashboard as any).mockReturnValue({ data: { totalSales: 50, totalGoal: 100 }, isLoading: false });
    (useSalesChartData as any).mockReturnValue({ data: [], isLoading: false });
  });

  it('recalculates KPIs when period is changed', async () => {
    renderWithProviders(<Index />);
    
    // Check initial state (should be current_month by default in the hook or state)
    expect(useDashboardKPIsPeriod).toHaveBeenCalledWith('current_month', '123', 'closer');

    // Click on the period dropdown
    const periodButton = screen.getByText(/PERÍODO:/);
    fireEvent.click(periodButton);

    // Select "Semana"
    const weekOption = screen.getByText('Semana');
    fireEvent.click(weekOption);

    // Verify hook was called with new period
    await waitFor(() => {
      expect(useDashboardKPIsPeriod).toHaveBeenCalledWith('week', '123', 'closer');
    });
  });

  it('shows skeleton states while loading', () => {
    (useDashboardKPIsPeriod as any).mockReturnValue({ data: null, isLoading: true, isError: false });
    
    renderWithProviders(<Index />);
    
    // Check if aria-busy is present (SkeletonTransition uses this)
    const skeleton = screen.getByLabelText('Carregando dashboard');
    expect(skeleton).toBeInTheDocument();
  });

  it('handles data fetch failure and recovery', async () => {
    // Mock failure
    const mockRefetch = vi.fn();
    (useDashboardKPIsPeriod as any).mockReturnValue({ 
      data: null, 
      isLoading: false, 
      isError: true, 
      error: new Error('Fetch failed'),
      refetch: mockRefetch
    });

    renderWithProviders(<Index />);

    // Since Index.tsx doesn't have an explicit error boundary inside it for KPIs but uses SkeletonTransition,
    // let's see how it behaves. Usually it shows the empty state if data is null.
    // In Index.tsx: !hasRevenue && !hasSales && !hasClients shows DashboardEmptyState
    
    expect(screen.getByText(/Nenhum faturamento registrado/i)).toBeInTheDocument();

    // Try to "recover" by changing period
    const periodButton = screen.getByText(/PERÍODO:/);
    fireEvent.click(periodButton);
    const weekOption = screen.getByText('Semana');
    fireEvent.click(weekOption);

    await waitFor(() => {
      expect(useDashboardKPIsPeriod).toHaveBeenCalledWith('week', '123', 'closer');
    });
  });

  it('renders correct modules for Closer role', () => {
    (useAuth as any).mockReturnValue({ salesperson: { ...mockSalesperson, role: 'closer' } });
    
    renderWithProviders(<Index />);
    
    // For closer, it should show Faturamento Total
    expect(screen.getByText('Faturamento Total')).toBeInTheDocument();
    expect(screen.getByText('Venda Ativação')).toBeInTheDocument();
    expect(screen.getByText('Venda Carteira')).toBeInTheDocument();
    expect(screen.queryByText('Reuniões Agendadas')).not.toBeInTheDocument();
  });

  it('renders correct modules for SDR role', () => {
    (useAuth as any).mockReturnValue({ salesperson: { ...mockSalesperson, role: 'sdr' } });
    (useDashboardKPIsPeriod as any).mockReturnValue({ 
      data: {
        ...mockKPIs,
        current: { ...mockKPIs.current, meetingsScheduled: 15, qualifiedLeads: 20 }
      }, 
      isLoading: false 
    });
    
    renderWithProviders(<Index />);
    
    // For SDR, it should show Taxa de Agendamento and Reuniões
    expect(screen.getByText('Taxa de Agendamento')).toBeInTheDocument();
    expect(screen.getByText('Reuniões Agendadas')).toBeInTheDocument();
    expect(screen.getByText('Leads Qualificados')).toBeInTheDocument();
    expect(screen.queryByText('Faturamento Total')).not.toBeInTheDocument();
  });
});
