import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { RecentDeals } from "@/components/dashboard/RecentDeals";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
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
        <DashboardHeader />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="Faturamento Total"
            value="R$ 847.250"
            change={12.5}
            icon={DollarSign}
            variant="primary"
          />
          <StatCard
            title="Vendas Realizadas"
            value="312"
            change={8.3}
            icon={ShoppingBag}
          />
          <StatCard
            title="Novos Clientes"
            value="89"
            change={-2.1}
            icon={Users}
          />
          <StatCard
            title="Taxa de Conversão"
            value="12.6%"
            change={15.7}
            icon={TrendingUp}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2">
            <SalesChart />
          </div>

          {/* Right Column - Goal */}
          <div>
            <GoalProgress current={847250} goal={1000000} />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart />
          <KPIGrid />
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentDeals />
          <TopProducts />
        </div>
      </div>
    </div>
  );
};

export default Index;