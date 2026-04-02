// Analytics page - MainLayout is applied at route level
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, TrendingUp, BookOpen, BarChart3, Layers, Timer, AlertTriangle, Brain, Users, GitCompare, Flame, Radar, CalendarDays, ShieldAlert, UserCheck, DollarSign } from 'lucide-react';
import { useWinLossAnalysis } from '@/hooks/useWinLossAnalysis';
import { AnalyticsPageLoadingSkeleton } from '@/components/skeletons/PageLoadingSkeleton';
import { SkeletonTransition } from '@/components/skeletons/SkeletonTransition';
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";

export default function Analytics() {
  const { isLoading } = useWinLossAnalysis();

  return (
    <>
      <SkeletonTransition
        isLoading={isLoading}
        skeleton={<AnalyticsPageLoadingSkeleton />}
        duration={400}
      >
        <PageTransition>
          <div className="space-y-6">
            {/* Header */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="p-2.5 rounded-xl gradient-primary">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Analytics de Vendas</h1>
                <p className="text-sm text-muted-foreground">
                  Análises avançadas para otimizar sua performance de vendas
                </p>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Tabs defaultValue="winloss" className="space-y-4">
                <TabsList className="bg-card/50 border border-border/50 flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="winloss" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Trophy className="h-4 w-4" />
                    Win/Loss
                  </TabsTrigger>
                  <TabsTrigger value="velocity" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Clock className="h-4 w-4" />
                    Velocidade
                  </TabsTrigger>
                  <TabsTrigger value="conversion" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Conversão
                  </TabsTrigger>
                  <TabsTrigger value="objections" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <BookOpen className="h-4 w-4" />
                    Objeções
                  </TabsTrigger>
                  <TabsTrigger value="abc" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Layers className="h-4 w-4" />
                    ABC
                  </TabsTrigger>
                  <TabsTrigger value="closing" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Timer className="h-4 w-4" />
                    Fechamento
                  </TabsTrigger>
                  <TabsTrigger value="churn" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    Churn
                  </TabsTrigger>
                  <TabsTrigger value="coaching" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Brain className="h-4 w-4" />
                    Coaching IA
                  </TabsTrigger>
                  <TabsTrigger value="comparison" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Users className="h-4 w-4" />
                    Coaching
                  </TabsTrigger>
                  <TabsTrigger value="benchmark" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <GitCompare className="h-4 w-4" />
                    Benchmark
                  </TabsTrigger>
                  <TabsTrigger value="heatmap" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Flame className="h-4 w-4" />
                    Heatmap
                  </TabsTrigger>
                  <TabsTrigger value="competency" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Radar className="h-4 w-4" />
                    Competências
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Semanal
                  </TabsTrigger>
                  <TabsTrigger value="churn-risk" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <ShieldAlert className="h-4 w-4" />
                    Risco Churn
                  </TabsTrigger>
                  <TabsTrigger value="cohort" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <UserCheck className="h-4 w-4" />
                    Cohort
                  </TabsTrigger>
                  <TabsTrigger value="ltv" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <DollarSign className="h-4 w-4" />
                    LTV
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="winloss" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <WinLossAnalysis />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="velocity" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DealVelocityChart />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="conversion" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ConversionFunnel />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="objections" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ObjectionsLibrary />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="abc" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ABCAnalysis />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="closing" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ClosingTimeChart />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="churn" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChurnPrediction />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="coaching" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SalespersonCoaching />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="comparison" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CoachingComparison />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="benchmark" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PerformanceComparison />
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="heatmap" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ActivityHeatmap />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="competency" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CompetencyRadar />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="weekly" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <WeeklyPerformanceComparison />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="churn-risk" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChurnPredictionPanel />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="cohort" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CohortAnalysis />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="ltv" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LTVBySegment />
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </motion.div>
          </div>
        </PageTransition>
      </SkeletonTransition>
    </>
  );
}
