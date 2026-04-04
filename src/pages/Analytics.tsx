// Analytics page - MainLayout is applied at route level
import { Helmet } from "react-helmet-async";
import { WinLossAnalysis } from '@/components/analytics/WinLossAnalysis';
import { DealVelocityChart } from '@/components/analytics/DealVelocityChart';
import { ConversionFunnel } from '@/components/analytics/ConversionFunnel';
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
import { AnimatedTabContent } from '@/components/analytics/AnimatedTabContent';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, TrendingUp, BookOpen, BarChart3, Layers, Timer, AlertTriangle, Brain, Users, GitCompare, Flame, Radar, CalendarDays, ShieldAlert, UserCheck, DollarSign } from 'lucide-react';
import { useWinLossAnalysis } from '@/hooks/useWinLossAnalysis';
import { AnalyticsPageLoadingSkeleton } from '@/components/skeletons/PageLoadingSkeleton';
import { SkeletonTransition } from '@/components/skeletons/SkeletonTransition';
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";

const TABS = [
  { value: 'winloss', label: 'Win/Loss', icon: Trophy },
  { value: 'velocity', label: 'Velocidade', icon: Clock },
  { value: 'conversion', label: 'Conversão', icon: TrendingUp },
  { value: 'objections', label: 'Objeções', icon: BookOpen },
  { value: 'abc', label: 'ABC', icon: Layers },
  { value: 'closing', label: 'Fechamento', icon: Timer },
  { value: 'churn', label: 'Churn', icon: AlertTriangle },
  { value: 'coaching', label: 'Coaching IA', icon: Brain },
  { value: 'comparison', label: 'Coaching', icon: Users },
  { value: 'benchmark', label: 'Benchmark', icon: GitCompare },
  { value: 'heatmap', label: 'Heatmap', icon: Flame },
  { value: 'competency', label: 'Competências', icon: Radar },
  { value: 'weekly', label: 'Semanal', icon: CalendarDays },
  { value: 'churn-risk', label: 'Risco Churn', icon: ShieldAlert },
  { value: 'cohort', label: 'Cohort', icon: UserCheck },
  { value: 'ltv', label: 'LTV', icon: DollarSign },
] as const;

const TAB_CONTENT: Record<string, React.FC> = {
  winloss: WinLossAnalysis,
  velocity: DealVelocityChart,
  conversion: ConversionFunnel,
  objections: ObjectionsLibrary,
  abc: ABCAnalysis,
  closing: ClosingTimeChart,
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

  return (
    <Helmet>
      <title>Analytics | Promo Champions</title>
      <meta name="description" content="Análises avançadas de vendas e performance" />
    </Helmet>
    <SkeletonTransition isLoading={isLoading} skeleton={<AnalyticsPageLoadingSkeleton />} duration={400}>
      <PageTransition>
        <div className="space-y-6">
          <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
            <div className="p-2.5 rounded-xl gradient-primary"><BarChart3 className="h-6 w-6 text-primary-foreground" /></div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Analytics de Vendas</h1>
              <p className="text-sm text-muted-foreground">Análises avançadas para otimizar sua performance de vendas</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Tabs defaultValue="winloss" className="space-y-4">
              <TabsList className="bg-card/50 border border-border/50 flex-wrap h-auto gap-1 p-1">
                {TABS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger key={value} value={value} className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Icon className="h-4 w-4" />{label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                {TABS.map(({ value }) => {
                  const Component = TAB_CONTENT[value];
                  return (
                    <AnimatedTabContent key={value} value={value}>
                      <Component />
                    </AnimatedTabContent>
                  );
                })}
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  );
}
