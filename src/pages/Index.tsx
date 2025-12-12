import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { RecentDeals } from "@/components/dashboard/RecentDeals";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { SalesForecast } from "@/components/dashboard/SalesForecast";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <DashboardHeader />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <StatCard
              title="Faturamento Total"
              value="R$ 847.250"
              change={12.5}
              icon={DollarSign}
              variant="primary"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <StatCard
              title="Vendas Realizadas"
              value="312"
              change={8.3}
              icon={ShoppingBag}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <StatCard
              title="Novos Clientes"
              value="89"
              change={-2.1}
              icon={Users}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <StatCard
              title="Taxa de Conversão"
              value="12.6%"
              change={15.7}
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
            <GoalProgress current={847250} goal={1000000} />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <FunnelChart />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
            <SalesForecast />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <KPIGrid />
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <RecentDeals />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "550ms" }}>
            <TopProducts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;