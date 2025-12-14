import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { RecentDeals } from "@/components/dashboard/RecentDeals";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { SalesForecast } from "@/components/dashboard/SalesForecast";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { CompetitiveStatusBar } from "@/components/gamification/CompetitiveStatusBar";
import { CompetitiveLeaderboard } from "@/components/gamification/CompetitiveLeaderboard";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { useSalesRealtime } from "@/hooks/useSalesRealtime";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
} from "lucide-react";

const Index = () => {
  const { data: kpis, isLoading } = useDashboardKPIs();
  const { data: goalsData } = useGoalsDashboard();
  const { salesperson } = useAuth();
  
  // Subscribe to real-time sales notifications
  useSalesRealtime(salesperson?.id);

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<DashboardLoadingSkeleton />}
      duration={400}
    >
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <DashboardHeader />
        </div>

        {/* Competitive Status Bar */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          <CompetitiveStatusBar />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <StatCard
              title="Faturamento Total"
              value={formatCurrency(kpis?.current.totalRevenue ?? 0)}
              change={kpis?.changes.revenue ?? 0}
              previousValue={kpis ? formatCurrency(kpis.previous.totalRevenue) : undefined}
              icon={DollarSign}
              variant="primary"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <StatCard
              title="Vendas Realizadas"
              value={String(kpis?.current.totalSales ?? 0)}
              change={kpis?.changes.sales ?? 0}
              previousValue={kpis ? String(kpis.previous.totalSales) : undefined}
              icon={ShoppingBag}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <StatCard
              title="Novos Clientes"
              value={String(kpis?.current.newClients ?? 0)}
              change={kpis?.changes.clients ?? 0}
              previousValue={kpis ? String(kpis.previous.newClients) : undefined}
              icon={Users}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <StatCard
              title="Taxa de Conversão"
              value={`${(kpis?.current.conversionRate ?? 0).toFixed(1)}%`}
              change={kpis?.changes.conversion ?? 0}
              previousValue={kpis ? `${kpis.previous.conversionRate.toFixed(1)}%` : undefined}
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <SalesChart />
          </div>

          {/* Right Column - Goal */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
            <GoalProgress 
              current={goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0} 
              goal={goalsData?.totalGoal || 0} 
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <FunnelChart />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
            <SalesForecast />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <KPIGrid />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "550ms" }}>
            <AlertsPanel />
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
            <RecentDeals />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "650ms" }}>
            <TopProducts />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <CompetitiveLeaderboard />
          </div>
        </div>
      </div>
    </div>
    </SkeletonTransition>
  );
};

export default Index;