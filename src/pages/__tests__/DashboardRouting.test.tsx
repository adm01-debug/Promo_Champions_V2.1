import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "../Index";
import NotFound from "../NotFound";
import { DashboardThemeProvider } from "@/contexts/DashboardThemeContext";
import { HelmetProvider } from "react-helmet-async";
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

// Mock do Auth context
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    salesperson: { id: "1", name: "Test User", role: "admin" }
  }))
}));

// Mock do SalesRealtime hook
vi.mock("@/hooks/useSalesRealtime", () => ({
  useSalesRealtime: vi.fn()
}));

// Mock do Competitive ranking hook
vi.mock("@/hooks/useCompetitiveRanking", () => ({
  useCompetitiveRanking: vi.fn(() => ({ data: [], isLoading: false }))
}));

// Mock do MyRankingNotification hook
vi.mock("@/hooks/useRankingNotifications", () => ({
  useMyRankingNotification: vi.fn(() => ({ data: null })),
  useMarkRankingNotificationRead: vi.fn(() => ({ mutate: vi.fn() }))
}));

// Mock do Onboarding hook
vi.mock("@/hooks/useOnboardingChecklist", () => ({
  useOnboardingChecklist: vi.fn(() => ({ data: [], isLoading: false }))
}));

// Mock dos componentes que dão erro
vi.mock("@/components/ranking/RankingPositionBanner", () => ({ RankingPositionBanner: () => null }));
vi.mock("@/components/onboarding/OnboardingChecklist", () => ({ OnboardingChecklist: () => null }));
vi.mock("@/components/dashboard/MyGoalAlertCard", () => ({ MyGoalAlertCard: () => null }));
vi.mock("@/components/dashboard/DashboardHeader", () => ({ DashboardHeader: () => <div data-testid="dashboard-header" /> }));
vi.mock("@/components/gamification/CompetitiveStatusBar", () => ({ CompetitiveStatusBar: () => null }));
vi.mock("@/components/gamification/SeasonalEventBanner", () => ({ SeasonalEventBanner: () => null }));
vi.mock("@/components/gamification/FlashSalesBanner", () => ({ FlashSalesBanner: () => null }));
vi.mock("@/components/dashboard/FuturisticSpeedometerDashboard", () => ({ FuturisticSpeedometerDashboard: () => <div data-testid="speedometer" /> }));
vi.mock("@/components/dashboard/PeriodTrendChart", () => ({ PeriodTrendChart: () => null }));
vi.mock("@/components/dashboard/TrendsChartsPanel", () => ({ TrendsChartsPanel: () => null }));
vi.mock("@/components/analytics/DashboardNLQWidget", () => ({ DashboardNLQWidget: () => null }));
vi.mock("@/components/dashboard/KPIGrid", () => ({ KPIGrid: () => null }));
vi.mock("@/components/dashboard/FunnelChart", () => ({ FunnelChart: () => null }));
vi.mock("@/components/dashboard/SalesForecast", () => ({ SalesForecast: () => null }));
vi.mock("@/components/analytics/BenchmarkPanel", () => ({ BenchmarkPanel: () => null }));
vi.mock("@/components/collaboration/TeamActivityFeed", () => ({ TeamActivityFeed: () => null }));
vi.mock("@/components/analytics/ClientHealthPanel", () => ({ ClientHealthPanel: () => null }));
vi.mock("@/components/engagement/EngagementLeaderboardWidget", () => ({ EngagementLeaderboardWidget: () => null }));
vi.mock("@/components/dashboard/MiniLeaderboard", () => ({ MiniLeaderboard: () => null }));
vi.mock("@/components/gamification/FuturisticRanking", () => ({ FuturisticRanking: () => null }));
vi.mock("@/components/dashboard/RecentDeals", () => ({ RecentDeals: () => null }));
vi.mock("@/components/dashboard/TopProducts", () => ({ TopProducts: () => null }));
vi.mock("@/components/gamification/StreakWidget", () => ({ StreakWidget: () => null }));
vi.mock("@/components/gamification/DailyChallengesCard", () => ({ DailyChallengesCard: () => null }));
vi.mock("@/components/gamification/WeeklyChallengesCard", () => ({ WeeklyChallengesCard: () => null }));
vi.mock("@/components/dashboard/widgets/MicroGoalsWidget", () => ({ MicroGoalsWidget: () => null }));
vi.mock("@/components/dashboard/widgets/VelocityScoreWidget", () => ({ VelocityScoreWidget: () => null }));
vi.mock("@/components/dashboard/widgets/ActivityQualityWidget", () => ({ ActivityQualityWidget: () => null }));
vi.mock("@/components/dashboard/widgets/SelfBenchmarkWidget", () => ({ SelfBenchmarkWidget: () => null }));
vi.mock("@/components/engagement/MoodTrackerWidget", () => ({ MoodTrackerWidget: () => null }));
vi.mock("@/components/engagement/PulseSurveyWidget", () => ({ PulseSurveyWidget: () => null }));
vi.mock("@/components/engagement/DailyQuizWidget", () => ({ DailyQuizWidget: () => null }));

// Helper para ver a localização atual
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <DashboardThemeProvider>
        {children}
      </DashboardThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

describe("Dashboard Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("redireciona para visao-geral quando acessado /dashboard pela primeira vez", async () => {
    render(
      <AllProviders>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/dashboard/:section" element={<Index />} />
            <Route path="/404" element={<NotFound />} />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>
      </AllProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location-display")).toHaveTextContent("/dashboard/visao-geral");
    });
  });

  it("exibe 404 para seções desconhecidas em /dashboard/:section", async () => {
    render(
      <AllProviders>
        <MemoryRouter initialEntries={["/dashboard/secao-inexistente"]}>
          <Routes>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/dashboard/:section" element={<Index />} />
            <Route path="/404" element={<NotFound />} />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>
      </AllProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location-display")).toHaveTextContent("/404");
      expect(screen.getByText(/Página não encontrada/i)).toBeInTheDocument();
    });
  });

  it("persiste a última seção visitada no localStorage", async () => {
    // Primeiro acessa performance
    const { unmount } = render(
      <AllProviders>
        <MemoryRouter initialEntries={["/dashboard/performance"]}>
          <Routes>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/dashboard/:section" element={<Index />} />
          </Routes>
        </MemoryRouter>
      </AllProviders>
    );

    // Verifica se salvou no localStorage
    expect(localStorage.getItem("last_dashboard_section")).toBe("performance");
    
    unmount();

    // Agora acessa /dashboard novamente e deve ir para performance
    render(
      <AllProviders>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/dashboard/:section" element={<Index />} />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>
      </AllProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location-display")).toHaveTextContent("/dashboard/performance");
    });
  });

  it("sincroniza abas com a URL (tabsContent renderiza corretamente)", async () => {
    render(
      <AllProviders>
        <MemoryRouter initialEntries={["/dashboard/performance"]}>
          <Routes>
            <Route path="/dashboard/:section" element={<Index />} />
          </Routes>
        </MemoryRouter>
      </AllProviders>
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
