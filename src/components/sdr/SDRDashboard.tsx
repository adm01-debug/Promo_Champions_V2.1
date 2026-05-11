import { memo, useMemo, useState } from "react";
import { 
  Users, 
  Target, 
  CalendarCheck, 
  TrendingUp, 
  Clock, 
  Activity,
  Zap,
  LayoutDashboard,
  Search
} from "lucide-react";
import { useSDRMetrics } from "@/hooks/useSDRMetrics";
import { SDRStatCard } from "./SDRStatCard";
import { SchedulingRateGauge } from "./SchedulingRateGauge";
import { RecentProspects } from "./RecentProspects";
import { ProspectingFunnel } from "./ProspectingFunnel";
import { PredictiveSuccessMap } from "./PredictiveSuccessMap";
import { PerformanceCoaching } from "./PerformanceCoaching";
import { SDRAchievementTracker } from "./SDRAchievementTracker";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { LeadScoreBreakdown } from "./LeadScoreBreakdown";

const SDRDashboardInner = () => {
  const { data: metrics, isLoading } = useSDRMetrics("month");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLeadData, setSelectedLeadData] = useState<{name: string, score: number} | null>(null);

  const statCards = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        title: "Total de Leads",
        value: metrics.current.totalLeads,
        change: metrics.changes.leads,
        icon: Users,
        variant: "primary" as const,
        subtitle: "Novos leads no mês",
      },
      {
        title: "Leads Qualificados",
        value: metrics.current.qualifiedLeads,
        change: metrics.changes.qualified,
        icon: Target,
        variant: "success" as const,
        subtitle: "Prontos para fechamento",
      },
      {
        title: "Reuniões Agendadas",
        value: metrics.current.meetingsScheduled,
        change: metrics.changes.meetings,
        icon: CalendarCheck,
        variant: "warning" as const,
        subtitle: "Meetings este mês",
      },
      {
        title: "Pipeline Ativo",
        value: metrics.current.activeProspects,
        icon: Activity,
        variant: "default" as const,
        subtitle: "Em negociação",
      },
    ];
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-muted-foreground animate-pulse">CARREGANDO TELEMETRIA SDR...</p>
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
              <ProspectingFunnel />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SDRAchievementTracker />
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
            <PredictiveSuccessMap />
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
            <TabsTrigger value="activity" className="gap-2">
              <Clock className="w-4 h-4" />
              Activity Audit
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="coaching" className="mt-0 outline-none">
            <PerformanceCoaching />
          </TabsContent>
          
          <TabsContent value="activity" className="mt-0 outline-none">
            <div className="glass border-primary/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <LayoutDashboard className="w-12 h-12 text-primary/40 mb-4" />
              <h3 className="text-lg font-bold">Activity Audit em Desenvolvimento</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Estamos processando seus logs de chamadas e mensagens para gerar um mapa de calor de produtividade detalhado.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export const SDRDashboard = memo(SDRDashboardInner);