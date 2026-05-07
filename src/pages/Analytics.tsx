// Analytics page - MainLayout is applied at route level
import { Helmet } from "react-helmet-async";
import { WinLossAnalysis } from '@/components/analytics/WinLossAnalysis';
import { DealVelocityChart } from '@/components/analytics/DealVelocityChart';
import { ConversionFunnel } from '@/components/analytics/ConversionFunnel';
import { RevenueForecast } from '@/components/analytics/RevenueForecast';
import { ObjectionsLibrary } from '@/components/analytics/ObjectionsLibrary';
import { ABCAnalysis } from '@/components/analytics/ABCAnalysis';
import { ClosingTimeChart } from '@/components/analytics/ClosingTimeChart';
import { ChurnPrediction } from '@/components/analytics/ChurnPrediction';
import { SalespersonCoaching } from '@/components/analytics/SalespersonCoaching';
import { CoachingComparison } from '@/components/analytics/CoachingComparison';
import { PerformanceComparison } from '@/components/analytics/PerformanceComparison';
import { ActivityHeatmap } from '@/components/analytics/ActivityHeatmap';
import { CompetencyRadar } from '@/components/analytics/CompetencyRadar';
import { WeeklyPerformanceComparison } from '@/components/analytics/WeeklyPerformanceComparison';
import { ChurnPredictionPanel } from '@/components/analytics/ChurnPredictionPanel';
import { CohortAnalysis } from '@/components/analytics/CohortAnalysis';
import { LTVBySegment } from '@/components/analytics/LTVBySegment';
import { AIPerformanceInsights } from '@/components/analytics/AIPerformanceInsights';
import { AnimatedTabContent } from '@/components/analytics/AnimatedTabContent';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, TrendingUp, BookOpen, BarChart3, Layers, Timer, AlertTriangle, Brain, Users, GitCompare, Flame, Radar, CalendarDays, ShieldAlert, UserCheck, DollarSign, ChevronDown, LineChart } from 'lucide-react';
import { useWinLossAnalysis } from '@/hooks/useWinLossAnalysis';
import { AnalyticsPageLoadingSkeleton } from '@/components/skeletons/PageLoadingSkeleton';
import { SkeletonTransition } from '@/components/skeletons/SkeletonTransition';
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";
import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";

const TAB_CATEGORIES: Array<{ label: string; tabs: Array<{ value: string; label: string; icon: React.FC<{ className?: string }> }> }> = [
  {
    label: 'Performance',
    tabs: [
      { value: 'winloss', label: 'Win/Loss', icon: Trophy },
      { value: 'velocity', label: 'Velocidade', icon: Clock },
      { value: 'conversion', label: 'Conversão', icon: TrendingUp },
      { value: 'closing', label: 'Fechamento', icon: Timer },
      { value: 'forecast', label: 'Forecast', icon: LineChart },
      { value: 'weekly', label: 'Semanal', icon: CalendarDays },
    ],
  },
  {
    label: 'Análise',
    tabs: [
      { value: 'objections', label: 'Objeções', icon: BookOpen },
      { value: 'abc', label: 'ABC', icon: Layers },
      { value: 'heatmap', label: 'Heatmap', icon: Flame },
      { value: 'benchmark', label: 'Benchmark', icon: GitCompare },
    ],
  },
  {
    label: 'Retenção',
    tabs: [
      { value: 'churn', label: 'Churn', icon: AlertTriangle },
      { value: 'churn-risk', label: 'Risco Churn', icon: ShieldAlert },
      { value: 'cohort', label: 'Cohort', icon: UserCheck },
      { value: 'ltv', label: 'LTV', icon: DollarSign },
    ],
  },
  {
    label: 'Coaching',
    tabs: [
      { value: 'coaching', label: 'Coaching IA', icon: Brain },
      { value: 'comparison', label: 'Comparação', icon: Users },
      { value: 'competency', label: 'Competências', icon: Radar },
    ],
  },
];

const ALL_TABS = TAB_CATEGORIES.flatMap(c => c.tabs);

const TAB_CONTENT: Record<string, React.FC> = {
  winloss: WinLossAnalysis,
  velocity: DealVelocityChart,
  conversion: ConversionFunnel,
  objections: ObjectionsLibrary,
  abc: ABCAnalysis,
  closing: ClosingTimeChart,
  forecast: RevenueForecast,
  churn: ChurnPrediction,
  coaching: SalespersonCoaching,
  comparison: CoachingComparison,
  benchmark: PerformanceComparison,
  heatmap: ActivityHeatmap,
  competency: CompetencyRadar,
  weekly: WeeklyPerformanceComparison,
  'churn-risk': ChurnPredictionPanel,
  cohort: CohortAnalysis,
  ltv: LTVBySegment,
};

export default function Analytics() {
  const { isLoading } = useWinLossAnalysis();
  const [activeTab, setActiveTab] = useState('winloss');

  const activeCategory = useMemo(() => {
    return TAB_CATEGORIES.find(c => c.tabs.some(t => t.value === activeTab))?.label ?? 'Performance';
  }, [activeTab]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  return (
    <>
      <Helmet>
        <title>Analytics | Promo Champions</title>
        <meta name="description" content="Análises avançadas de vendas e performance" />
      </Helmet>
      <SkeletonTransition isLoading={isLoading} skeleton={<AnalyticsPageLoadingSkeleton />} duration={400}>
        <PageTransition>
          <div className="space-y-6 p-6 lg:p-8">
            <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
              <div className="p-2.5 rounded-xl gradient-primary"><BarChart3 className="h-6 w-6 text-primary-foreground" /></div>
              <div>
                <h1 className="text-page-title gradient-text">Analytics de Vendas</h1>
                <p className="text-sm text-muted-foreground/80">Análises avançadas para otimizar sua performance de vendas</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                  <div className="flex flex-wrap gap-4 items-start">
                    {TAB_CATEGORIES.map((category) => {
                      const isCategoryActive = category.label === activeCategory;
                      return (
                        <div key={category.label} className="flex flex-col gap-1.5">
                          <span className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider px-1",
                            isCategoryActive ? "text-primary" : "text-muted-foreground/50"
                          )}>
                            {category.label}
                          </span>
                          <div className="flex items-center gap-1 rounded-lg bg-card/50 border border-border/30 p-0.5">
                            {category.tabs.map(({ value, label, icon: Icon }) => (
                              <button
                                key={value}
                                onClick={() => handleTabChange(value)}
                                className={cn(
                                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                                  activeTab === value
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                <span className="hidden lg:inline">{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <AnimatePresence mode="wait">
                    {ALL_TABS.map(({ value }) => {
                      const Component = TAB_CONTENT[value];
                      if (activeTab !== value) return null;
                      return (
                        <AnimatedTabContent key={value} value={value}>
                          <Component />
                        </AnimatedTabContent>
                      );
                    })}
                  </AnimatePresence>
                </Tabs>
              </div>
              <div className="lg:col-span-1">
                <AIPerformanceInsights />
              </div>
            </div>
          </div>
        </PageTransition>
      </SkeletonTransition>
    </>
  );
}
