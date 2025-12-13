import { MainLayout } from '@/components/layout/MainLayout';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, TrendingUp, BookOpen, BarChart3, Layers, Timer, AlertTriangle, Brain, Users, GitCompare } from 'lucide-react';
import { useWinLossAnalysis } from '@/hooks/useWinLossAnalysis';
import { AnalyticsPageLoadingSkeleton } from '@/components/skeletons/PageLoadingSkeleton';
import { SkeletonTransition } from '@/components/skeletons/SkeletonTransition';

export default function Analytics() {
  const { isLoading } = useWinLossAnalysis();

  return (
    <MainLayout>
      <SkeletonTransition
        isLoading={isLoading}
        skeleton={<AnalyticsPageLoadingSkeleton />}
        duration={400}
      >
        <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics de Vendas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Análises avançadas para otimizar sua performance de vendas
          </p>
        </div>

        {/* Tabs */}
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
          </TabsList>

          <TabsContent value="winloss" className="space-y-4">
            <WinLossAnalysis />
          </TabsContent>

          <TabsContent value="velocity" className="space-y-4">
            <DealVelocityChart />
          </TabsContent>

          <TabsContent value="conversion" className="space-y-4">
            <ConversionFunnel />
          </TabsContent>

          <TabsContent value="objections" className="space-y-4">
            <ObjectionsLibrary />
          </TabsContent>

          <TabsContent value="abc" className="space-y-4">
            <ABCAnalysis />
          </TabsContent>

          <TabsContent value="closing" className="space-y-4">
            <ClosingTimeChart />
          </TabsContent>

          <TabsContent value="churn" className="space-y-4">
            <ChurnPrediction />
          </TabsContent>

          <TabsContent value="coaching" className="space-y-4">
            <SalespersonCoaching />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <CoachingComparison />
          </TabsContent>

          <TabsContent value="benchmark" className="space-y-4">
            <PerformanceComparison />
          </TabsContent>
        </Tabs>
      </div>
      </SkeletonTransition>
    </MainLayout>
  );
}
