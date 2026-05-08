import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "../Index";
import NotFound from "../NotFound";
import "@testing-library/jest-dom";

// Mock do DashboardKPIs hook
vi.mock("@/hooks/useDashboardKPIs", () => ({
  useDashboardKPIs: vi.fn(() => ({
    data: {
      current: { totalRevenue: 1000, totalSales: 10, newClients: 5, conversionRate: 5 },
      previous: { totalRevenue: 800, totalSales: 8, newClients: 4, conversionRate: 4 },
      changes: { revenue: 25, sales: 25, clients: 25, conversion: 25 }
    },
    isLoading: false
  }))
}));

// Mock do GoalsDashboard hook
vi.mock("@/hooks/useGoalsDashboard", () => ({
  useGoalsDashboard: vi.fn(() => ({
    data: { totalSales: 500, totalGoal: 1000 },
    isLoading: false
  }))
}));

// Mock de Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock de components pesados ou com hooks complexos
vi.mock("@/components/dashboard/SalesChart", () => ({ SalesChart: () => <div data-testid="sales-chart" /> }));
vi.mock("@/components/dashboard/GoalProgress", () => ({ GoalProgress: () => <div data-testid="goal-progress" /> }));
vi.mock("@/components/dashboard/FuturisticSpeedometerDashboard", () => ({ FuturisticSpeedometerDashboard: () => <div data-testid="speedometer" /> }));

// Helper para ver a localização atual
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe("Dashboard Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("redireciona para visao-geral quando acessado /dashboard pela primeira vez", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Index />} />
          <Route path="/dashboard/:section" element={<Index />} />
          <Route path="/404" element={<NotFound />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location-display")).toHaveTextContent("/dashboard/visao-geral");
    });
  });

  it("exibe 404 para seções desconhecidas em /dashboard/:section", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/secao-inexistente"]}>
        <Routes>
          <Route path="/dashboard" element={<Index />} />
          <Route path="/dashboard/:section" element={<Index />} />
          <Route path="/404" element={<NotFound />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location-display")).toHaveTextContent("/404");
      expect(screen.getByText(/Página não encontrada/i)).toBeInTheDocument();
    });
  });

  it("persiste a última seção visitada no localStorage", async () => {
    // Primeiro acessa performance
    const { unmount } = render(
      <MemoryRouter initialEntries={["/dashboard/performance"]}>
        <Routes>
          <Route path="/dashboard" element={<Index />} />
          <Route path="/dashboard/:section" element={<Index />} />
        </Routes>
      </MemoryRouter>
    );

    // Verifica se salvou no localStorage
    expect(localStorage.getItem("last_dashboard_section")).toBe("performance");
    
    unmount();

    // Agora acessa /dashboard novamente e deve ir para performance
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Index />} />
          <Route path="/dashboard/:section" element={<Index />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location-display")).toHaveTextContent("/dashboard/performance");
    });
  });

  it("sincroniza abas com a URL (tabsContent renderiza corretamente)", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/performance"]}>
        <Routes>
          <Route path="/dashboard/:section" element={<Index />} />
        </Routes>
      </MemoryRouter>
    );

    // Em performance devemos ver o speedometer
    expect(screen.getByTestId("speedometer")).toBeInTheDocument();
    
    // Não devemos ver o sales chart da visão geral ( TabsContent oculta o que não é o value)
    // Nota: Dependendo de como o Radix Tabs funciona no test environment, 
    // ele pode apenas renderizar o conteúdo ativo ou ocultar via CSS.
    // Como estamos usando o shadcn Tabs (Radix), ele renderiza apenas o conteúdo ativo por padrão no DOM.
    expect(screen.queryByTestId("sales-chart")).not.toBeInTheDocument();
  });
});
