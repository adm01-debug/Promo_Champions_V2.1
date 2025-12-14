import { useState } from "react";
import { useCloserMetrics, PeriodFilter } from "@/hooks/useCloserMetrics";
import { CloserStatCard } from "@/components/closer/CloserStatCard";
import { CloserPipeline } from "@/components/closer/CloserPipeline";
import { TopClosersRanking } from "@/components/closer/TopClosersRanking";
import { RecentClosedDeals } from "@/components/closer/RecentClosedDeals";
import { CloserRevenueComparison } from "@/components/closer/CloserRevenueComparison";
import { CloserRevenueEvolution } from "@/components/closer/CloserRevenueEvolution";
import { PeriodFilterButtons } from "@/components/vendedores/PeriodFilter";
import { CloserDashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { 
  DollarSign, 
  CheckCircle, 
  TrendingUp, 
  Target,
  Handshake,
  FileText
} from "lucide-react";

export default function CloserDashboard() {
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const { data: metrics, isLoading } = useCloserMetrics(period);

  const periodLabel = period === "week" ? "Esta semana" : period === "month" ? "Este mês" : "Este trimestre";

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<CloserDashboardLoadingSkeleton />}
      duration={400}
    >
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Dashboard Closer</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Métricas de fechamento e conversão
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PeriodFilterButtons value={period} onChange={setPeriod} />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <Handshake className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-500">Modo Fechamento</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <CloserStatCard
              title="Vendas Fechadas"
              value={metrics?.current.closedDeals ?? 0}
              change={metrics?.changes.deals}
              icon={CheckCircle}
              variant="success"
              subtitle={periodLabel}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <CloserStatCard
              title="Faturamento"
              value={formatCurrency(metrics?.current.closedValue ?? 0)}
              change={metrics?.changes.value}
              icon={DollarSign}
              variant="primary"
              subtitle="Vendas fechadas"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <CloserStatCard
              title="Taxa de Conversão"
              value={`${(metrics?.current.conversionRate ?? 0).toFixed(1)}%`}
              change={metrics?.changes.conversion}
              icon={TrendingUp}
              subtitle="Proposta → Fechado"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <CloserStatCard
              title="Ticket Médio"
              value={formatCurrency(metrics?.current.avgDealSize ?? 0)}
              icon={Target}
              variant="warning"
              subtitle="Por venda"
            />
          </div>
        </div>

        {/* Second Row - Pipeline Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <CloserStatCard
              title="Em Proposta"
              value={metrics?.current.inProposal ?? 0}
              icon={FileText}
              subtitle="Aguardando resposta"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
            <CloserStatCard
              title="Em Negociação"
              value={metrics?.current.inNegotiation ?? 0}
              icon={Handshake}
              variant="warning"
              subtitle="Fase final"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <CloserRevenueComparison period={period} />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
            <TopClosersRanking />
          </div>
        </div>

        {/* Revenue Evolution Chart */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <CloserRevenueEvolution period={period} />
        </div>

        {/* Pipeline Row */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "550ms" }}>
          <CloserPipeline />
        </div>

        {/* Bottom Row */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <RecentClosedDeals />
        </div>
      </div>
    </div>
    </SkeletonTransition>
  );
}
