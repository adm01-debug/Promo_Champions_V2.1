import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Index from './Index';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardKPIsPeriod } from '@/hooks/dashboard/useDashboardKPIsPeriod';
import { DashboardThemeProvider } from '@/contexts/DashboardThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import React from 'react';

// Mock hooks
vi.mock('@/contexts/AuthContext');
vi.mock('@/hooks/dashboard/useDashboardKPIsPeriod');
vi.mock('@/hooks/dashboard/useGoalsDashboard', () => ({
  useGoalsDashboard: () => ({ data: { totalSales: 100, totalGoal: 1000 } })
}));
vi.mock('@/hooks/sales/useSalesChartData', () => ({
  useSalesChartData: () => ({ data: [] })
}));
vi.mock('@/hooks/dashboard/useDashboardPriorities', () => ({
  useDashboardPriorities: () => ({ roleHint: 'Foque em agendamentos' })
}));
vi.mock('@/hooks/sales/useSalesRealtime', () => ({
  useSalesRealtime: vi.fn()
}));
vi.mock('@/hooks/dashboard/useDashboardRedirect', () => ({
  useDashboardRedirect: vi.fn()
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <DashboardThemeProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </DashboardThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

describe('Dashboard Integration - Index Page', () => {
  const mockKpis = {
    current: {
      totalRevenue: 50000,
      totalSales: 100,
      newClients: 20,
      conversionRate: 15.5,
      avgTicket: 500
    },
    previous: {
      totalRevenue: 40000,
      totalSales: 80,
      newClients: 15,
      conversionRate: 12.0,
      avgTicket: 500
    },
    changes: {
      revenue: 25,
      sales: 25,
      clients: 33.3,
      conversion: 29.2,
      avgTicket: 0
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      salesperson: { id: '123', role: 'closer' }
    });
    (useDashboardKPIsPeriod as any).mockReturnValue({
      data: mockKpis,
      isLoading: false
    });
  });

  it('deve renderizar os KPIs principais corretamente para um Closer', async () => {
    render(<Index />, { wrapper: createWrapper() });
    
    // Esperar os skeletons saírem
    await waitFor(() => {
      expect(screen.queryByText(/Faturamento Total/i)).toBeInTheDocument();
    });
    
    // Usar uma função de busca flexível para lidar com texto quebrado por elementos ou animações
    expect(screen.getByText((content) => content.includes('50.000'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('25%'))).toBeInTheDocument();
  });

  it('deve mudar o período quando selecionado no dropdown', async () => {
    render(<Index />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.queryByText(/PERÍODO:/i)).toBeInTheDocument();
    });

    const periodButton = screen.getByText(/PERÍODO:/i);
    fireEvent.click(periodButton);
    
    const lastMonthOption = screen.getByText(/Último Mês/i);
    fireEvent.click(lastMonthOption);
    
    await waitFor(() => {
      expect(useDashboardKPIsPeriod).toHaveBeenCalledWith('last_month', '123', 'closer');
    });
  });

  it('deve renderizar KPIs de SDR corretamente quando o usuário for SDR', async () => {
    (useAuth as any).mockReturnValue({
      salesperson: { id: '456', role: 'sdr' }
    });

    render(<Index />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.queryByText(/Taxa de Agendamento/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText((content) => content.includes('15,5%'))).toBeInTheDocument();
  });
});



