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
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { MiniLeaderboard } from "@/components/dashboard/MiniLeaderboard";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";

import { CompetitiveStatusBar } from "@/components/gamification/CompetitiveStatusBar";
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
import { PageTransition } from "@/components/transitions/PageTransition";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

const Index = () => {
  const { data: kpis, isLoading } = useDashboardKPIs();
  const { data: goalsData } = useGoalsDashboard();
  const { salesperson } = useAuth();
  
  useSalesRealtime(salesperson?.id, salesperson?.role as "sdr" | "closer" | "hybrid" | undefined);

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const hasRevenue = (kpis?.current.totalRevenue ?? 0) > 0;
  const hasSales = (kpis?.current.totalSales ?? 0) > 0;
  const hasClients = (kpis?.current.newClients ?? 0) > 0;
  const hasConversion = (kpis?.current.conversionRate ?? 0) > 0;
  

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<DashboardLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1400px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-5 sm:space-y-6">
            
            {/* ── Header + Status Bar ── */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
              <DashboardHeader />
              <CompetitiveStatusBar />
            </motion.div>

            {/* ── Onboarding (only for new users) ── */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <OnboardingChecklist />
            </motion.div>

            {/* ── KPI Cards Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4" data-tour="stats">
              {/* Hero Faturamento — spans 2 cols */}
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="col-span-2">
                {hasRevenue ? (
                  <StatCard
                    title="Faturamento"
                    value={formatCurrency(kpis?.current.totalRevenue ?? 0)}
                    numericValue={kpis?.current.totalRevenue ?? 0}
                    change={kpis?.changes.revenue ?? 0}
                    previousValue={kpis ? formatCurrency(kpis.previous.totalRevenue) : undefined}
                    icon={DollarSign}
                    variant="primary"
                    hero
                  />
                ) : (
                  <DashboardEmptyState type="revenue" />
                )}
              </motion.div>
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                {hasSales ? (
                  <StatCard
                    title="Vendas"
                    value={String(kpis?.current.totalSales ?? 0)}
                    numericValue={kpis?.current.totalSales ?? 0}
                    change={kpis?.changes.sales ?? 0}
                    previousValue={kpis ? String(kpis.previous.totalSales) : undefined}
                    icon={ShoppingBag}
                    variant="info"
                  />
                ) : (
                  <DashboardEmptyState type="sales" />
                )}
              </motion.div>
              <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
                {hasClients ? (
                  <StatCard
                    title="Clientes"
                    value={String(kpis?.current.newClients ?? 0)}
                    numericValue={kpis?.current.newClients ?? 0}
                    change={kpis?.changes.clients ?? 0}
                    previousValue={kpis ? String(kpis.previous.newClients) : undefined}
                    icon={Users}
                    variant="warning"
                  />
                ) : (
                  <DashboardEmptyState type="clients" />
                )}
              </motion.div>
              <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
                {hasConversion ? (
                  <StatCard
                    title="Conversão"
                    value={`${(kpis?.current.conversionRate ?? 0).toFixed(1)}%`}
                    numericValue={kpis?.current.conversionRate ?? 0}
                    change={kpis?.changes.conversion ?? 0}
                    previousValue={kpis ? `${kpis.previous.conversionRate.toFixed(1)}%` : undefined}
                    icon={TrendingUp}
                    variant="purple"
                  />
                ) : (
                  <DashboardEmptyState type="conversion" />
                )}
              </motion.div>
            </div>

            {/* ── Main Content: Chart + Goal ── */}
            <motion.div 
              custom={6} variants={fadeUp} initial="hidden" animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              <div className="lg:col-span-2 min-h-[280px]">
                <SalesChart />
              </div>
              <div className="min-h-[280px]" data-tour="goals">
                <GoalProgress 
                  current={goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0} 
                  goal={goalsData?.totalGoal || 0} 
                />
              </div>
            </motion.div>

            {/* ── Secondary Grid: Funnel + Forecast + KPIs + Alerts ── */}
            <motion.div 
              custom={7} variants={fadeUp} initial="hidden" animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
            >
              <FunnelChart />
              <SalesForecast />
              <KPIGrid />
              <AlertsPanel />
            </motion.div>

            {/* ── Bottom Grid: Activity + Gamification ── */}
            <motion.div 
              custom={8} variants={fadeUp} initial="hidden" animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
              data-tour="gamification"
            >
              {/* Left column: Deals + Products stacked */}
              <div className="space-y-4 sm:space-y-5">
                <RecentDeals />
                <TopProducts />
              </div>
              {/* Center: Leaderboard + Streak */}
              <div className="space-y-4 sm:space-y-5">
                <MiniLeaderboard />
                <StreakWidget salespersonId={salesperson?.id} />
              </div>
              {/* Right: Challenges */}
              <div className="space-y-4 sm:space-y-5 sm:col-span-2 lg:col-span-1">
                <DailyChallengesCard salespersonId={salesperson?.id} compact showTestButton />
                <WeeklyChallengesCard salespersonId={salesperson?.id} compact />
              </div>
            </motion.div>

          </div>
        </div>
        
      </PageTransition>
    </SkeletonTransition>
  );
};

export default Index;
