import { Helmet } from "react-helmet-async";
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
import { motion } from "framer-motion";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
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
    <>
    <Helmet>
      <title>Dashboard Closer | Promo Champions</title>
      <meta name="description" content="Painel de performance do Closer" />
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<CloserDashboardLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-page-title gradient-text">Dashboard Closer</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Métricas de fechamento e conversão
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <PeriodFilterButtons value={period} onChange={setPeriod} />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
                    <Handshake className="h-4 w-4 text-success" />
                    <span className="text-xs font-medium text-success">Modo Fechamento</span>
                  </div>
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
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <CloserStatCard
                  title="Faturamento Total"
                  value={formatCurrency(metrics?.current.closedValue ?? 0)}
                  change={metrics?.changes.value}
                  icon={DollarSign}
                  variant="primary"
                  subtitle="Vendas fechadas"
                  hero
                  highlight
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <CloserStatCard
                  title="Vendas Fechadas"
                  value={metrics?.current.closedDeals ?? 0}
                  change={metrics?.changes.deals}
                  icon={CheckCircle}
                  variant="success"
                  subtitle={periodLabel}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <CloserStatCard
                  title="Taxa de Conversão"
                  value={`${(metrics?.current.conversionRate ?? 0).toFixed(1)}%`}
                  change={metrics?.changes.conversion}
                  icon={TrendingUp}
                  subtitle="Proposta → Fechado"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <CloserStatCard
                  title="Ticket Médio"
                  value={formatCurrency(metrics?.current.avgDealSize ?? 0)}
                  icon={Target}
                  variant="warning"
                  subtitle="Por venda"
                />
              </motion.div>
            </motion.div>

            {/* Second Row - Pipeline Stats */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <CloserStatCard
                  title="Em Proposta"
                  value={metrics?.current.inProposal ?? 0}
                  icon={FileText}
                  subtitle="Aguardando resposta"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <CloserStatCard
                  title="Em Negociação"
                  value={metrics?.current.inNegotiation ?? 0}
                  icon={Handshake}
                  variant="warning"
                  subtitle="Fase final"
                />
              </motion.div>
            </motion.div>

            {/* Main Grid */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CloserRevenueComparison period={period} />
              <TopClosersRanking />
            </motion.div>

            {/* Revenue Evolution Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CloserRevenueEvolution period={period} />
            </motion.div>

            {/* Pipeline Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <CloserPipeline />
            </motion.div>

            {/* Bottom Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <RecentClosedDeals />
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
}
