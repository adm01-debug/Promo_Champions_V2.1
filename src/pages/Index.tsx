import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
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
import { CompetitiveStatusBar } from "@/components/gamification/CompetitiveStatusBar";
import { WeeklyChallengesCard } from "@/components/gamification/WeeklyChallengesCard";
import { StreakWidget } from "@/components/gamification/StreakWidget";
import { DailyChallengesCard } from "@/components/gamification/DailyChallengesCard";
import { SeasonalEventBanner } from "@/components/gamification/SeasonalEventBanner";
import { FlashSalesBanner } from "@/components/gamification/FlashSalesBanner";
import { MicroGoalsWidget } from "@/components/dashboard/widgets/MicroGoalsWidget";
import { VelocityScoreWidget } from "@/components/dashboard/widgets/VelocityScoreWidget";
import { ActivityQualityWidget } from "@/components/dashboard/widgets/ActivityQualityWidget";
import { SelfBenchmarkWidget } from "@/components/dashboard/widgets/SelfBenchmarkWidget";
import { MoodTrackerWidget } from "@/components/engagement/MoodTrackerWidget";
import { PulseSurveyWidget } from "@/components/engagement/PulseSurveyWidget";
import { DailyQuizWidget } from "@/components/gamification/DailyQuizWidget";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
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
  BarChart3,
  Trophy,
  Zap,
  Heart,
} from "lucide-react";

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
        <div className="min-h-screen bg-background" suppressHydrationWarning>
          <div className="max-w-[1600px] mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-6 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <DashboardHeader />
            </motion.div>

            {/* Onboarding Checklist */}
            <OnboardingChecklist />

            {/* Seasonal Event + Flash Sales Banners */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <SeasonalEventBanner />
              <FlashSalesBanner />
            </div>

            {/* Competitive Status Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="hidden sm:block"
            >
              <CompetitiveStatusBar />
            </motion.div>

            {/* ===== HERO KPIs — Always visible ===== */}
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              data-tour="stats"
            >
              <motion.div variants={itemVariants} className="col-span-2">
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
              <motion.div variants={itemVariants}>
                {hasSales ? (
                  <StatCard
                    title="Vendas"
                    value={String(kpis?.current.totalSales ?? 0)}
                    numericValue={kpis?.current.totalSales ?? 0}
                    change={kpis?.changes.sales ?? 0}
                    previousValue={kpis ? String(kpis.previous.totalSales) : undefined}
                    icon={ShoppingBag}
                  />
                ) : (
                  <DashboardEmptyState type="sales" />
                )}
              </motion.div>
              <motion.div variants={itemVariants}>
                {hasClients ? (
                  <StatCard
                    title="Clientes"
                    value={String(kpis?.current.newClients ?? 0)}
                    numericValue={kpis?.current.newClients ?? 0}
                    change={kpis?.changes.clients ?? 0}
                    previousValue={kpis ? String(kpis.previous.newClients) : undefined}
                    icon={Users}
                  />
                ) : (
                  <DashboardEmptyState type="clients" />
                )}
              </motion.div>
              <motion.div variants={itemVariants}>
                {hasConversion ? (
                  <StatCard
                    title="Conversão"
                    value={`${(kpis?.current.conversionRate ?? 0).toFixed(1)}%`}
                    numericValue={kpis?.current.conversionRate ?? 0}
                    change={kpis?.changes.conversion ?? 0}
                    previousValue={kpis ? `${kpis.previous.conversionRate.toFixed(1)}%` : undefined}
                    icon={TrendingUp}
                  />
                ) : (
                  <DashboardEmptyState type="conversion" />
                )}
              </motion.div>
            </motion.div>

            {/* ===== CHARTS & GOALS — Always visible ===== */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="lg:col-span-2 min-h-[250px] sm:min-h-[300px]">
                <SalesChart />
              </div>
              <div className="min-h-[200px]" data-tour="goals">
                <GoalProgress 
                  current={goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0} 
                  goal={goalsData?.totalGoal || 0} 
                />
              </div>
            </motion.div>

            {/* ===== ANALYTICS — Collapsible ===== */}
            <DashboardSection
              title="Análises"
              icon={<BarChart3 className="h-4 w-4" />}
              defaultOpen={true}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                <FunnelChart />
                <SalesForecast />
                <div className="col-span-2 lg:col-span-1">
                  <KPIGrid />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <AlertsPanel />
                </div>
              </div>
            </DashboardSection>

            {/* ===== GAMIFICATION — Collapsible ===== */}
            <DashboardSection
              title="Competição & Conquistas"
              icon={<Trophy className="h-4 w-4" />}
              defaultOpen={true}
              badge="Ativo"
            >
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-6"
                data-tour="gamification"
              >
                <div className="sm:col-span-1">
                  <RecentDeals />
                </div>
                <div className="sm:col-span-1">
                  <TopProducts />
                </div>
                <MiniLeaderboard />
                <StreakWidget salespersonId={salesperson?.id} />
                <DailyChallengesCard salespersonId={salesperson?.id} compact showTestButton />
                <WeeklyChallengesCard salespersonId={salesperson?.id} compact />
              </div>
            </DashboardSection>

            {/* ===== PERFORMANCE INTELLIGENCE — Collapsible, default closed ===== */}
            <DashboardSection
              title="Performance Inteligente"
              icon={<Zap className="h-4 w-4" />}
              defaultOpen={false}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                <MicroGoalsWidget />
                <VelocityScoreWidget />
                <ActivityQualityWidget />
                <SelfBenchmarkWidget />
              </div>
            </DashboardSection>

            {/* ===== ENGAGEMENT — Collapsible, default closed ===== */}
            <DashboardSection
              title="Engajamento & Aprendizado"
              icon={<Heart className="h-4 w-4" />}
              defaultOpen={false}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
                <MoodTrackerWidget />
                <PulseSurveyWidget />
                <DailyQuizWidget />
              </div>
            </DashboardSection>
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  );
};

export default Index;
