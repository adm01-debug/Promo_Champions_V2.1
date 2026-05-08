import { Helmet } from "react-helmet-async";
import React, { Suspense, lazy } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RankingPositionBanner } from "@/components/ranking/RankingPositionBanner";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { StatCard } from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { CompetitiveStatusBar } from "@/components/gamification/CompetitiveStatusBar";
import { SeasonalEventBanner } from "@/components/gamification/SeasonalEventBanner";
import { FlashSalesBanner } from "@/components/gamification/FlashSalesBanner";
import ProfilePerformanceCard from "@/components/profile/ProfilePerformanceCard";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { useSalesRealtime } from "@/hooks/useSalesRealtime";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardPriorities } from "@/hooks/useDashboardPriorities";
import { DashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDashboardRedirect } from "@/hooks/useDashboardRedirect";

// Lazy-loaded modules for better performance
const OverviewModule = lazy(() => import("@/components/dashboard/modules/OverviewModule").then(m => ({ default: m.OverviewModule })));
const PerformanceModule = lazy(() => import("@/components/dashboard/modules/PerformanceModule").then(m => ({ default: m.PerformanceModule })));
const AnalyticsModule = lazy(() => import("@/components/dashboard/modules/AnalyticsModule").then(m => ({ default: m.AnalyticsModule })));
const CompetitionModule = lazy(() => import("@/components/dashboard/modules/CompetitionModule").then(m => ({ default: m.CompetitionModule })));
const IntelligenceModule = lazy(() => import("@/components/dashboard/modules/IntelligenceModule").then(m => ({ default: m.IntelligenceModule })));
const EngagementModule = lazy(() => import("@/components/dashboard/modules/EngagementModule").then(m => ({ default: m.EngagementModule })));

const SECTION_MAP: Record<string, string> = {
  performance: "performance",
  analises: "analytics",
  competicao: "competition",
  inteligencia: "intelligence",
  engajamento: "engagement",
};

const Index = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  useDashboardRedirect();

  const { data: kpis, isLoading } = useDashboardKPIs();
  const { data: goalsData } = useGoalsDashboard();
  const { salesperson } = useAuth();
  const priorities = useDashboardPriorities();
  
  useSalesRealtime(salesperson?.id, salesperson?.role as "sdr" | "closer" | "hybrid" | undefined);

  // Validate section
  const isValidSection = section && (section in SECTION_MAP || section === "visao-geral");
  
  if (section && !isValidSection) {
    return <Navigate to="/404" replace />;
  }

  const activeTab = section ? (SECTION_MAP[section] ?? "overview") : "overview";

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const hasRevenue = (kpis?.current.totalRevenue ?? 0) > 0;
  const hasSales = (kpis?.current.totalSales ?? 0) > 0;
  const hasClients = (kpis?.current.newClients ?? 0) > 0;
  const hasConversion = (kpis?.current.conversionRate ?? 0) > 0;
  const allEmpty = !hasRevenue && !hasSales && !hasClients && !hasConversion;

  return (
    <PageTransition className="pb-10 overflow-x-hidden">
      <Helmet>
        <title>Dashboard | Promo Champions</title>
      </Helmet>

      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
        <RankingPositionBanner />
        <CompetitiveStatusBar />
        <OnboardingChecklist />
        <DashboardHeader />
        
        {/* Priority Hint based on role */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="p-3 rounded-lg border bg-primary/10 border-primary/20 text-primary flex items-center gap-3"
        >
          <div className="p-1.5 rounded-full bg-current/10">
            <Zap className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium">{priorities.roleHint}</p>
        </motion.div>

        <SkeletonTransition isLoading={isLoading} skeleton={<DashboardLoadingSkeleton />}>
          <div className="space-y-8">
            {/* KPI Overview */}
            {!allEmpty && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <motion.div variants={itemVariants} className="md:col-span-3">
                  {hasRevenue ? (
                    <StatCard
                      title="Receita Total"
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
                
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:col-span-3">
                  <motion.div variants={itemVariants}>
                    {hasSales ? (
                      <StatCard
                        title="Vendas Realizadas"
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
                        title="Novos Clientes"
                        value={String(kpis?.current.newClients ?? 0)}
                        numericValue={kpis?.current.newClients ?? 0}
                        change={kpis?.changes.clients ?? 0}
                        previousValue={kpis ? String(kpis.previous.newClients) : undefined}
                        icon={Users}
                        variant="success"
                      />
                    ) : (
                      <DashboardEmptyState type="clients" />
                    )}
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    {hasConversion ? (
                      <StatCard
                        title="Taxa de Conversão"
                        value={`${(kpis?.current.conversionRate ?? 0).toFixed(1)}%`}
                        numericValue={kpis?.current.conversionRate ?? 0}
                        change={kpis?.changes.conversion ?? 0}
                        previousValue={kpis ? `${kpis.previous.conversionRate.toFixed(1)}%` : undefined}
                        icon={TrendingUp}
                        variant="warning"
                      />
                    ) : (
                      <DashboardEmptyState type="conversion" />
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ===== SUB-MODULES (driven by URL/sidebar) ===== */}
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => {
                const sectionKey = Object.keys(SECTION_MAP).find(key => SECTION_MAP[key] === value) || "visao-geral";
                navigate(`/dashboard/${sectionKey}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.02, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                  <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                    <Suspense fallback={<DashboardLoadingSkeleton />}>
                      <OverviewModule goalsData={goalsData} kpis={kpis} />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="performance" className="mt-0 focus-visible:outline-none">
                    <Suspense fallback={<DashboardLoadingSkeleton />}>
                      <PerformanceModule />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-0 focus-visible:outline-none">
                    <Suspense fallback={<DashboardLoadingSkeleton />}>
                      <AnalyticsModule />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="competition" className="mt-0 focus-visible:outline-none">
                    <Suspense fallback={<DashboardLoadingSkeleton />}>
                      <CompetitionModule salesperson={salesperson} />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="intelligence" className="mt-0 focus-visible:outline-none">
                    <Suspense fallback={<DashboardLoadingSkeleton />}>
                      <IntelligenceModule />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="engagement" className="mt-0 focus-visible:outline-none">
                    <Suspense fallback={<DashboardLoadingSkeleton />}>
                      <EngagementModule />
                    </Suspense>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </SkeletonTransition>
      </div>
    </PageTransition>
  );
};

export default Index;
