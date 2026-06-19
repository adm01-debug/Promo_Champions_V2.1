import { memo, useMemo, useState, lazy, Suspense } from 'react';
import {
  Users,
  Target,
  CalendarCheck,
  TrendingUp,
  Clock,
  Activity,
  Zap,
  MessageSquare,
  FileCheck,
  Calculator,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { useSDRMetrics } from '@/hooks/useSDRMetrics';
import { SDRStatCard } from './SDRStatCard';
import { SchedulingRateGauge } from './SchedulingRateGauge';
import { RecentProspects } from './RecentProspects';
import { SDRAdvancedFilters } from './SDRAdvancedFilters';
import { SDRIntelligenceHighlights } from './SDRIntelligenceHighlights';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/components/transitions/PageTransition';
import { LeadScoreBreakdown } from './LeadScoreBreakdown';
import { SDRCommandBar } from './SDRCommandBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LazyVisible } from '@/components/common/LazyVisible';
import { Skeleton } from '@/components/ui/skeleton';

// Heavy / chart-bearing modules — only load when needed
const ProspectingFunnel = lazy(() =>
  import('./ProspectingFunnel').then(m => ({ default: m.ProspectingFunnel })),
);
const PredictiveSuccessMap = lazy(() =>
  import('./PredictiveSuccessMap').then(m => ({ default: m.PredictiveSuccessMap })),
);
const SDRAchievementTracker = lazy(() =>
  import('./SDRAchievementTracker').then(m => ({ default: m.SDRAchievementTracker })),
);
const SDRActivityTrend = lazy(() =>
  import('./SDRActivityTrend').then(m => ({ default: m.SDRActivityTrend })),
);
const SDRConversionEvolution = lazy(() =>
  import('./SDRConversionEvolution').then(m => ({ default: m.SDRConversionEvolution })),
);
const SDRConversionRanking = lazy(() =>
  import('./SDRConversionRanking').then(m => ({ default: m.SDRConversionRanking })),
);
const TopSDRsRanking = lazy(() =>
  import('./TopSDRsRanking').then(m => ({ default: m.TopSDRsRanking })),
);
const ActivityAuditTrail = lazy(() =>
  import('./ActivityAuditTrail').then(m => ({ default: m.ActivityAuditTrail })),
);
const SDRConversationInsights = lazy(() =>
  import('./SDRConversationInsights').then(m => ({ default: m.SDRConversationInsights })),
);
const MQLQualificationForm = lazy(() =>
  import('./MQLQualificationForm').then(m => ({ default: m.MQLQualificationForm })),
);
const SDRAlertHistory = lazy(() =>
  import('./SDRAlertHistory').then(m => ({ default: m.SDRAlertHistory })),
);
const SDRSequenceOrchestrator = lazy(() =>
  import('./SDRSequenceOrchestrator').then(m => ({ default: m.SDRSequenceOrchestrator })),
);
const PerformanceCoaching = lazy(() =>
  import('./PerformanceCoaching').then(m => ({ default: m.PerformanceCoaching })),
);
const TargetSimulator = lazy(() =>
  import('./TargetSimulator').then(m => ({ default: m.TargetSimulator })),
);

const ChartFallback = ({ height = 280 }: { height?: number }) => (
  <Skeleton className="w-full rounded-xl" style={{ height }} />
);

const SDRDashboardInner = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [filters, setFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { data: metrics, isLoading } = useSDRMetrics(period, filters, searchTerm);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLeadData, setSelectedLeadData] = useState<{
    name: string;
    score: number;
  } | null>(null);

  const statCards = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        title: 'Total de Leads',
        value: metrics.current.totalLeads,
        change: metrics.changes.leads,
        icon: Users,
        variant: 'primary' as const,
        subtitle: 'Novos leads no mês',
      },
      {
        title: 'Leads Qualificados',
        value: metrics.current.qualifiedLeads,
        change: metrics.changes.qualified,
        icon: Target,
        variant: 'success' as const,
        subtitle: 'Prontos para fechamento',
      },
      {
        title: 'Reuniões Agendadas',
        value: metrics.current.meetingsScheduled,
        change: metrics.changes.meetings,
        icon: CalendarCheck,
        variant: 'warning' as const,
        subtitle: 'Meetings este mês',
      },
      {
        title: 'Pipeline Ativo',
        value: metrics.current.activeProspects,
        icon: Activity,
        variant: 'default' as const,
        subtitle: 'Em negociação',
      },
    ];
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-muted-foreground animate-pulse">
            CARREGANDO TELEMETRIA SDR...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex items-center justify-between mb-4 glass p-4 rounded-xl border-primary/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-success uppercase tracking-widest">
              Live Telemetry Active
            </span>
          </div>

          <Tabs
            value={period}
            onValueChange={(v: any) => setPeriod(v)}
            className="w-auto"
          >
            <TabsList className="h-8 bg-muted/30">
              <TabsTrigger value="week" className="text-[10px] uppercase font-bold px-3">
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="text-[10px] uppercase font-bold px-3">
                Mês
              </TabsTrigger>
              <TabsTrigger
                value="quarter"
                className="text-[10px] uppercase font-bold px-3"
              >
                Trimestre
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground/60 flex items-center gap-2">
          <Clock className="h-3 w-3" />
          LAST_SYNC: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <SDRAdvancedFilters onSearch={setSearchTerm} onFilterChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8">
          <SDRCommandBar />
        </div>
        <div className="lg:col-span-4">
          <SDRIntelligenceHighlights />
        </div>
      </div>

      {/* Upper Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div key={card.title} variants={itemVariants}>
            <SDRStatCard {...card} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core Conversion & Funnel */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div variants={itemVariants}>
            <SchedulingRateGauge
              rate={metrics?.current.schedulingRate || 0}
              change={metrics?.changes.schedulingRate}
              meetings={metrics?.current.meetingsScheduled || 0}
              leads={metrics?.current.totalLeads || 0}
              title="Conversão para Reunião"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <LazyVisible minHeight={320} fallback={<ChartFallback height={320} />}>
                <Suspense fallback={<ChartFallback height={320} />}>
                  <ProspectingFunnel />
                </Suspense>
              </LazyVisible>
            </motion.div>
            <motion.div variants={itemVariants}>
              <LazyVisible minHeight={320} fallback={<ChartFallback height={320} />}>
                <Suspense fallback={<ChartFallback height={320} />}>
                  <SDRAchievementTracker />
                </Suspense>
              </LazyVisible>
            </motion.div>
          </div>
        </div>

        {/* Intelligence Sidepanel */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div variants={itemVariants}>
            <RecentProspects
              onSelectLead={(id, name, score) => {
                setSelectedLeadId(id === selectedLeadId ? null : id);
                setSelectedLeadData(id === selectedLeadId ? null : { name, score });
              }}
              selectedLeadId={selectedLeadId}
              searchTerm={searchTerm}
              filters={filters}
            />
          </motion.div>

          <AnimatePresence>
            {selectedLeadId && selectedLeadData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                variants={itemVariants}
              >
                <LeadScoreBreakdown
                  leadName={selectedLeadData.name}
                  score={selectedLeadData.score}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants}>
            <LazyVisible minHeight={320} fallback={<ChartFallback height={320} />}>
              <Suspense fallback={<ChartFallback height={320} />}>
                <PredictiveSuccessMap />
              </Suspense>
            </LazyVisible>
          </motion.div>
        </div>
      </div>

      {/* Advanced Insights Tabbed Section */}
      <motion.div variants={itemVariants} className="pt-4">
        <Tabs defaultValue="coaching" className="w-full">
          <TabsList className="bg-muted/50 p-1 border border-border/40 mb-6">
            <TabsTrigger value="coaching" className="gap-2">
              <Zap className="w-4 h-4" />
              AI Performance Coaching
            </TabsTrigger>
            <TabsTrigger value="orchestrator" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Sequence Orchestrator
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Clock className="w-4 h-4" />
              Activity Audit
            </TabsTrigger>
            <TabsTrigger value="conversations" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversation Intel
            </TabsTrigger>
            <TabsTrigger value="qualification" className="gap-2">
              <FileCheck className="w-4 h-4" />
              MQL Qualification
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Award className="w-4 h-4" />
              Ranking & Growth
            </TabsTrigger>
            <TabsTrigger value="strategy" className="gap-2">
              <Calculator className="w-4 h-4" />
              Strategy Simulator
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alert History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coaching" className="mt-0 outline-none">
            <PerformanceCoaching />
          </TabsContent>

          <TabsContent value="orchestrator" className="mt-0 outline-none">
            <SDRSequenceOrchestrator />
          </TabsContent>

          <TabsContent value="activity" className="mt-0 outline-none">
            <ActivityAuditTrail />
          </TabsContent>

          <TabsContent value="conversations" className="mt-0 outline-none">
            <SDRConversationInsights />
          </TabsContent>

          <TabsContent value="qualification" className="mt-0 outline-none">
            <MQLQualificationForm
              saleId={selectedLeadId}
              clientName={selectedLeadData?.name}
            />
          </TabsContent>

          <TabsContent value="performance" className="mt-0 outline-none space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SDRConversionRanking period={period} />
              <TopSDRsRanking />
            </div>
            <SDRConversionEvolution period={period} />
          </TabsContent>

          <TabsContent value="strategy" className="mt-0 outline-none space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TargetSimulator />
              <SDRActivityTrend period={period} />
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-0 outline-none">
            <SDRAlertHistory />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export const SDRDashboard = memo(SDRDashboardInner);
