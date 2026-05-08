import { Helmet } from "react-helmet-async";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RankingPositionBanner } from "@/components/ranking/RankingPositionBanner";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { RecentDeals } from "@/components/dashboard/RecentDeals";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { BenchmarkPanel } from "@/components/analytics/BenchmarkPanel";
import { TeamActivityFeed } from "@/components/collaboration/TeamActivityFeed";
import { ClientHealthPanel } from "@/components/analytics/ClientHealthPanel";
import { SalesForecast } from "@/components/dashboard/SalesForecast";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { cn } from "@/lib/utils";
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
import { EngagementLeaderboardWidget } from "@/components/engagement/EngagementLeaderboardWidget";
import { PulseSurveyWidget } from "@/components/engagement/PulseSurveyWidget";
import { DailyQuizWidget } from "@/components/gamification/DailyQuizWidget";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import ProfilePerformanceCard from "@/components/profile/ProfilePerformanceCard";
import { FuturisticSpeedometerDashboard } from "@/components/dashboard/FuturisticSpeedometerDashboard";
import { FuturisticRanking } from "@/components/dashboard/FuturisticRanking";
import { MyGoalAlertCard } from "@/components/dashboard/MyGoalAlertCard";
import { TrendsChartsPanel } from "@/components/dashboard/TrendsChartsPanel";
import { PeriodTrendChart } from "@/components/dashboard/PeriodTrendChart";
import { DashboardNLQWidget } from "@/components/nlq/DashboardNLQWidget";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { useSalesRealtime } from "@/hooks/useSalesRealtime";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardPriorities } from "@/hooks/useDashboardPriorities";
import { DashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { motion } from "framer-motion";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  BarChart3,
  Trophy,
  Zap,
  Heart,
  Rocket,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, Gauge } from "lucide-react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useDashboardRedirect } from "@/hooks/useDashboardRedirect";

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

  // Validate section
  const isValidSection = section && (section in SECTION_MAP || section === "visao-geral");
  
  // If we are on root "/", we don't redirect here, AppRoutes handles it or useDashboardRedirect might.
  // But if we have a section and it's invalid, we show 404.
  if (section && !isValidSection) {
    return <Navigate to="/404" replace />;
  }

  const activeTab = section ? (SECTION_MAP[section] ?? "overview") : "overview";

  const { theme } = useDashboardTheme();
  const { data: kpis, isLoading } = useDashboardKPIs();
  const { data: goalsData } = useGoalsDashboard();
  const { salesperson } = useAuth();
  const priorities = useDashboardPriorities();
  
  useSalesRealtime(salesperson?.id, salesperson?.role as "sdr" | "closer" | "hybrid" | undefined);

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const hasRevenue = (kpis?.current.totalRevenue ?? 0) > 0;
  const hasSales = (kpis?.current.totalSales ?? 0) > 0;
  const hasClients = (kpis?.current.newClients ?? 0) > 0;
  const hasConversion = (kpis?.current.conversionRate ?? 0) > 0;
  const allEmpty = !hasRevenue && !hasSales && !hasClients && !hasConversion;

  return (
    <>
    <Helmet>
      <title>Dashboard | Promo Champions - CRM Gamificado de Vendas</title>
      <meta name="description" content="Acompanhe suas vendas, metas e rankings em tempo real. CRM gamificado para equipes de vendas de alta performance." />
      <meta name="keywords" content="CRM, vendas, gamificação, dashboard, metas, ranking" />
      <link rel="canonical" href="https://championgifts.lovable.app/" />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Promo Champions",
        "description": "CRM gamificado para equipes de vendas de alta performance",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" }
      })}</script>
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<DashboardLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className={cn("min-h-screen relative overflow-hidden", theme === "cyber" ? "bg-[#020617]" : "bg-background")} suppressHydrationWarning>
          {/* Global Cyber Background Layers - Only in Cyber Mode */}
          {theme === "cyber" && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Ambient Nebula */}
              <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
              <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" style={{ animationDelay: "2s" }} />
              <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-success/5 blur-[100px] rounded-full" style={{ animationDelay: "4s" }} />
              
              {/* Digital Grid */}
              <div 
                className="absolute inset-0 opacity-[0.03]" 
                style={{ 
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                  backgroundSize: "60px 60px"
                }} 
              />
              
              {/* Scanline pattern */}
              <div className="absolute inset-0 opacity-[0.02] bg-[length:100%_4px]" style={{ backgroundImage: "linear-gradient(transparent 50%, rgba(255,255,255,0.5) 50%)" }} />
            </div>
          )}

          <div className="relative z-10 max-w-[1600px] mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-6 space-y-8">
            {/* ── SECTION: Greeting ── */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <DashboardHeader />
            </motion.div>

            {/* ── SECTION: Header Content ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              <div className="lg:col-span-3 space-y-6">
                <RankingPositionBanner />
                <OnboardingChecklist />
                
                {/* ── SECTION: Event Banners (Moved here for better flow) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SeasonalEventBanner />
                  <FlashSalesBanner />
                </div>
              </div>
              <div className="lg:col-span-1">
                <ProfilePerformanceCard />
              </div>
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

            {/* ===== HERO KPIs ===== */}
            {allEmpty ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="relative overflow-hidden rounded-xl border border-dashed border-primary/30 bg-gradient-to-r from-primary/5 via-card/80 to-accent/5 p-6"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Rocket className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold">Comece sua jornada de vendas!</h3>
                    <p className="text-sm text-muted-foreground/80 mt-0.5">
                      Registre sua primeira venda, adicione clientes e acompanhe seu faturamento em tempo real.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/clientes">
                        <Users className="h-3.5 w-3.5 mr-1.5" />
                        Adicionar Cliente
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to="/vendas">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Registrar Venda
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6"
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
            )}

            {/* ===== SUB-MODULES (driven by URL/sidebar) ===== */}
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => {
                const section = Object.keys(SECTION_MAP).find(key => SECTION_MAP[key] === value) || "visao-geral";
                navigate(`/dashboard/${section}`);
              }}
              className="w-full"
            >

              {/* === VISÃO GERAL === */}
              <TabsContent value="overview" className="space-y-6 mt-6 focus-visible:outline-none">
                <MyGoalAlertCard />
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="lg:col-span-2 min-h-[280px] sm:min-h-[320px] rounded-xl bg-gradient-to-br from-card via-card to-primary/[0.02] border border-border/40 shadow-sm overflow-hidden">
                    <SalesChart />
                  </div>
                  <div className="min-h-[200px] rounded-xl bg-gradient-to-br from-card via-card to-accent/[0.03] border border-border/40 shadow-sm overflow-hidden" data-tour="goals">
                    <GoalProgress
                      current={goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0}
                      goal={goalsData?.totalGoal || 0}
                    />
                  </div>
                </motion.div>
              </TabsContent>

              {/* === PERFORMANCE HUD === */}
              <TabsContent value="performance" className="space-y-8 mt-6 focus-visible:outline-none">
                <FuturisticSpeedometerDashboard />
                <PeriodTrendChart />
                <TrendsChartsPanel />
              </TabsContent>

              {/* === ANÁLISES === */}
              <TabsContent value="analytics" className="space-y-6 mt-6 focus-visible:outline-none">
                <DashboardNLQWidget />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <KPIGrid />
                  </div>
                  <AlertsPanel />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FunnelChart />
                  <SalesForecast />
                  <BenchmarkPanel />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <TeamActivityFeed />
                  </div>
                  <div className="space-y-6">
                    <ClientHealthPanel />
                    <EngagementLeaderboardWidget limit={5} />
                  </div>
                </div>
              </TabsContent>

              {/* === COMPETIÇÃO === */}
              <TabsContent value="competition" className="space-y-8 mt-6 focus-visible:outline-none">
                <FuturisticRanking />
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  data-tour="gamification"
                >
                  <RecentDeals />
                  <TopProducts />
                  <MiniLeaderboard />
                  <div className="lg:col-span-2">
                    <StreakWidget salespersonId={salesperson?.id} />
                  </div>
                  <DailyChallengesCard salespersonId={salesperson?.id} compact showTestButton />
                  <div className="lg:col-span-3">
                    <WeeklyChallengesCard salespersonId={salesperson?.id} compact />
                  </div>
                </div>
              </TabsContent>

              {/* === PERFORMANCE INTELIGENTE === */}
              <TabsContent value="intelligence" className="space-y-6 mt-6 focus-visible:outline-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MicroGoalsWidget />
                  <VelocityScoreWidget />
                  <ActivityQualityWidget />
                  <SelfBenchmarkWidget />
                </div>
              </TabsContent>

              {/* === ENGAJAMENTO === */}
              <TabsContent value="engagement" className="space-y-6 mt-6 focus-visible:outline-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MoodTrackerWidget />
                  <PulseSurveyWidget />
                  <DailyQuizWidget />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
};

export default Index;

