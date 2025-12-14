import { useState } from "react";
import { useSDRMetrics, PeriodFilter } from "@/hooks/useSDRMetrics";
import { SDRStatCard } from "@/components/sdr/SDRStatCard";
import { ProspectingFunnel } from "@/components/sdr/ProspectingFunnel";
import { LeadTemperatureChart } from "@/components/sdr/LeadTemperatureChart";
import { SchedulingRateGauge } from "@/components/sdr/SchedulingRateGauge";
import { TopSDRsRanking } from "@/components/sdr/TopSDRsRanking";
import { RecentProspects } from "@/components/sdr/RecentProspects";
import { SDRConversionRanking } from "@/components/sdr/SDRConversionRanking";
import { SDRConversionEvolution } from "@/components/sdr/SDRConversionEvolution";
import { LeadSLAMonitor } from "@/components/analytics/LeadSLAMonitor";
import { PeriodFilterButtons } from "@/components/vendedores/PeriodFilter";
import { SDRDashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Target,
  Flame,
  Thermometer,
  Phone
} from "lucide-react";

export default function SDRDashboard() {
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const { data: metrics, isLoading } = useSDRMetrics(period);

  const periodLabel = period === "week" ? "Esta semana" : period === "month" ? "Este mês" : "Este trimestre";

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<SDRDashboardLoadingSkeleton />}
      duration={400}
    >
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Dashboard SDR</h1>
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
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <SDRStatCard
              title="Total de Leads"
              value={metrics?.current.totalLeads ?? 0}
              change={metrics?.changes.leads}
              icon={Users}
              variant="primary"
              subtitle="Leads em prospecção"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <SDRStatCard
              title="Leads Qualificados"
              value={metrics?.current.qualifiedLeads ?? 0}
              change={metrics?.changes.qualified}
              icon={UserCheck}
              variant="success"
              subtitle="Prontos para Closer"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <SDRStatCard
              title="Reuniões Agendadas"
              value={metrics?.current.meetingsScheduled ?? 0}
              change={metrics?.changes.meetings}
              icon={CalendarCheck}
              subtitle={periodLabel}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <SDRStatCard
              title="Prospects Ativos"
              value={metrics?.current.activeProspects ?? 0}
              icon={Target}
              variant="warning"
              subtitle="Em trabalho"
            />
          </div>
        </div>

        {/* Second Row - Lead Temperature Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <SDRStatCard
              title="Leads Quentes"
              value={metrics?.current.hotLeads ?? 0}
              icon={Flame}
              variant="primary"
              subtitle="Score ≥ 75"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
            <SDRStatCard
              title="Leads Mornos"
              value={metrics?.current.warmLeads ?? 0}
              icon={Thermometer}
              subtitle="Score 50-74"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <SDRStatCard
              title="Leads Frios"
              value={metrics?.current.coldLeads ?? 0}
              icon={Thermometer}
              subtitle="Score < 50"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
            <SchedulingRateGauge
              rate={metrics?.current.schedulingRate ?? 0}
              change={metrics?.changes.schedulingRate}
              meetings={metrics?.current.meetingsScheduled ?? 0}
              leads={metrics?.current.totalLeads ?? 0}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <ProspectingFunnel />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "550ms" }}>
            <LeadTemperatureChart />
          </div>
        </div>

        {/* Conversion Evolution Chart */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <SDRConversionEvolution period={period} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "650ms" }}>
            <SDRConversionRanking period={period} />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <TopSDRsRanking />
          </div>
        </div>

        {/* Last Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <RecentProspects />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "750ms" }}>
            <LeadSLAMonitor />
          </div>
        </div>
      </div>
    </div>
    </SkeletonTransition>
  );
}
