import { Helmet } from "react-helmet-async";
import { useState } from "react";
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
  TrendingUp
} from "lucide-react";

export default function SDRDashboard() {
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const { data: metrics, isLoading } = useSDRMetrics(period);

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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-page-title gradient-text">Dashboard SDR</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Métricas de prospecção e taxa de agendamento
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <PeriodFilterButtons value={period} onChange={setPeriod} />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">Modo Prospecção</span>
                  </div>
                </div>
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

            {/* Main Grid */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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
            </>
            )}
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
}
