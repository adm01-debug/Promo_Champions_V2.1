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
import { WeeklyChallengesCard } from "@/components/gamification/WeeklyChallengesCard";
import { StreakWidget } from "@/components/gamification/StreakWidget";
import { DailyChallengesCard } from "@/components/gamification/DailyChallengesCard";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { useSalesRealtime } from "@/hooks/useSalesRealtime";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { motion } from "framer-motion";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
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
  
  // Subscribe to real-time sales notifications (segmented by role)
  useSalesRealtime(salesperson?.id, salesperson?.role as "sdr" | "closer" | "hybrid" | undefined);

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<DashboardLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className="min-h-screen bg-background" suppressHydrationWarning>
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <DashboardHeader />
            </motion.div>

            {/* Competitive Status Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <CompetitiveStatusBar />
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Faturamento Total"
                  value={formatCurrency(kpis?.current.totalRevenue ?? 0)}
                  change={kpis?.changes.revenue ?? 0}
                  previousValue={kpis ? formatCurrency(kpis.previous.totalRevenue) : undefined}
                  icon={DollarSign}
                  variant="primary"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Vendas Realizadas"
                  value={String(kpis?.current.totalSales ?? 0)}
                  change={kpis?.changes.sales ?? 0}
                  previousValue={kpis ? String(kpis.previous.totalSales) : undefined}
                  icon={ShoppingBag}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Novos Clientes"
                  value={String(kpis?.current.newClients ?? 0)}
                  change={kpis?.changes.clients ?? 0}
                  previousValue={kpis ? String(kpis.previous.newClients) : undefined}
                  icon={Users}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Taxa de Conversão"
                  value={`${(kpis?.current.conversionRate ?? 0).toFixed(1)}%`}
                  change={kpis?.changes.conversion ?? 0}
                  previousValue={kpis ? `${kpis.previous.conversionRate.toFixed(1)}%` : undefined}
                  icon={TrendingUp}
                />
              </motion.div>
            </motion.div>

            {/* Main Grid */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Left Column - Chart */}
              <div className="lg:col-span-2">
                <SalesChart />
              </div>

              {/* Right Column - Goal */}
              <div>
                <GoalProgress 
                  current={goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0} 
                  goal={goalsData?.totalGoal || 0} 
                />
              </div>
            </motion.div>

            {/* Second Row */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <FunnelChart />
              </motion.div>
              <motion.div variants={itemVariants}>
                <SalesForecast />
              </motion.div>
              <motion.div variants={itemVariants}>
                <KPIGrid />
              </motion.div>
              <motion.div variants={itemVariants}>
                <AlertsPanel />
              </motion.div>
            </motion.div>

            {/* Third Row - Responsive Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
                <RecentDeals />
              </motion.div>
              <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
                <TopProducts />
              </motion.div>
              <motion.div variants={itemVariants}>
                <CompetitiveLeaderboard />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StreakWidget salespersonId={salesperson?.id} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <DailyChallengesCard salespersonId={salesperson?.id} compact showTestButton />
              </motion.div>
              <motion.div variants={itemVariants}>
                <WeeklyChallengesCard salespersonId={salesperson?.id} compact />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  );
};

export default Index;
