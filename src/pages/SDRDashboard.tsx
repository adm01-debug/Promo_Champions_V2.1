import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useSDRMetrics, PeriodFilter } from "@/hooks/useSDRMetrics";
import { SDRStatCard } from "@/components/sdr/SDRStatCard";
import { CompactStatCard } from "@/components/dashboard/CompactStatCard";
import { ProspectingFunnel } from "@/components/sdr/ProspectingFunnel";
import { LeadTemperatureChart } from "@/components/sdr/LeadTemperatureChart";
import { SchedulingRateGauge } from "@/components/sdr/SchedulingRateGauge";
import { TopSDRsRanking } from "@/components/sdr/TopSDRsRanking";
import { RecentProspects } from "@/components/sdr/RecentProspects";
import { SDRConversionRanking } from "@/components/sdr/SDRConversionRanking";
import { SDRConversionEvolution } from "@/components/sdr/SDRConversionEvolution";
import { SDRActivityTrend } from "@/components/sdr/SDRActivityTrend";
import { LeadSLAMonitor } from "@/components/analytics/LeadSLAMonitor";
import { PeriodFilterButtons } from "@/components/vendedores/PeriodFilter";
import { SDRDashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { motion } from "framer-motion";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { DialerQueueCard } from "@/components/dialer/DialerQueueCard";
import { CurrentCallCard } from "@/components/dialer/CurrentCallCard";
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Target,
  Flame,
  Thermometer,
  Phone,
  Snowflake,
  Clock,
  TrendingUp,
  Zap,
  Download,
  FileJson,
  FileText,
  Search,
  Sparkles,
  Trophy
} from "lucide-react";
import { exportToCSV } from "@/lib/csvExporter";
import { exportToPDF } from "@/lib/pdfExporter";

import { SDRAdvancedFilters } from "@/components/sdr/SDRAdvancedFilters";
import { SDRIntelligenceHighlights } from "@/components/sdr/SDRIntelligenceHighlights";
import { SDRAlertHistory } from "@/components/sdr/SDRAlertHistory";
import { MQLQualificationForm } from "@/components/sdr/MQLQualificationForm";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { useDialerQueues, useRebuildQueue, useNextItem } from "@/hooks/dialer/usePowerDialer";
import { toast } from "sonner";

export default function SDRDashboard() {
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [filters, setFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: metrics, isLoading } = useSDRMetrics(period, filters, searchTerm);

  
  // Dialer State
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<{ item_id: string; sale_id: string; score: number } | null>(null);
  
  const { data: queues } = useDialerQueues();
  const rebuildQueue = useRebuildQueue();
  const nextItem = useNextItem();

  const handleStartQueue = async (queueId: string) => {
    setActiveQueueId(queueId);
    try {
      const item = await nextItem.mutateAsync(queueId);
      if (item) {
        setCurrentItem({ item_id: item.item_id, sale_id: item.sale_id, score: item.score });
        toast.success("Modo Power Dialer Ativado!");
      } else {
        toast.info("Fila vazia. Adicione leads ou reconstrua a fila.");
      }
    } catch (err) {
      toast.error("Erro ao iniciar fila");
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!metrics) {
      toast.error("Sem dados para exportar");
      return;
    }

    toast.info(`Preparando exportação em ${format.toUpperCase()}...`);
    
    const summaryData = [
      { Métrica: "Total de Leads", Valor: metrics.current.totalLeads, Crescimento: `${metrics.changes.leads.toFixed(1)}%` },
      { Métrica: "Leads Qualificados", Valor: metrics.current.qualifiedLeads, Crescimento: `${metrics.changes.qualified.toFixed(1)}%` },
      { Métrica: "Reuniões Agendadas", Valor: metrics.current.meetingsScheduled, Crescimento: `${metrics.changes.meetings.toFixed(1)}%` },
      { Métrica: "Taxa de Agendamento", Valor: `${metrics.current.schedulingRate.toFixed(1)}%`, Crescimento: `${metrics.changes.schedulingRate.toFixed(1)}%` },
      { Métrica: "Leads Quentes", Valor: metrics.current.hotLeads },
      { Métrica: "Leads Frios", Valor: metrics.current.coldLeads },
      { Métrica: "Tempo Médio Conversão", Valor: "3.2 dias" }
    ];

    try {
      if (format === 'csv') {
        await exportToCSV(summaryData, `relatorio-sdr-resumo-${period}`);
      } else {
        await exportToPDF(
          summaryData, 
          `relatorio-sdr-completo-${period}`,
          `Relatório de Performance SDR - ${periodLabel}`
        );
      }
      toast.success(`Relatório SDR exportado com sucesso!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar relatório");
    }
  };

  // Rejection Rate Alert Logic
  const totalLeads = metrics?.current.totalLeads || 0;
  const qualifiedLeads = metrics?.current.qualifiedLeads || 0;
  const rejectionRate = totalLeads > 0 ? ((totalLeads - qualifiedLeads) / totalLeads) * 100 : 0;
  const rejectionThreshold = 40; // Example threshold

  useEffect(() => {
    if (rejectionRate > rejectionThreshold) {
      toast.warning("Alerta de Performance", {
        description: `Sua taxa de rejeição está em ${rejectionRate.toFixed(1)}%, acima do limite de ${rejectionThreshold}%.`,
        duration: 10000,
      });
    }
  }, [rejectionRate]);


  const periodLabel = period === "week" ? "Esta semana" : period === "month" ? "Este mês" : "Este trimestre";
  
  const hasNoData = !isLoading && (!metrics || metrics.current.totalLeads === 0);

  return (
    <>
    <Helmet>
      <title>Dashboard SDR | Promo Champions</title>
      <meta name="description" content="Painel de performance do SDR" />
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<SDRDashboardLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
            {hasNoData ? (
              <div className="flex flex-col gap-8">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-page-title gradient-text">Dashboard SDR</h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        Inicie sua jornada de prospecção
                      </p>
                    </div>
                    <PeriodFilterButtons value={period} onChange={setPeriod} />
                  </div>
                </motion.div>
                
                <div className="h-[60vh] min-h-[400px]">
                  <DashboardEmptyState type="conversion" hero />
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-page-title gradient-text">Dashboard SDR</h1>
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold border-primary/30 text-primary animate-pulse">
                      SDR 10/10
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Análise preditiva de prospecção e taxa de agendamento
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <PeriodFilterButtons value={period} onChange={setPeriod} />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-2 border-primary/20 hover:bg-primary/5">
                        <Download className="h-4 w-4" />
                        Exportar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass">
                      <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
                        <FileJson className="h-4 w-4 text-green-500" />
                        Exportar CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        Exportar PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">Modo Alta Performance</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <SDRAdvancedFilters 
                  onSearch={(val) => setSearchTerm(val)} 
                  onFilterChange={(f) => setFilters(f)} 
                />
              </div>

            </motion.div>

            {/* Hero Metrics - Gauges Row */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-xl blur-xl opacity-70" />
                <div className="relative h-full">
                  <SchedulingRateGauge
                    rate={metrics?.current.schedulingRate ?? 0}
                    change={metrics?.changes.schedulingRate}
                    meetings={metrics?.current.meetingsScheduled ?? 0}
                    leads={metrics?.current.totalLeads ?? 0}
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-success/30 via-success/10 to-success/30 rounded-xl blur-xl opacity-70" />
                <div className="relative h-full">
                  <SchedulingRateGauge
                    rate={(metrics?.current.qualifiedLeads ?? 0) / (metrics?.current.totalLeads || 1) * 100}
                    change={metrics?.changes.qualified}
                    meetings={metrics?.current.qualifiedLeads ?? 0}
                    leads={metrics?.current.totalLeads ?? 0}
                    title="Qualification Efficiency"
                    variant="success"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <SDRStatCard
                  title="Total de Leads"
                  value={metrics?.current.totalLeads ?? 0}
                  change={metrics?.changes.leads}
                  icon={Users}
                  variant="primary"
                  subtitle="Leads em prospecção"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <SDRStatCard
                  title="Leads Qualificados"
                  value={metrics?.current.qualifiedLeads ?? 0}
                  change={metrics?.changes.qualified}
                  icon={UserCheck}
                  variant="success"
                  subtitle="Prontos para Closer"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <SDRStatCard
                  title="Reuniões Agendadas"
                  value={metrics?.current.meetingsScheduled ?? 0}
                  change={metrics?.changes.meetings}
                  icon={CalendarCheck}
                  subtitle={periodLabel}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <SDRStatCard
                  title="Prospects Ativos"
                  value={metrics?.current.activeProspects ?? 0}
                  icon={Target}
                  variant="warning"
                  subtitle="Em trabalho"
                />
              </motion.div>
            </motion.div>

            {/* Secondary Metrics - Compact Cards with Circular Icons */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <CompactStatCard
                title="Leads Quentes"
                value={metrics?.current.hotLeads ?? 0}
                icon={Flame}
                variant="danger"
                subtitle="Score ≥ 75"
              />
              <CompactStatCard
                title="Leads Mornos"
                value={metrics?.current.warmLeads ?? 0}
                icon={Thermometer}
                variant="warning"
                subtitle="Score 50-74"
              />
              <CompactStatCard
                title="Leads Frios"
                value={metrics?.current.coldLeads ?? 0}
                icon={Snowflake}
                variant="info"
                subtitle="Score < 50"
              />
              <CompactStatCard
                title="Taxa Conversão"
                value={`${(metrics?.current.schedulingRate ?? 0).toFixed(1)}%`}
                icon={TrendingUp}
                variant="success"
              />
              <CompactStatCard
                title="Tempo Médio"
                value="3.2d"
                icon={Clock}
                variant="primary"
                subtitle="Lead → Qualificado"
              />
              <CompactStatCard
                title="Atividades Hoje"
                value={metrics?.current.activeProspects ?? 0}
                icon={Target}
                variant="primary"
              />
            </motion.div>

            {/* Dialer & Power Mode */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary animate-pulse" />
                <h2 className="text-lg font-bold gradient-text">Power Dialer</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {queues && queues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {queues.map((queue) => (
                        <DialerQueueCard 
                          key={queue.id}
                          queue={queue}
                          isActive={activeQueueId === queue.id}
                          onSelect={() => setActiveQueueId(queue.id)}
                          onRebuild={() => rebuildQueue.mutate(queue.id)}
                          onStart={() => handleStartQueue(queue.id)}
                          rebuilding={rebuildQueue.isPending}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center glass rounded-xl border border-dashed border-border/50">
                      <p className="text-sm text-muted-foreground">Nenhuma fila de prospecção configurada.</p>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  {currentItem ? (
                    <CurrentCallCard 
                      itemId={currentItem.item_id}
                      saleId={currentItem.sale_id}
                      score={currentItem.score}
                      onSkip={async () => {
                        if (activeQueueId) {
                          const item = await nextItem.mutateAsync(activeQueueId);
                          setCurrentItem(item ? { item_id: item.item_id, sale_id: item.sale_id, score: item.score } : null);
                        }
                      }}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 glass rounded-xl border border-border/30 bg-muted/5 text-center">
                      <Phone className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">Nenhuma chamada ativa</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Inicie uma fila para começar a prospecção acelerada</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Intelligence & Goals Row */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42 }}
            >
              <div className="lg:col-span-2">
                <SDRIntelligenceHighlights />
              </div>
              <div className="glass rounded-xl p-6 border border-primary/20 bg-primary/5 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none rotate-12">
                  <Trophy className="h-32 w-32 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Sua Meta Mensal
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground">74% Concluído</span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-background/50 rounded-full overflow-hidden border border-border/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "74%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-purple-500"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                      <span>R$ 148k</span>
                      <span>Meta: R$ 200k</span>
                    </div>
                    <p className="text-xs text-center text-muted-foreground italic">
                      "Faltam apenas 12 agendamentos para bater a meta premium!"
                    </p>
                    <Button variant="outline" size="sm" className="w-full mt-2 h-8 text-[10px] uppercase font-bold tracking-widest border-primary/20 hover:bg-primary/5">
                      Ver Detalhes da Corrida
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.44 }}
            >
              <div className="lg:col-span-1">
                <MQLQualificationForm />
              </div>
              <div className="lg:col-span-2">
                <SDRAlertHistory />
              </div>
            </motion.div>


            {/* Main Grid */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <ProspectingFunnel />
              <LeadTemperatureChart />
            </motion.div>

            {/* Evolution Charts */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <SDRConversionEvolution period={period} />
              <SDRActivityTrend period={period} />
            </motion.div>

            {/* Rankings Row */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <SDRConversionRanking period={period} />
              <TopSDRsRanking />
            </motion.div>

            {/* Last Row */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <RecentProspects />
              <LeadSLAMonitor />
            </motion.div>

            {/* Alert History Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <SDRAlertHistory />
            </motion.div>
            </>
            )}
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
}
