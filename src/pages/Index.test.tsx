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
  useGoalsDashboard: () => ({ 
    data: { 
      totalSales: 100, 
      totalGoal: 1000,
      daysRemaining: 15,
      salespeople: [
        { 
          id: '123', 
          progress: 50, 
          projection: 1000, 
          goalAmount: 1000, 
          currentSales: 500,
          requiredDailyAverage: 33.3 
        },
        { 
          id: '456', 
          progress: 60, 
          projection: 1200, 
          goalAmount: 1000, 
          currentSales: 600,
          requiredDailyAverage: 26.6 
        }
      ]
    },
    isLoading: false
  })
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

  it('deve renderizar o dashboard básico corretamente', async () => {
    render(<Index />, { wrapper: createWrapper() });
    
    // Verificar se elementos básicos de navegação/header estão presentes
    await waitFor(() => {
      expect(screen.getByText(/PERÍODO:/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve mostrar o banner de posição no ranking', async () => {
    render(<Index />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText(/Você está na posição/i)).toBeInTheDocument();
    });
  });
});






