import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useBIFilters } from "@/hooks/bi/useBIFilters";
import { useBICloser } from "@/hooks/bi/useBICloser";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { VendedorDashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { PageTransition, StaggeredContainer } from "@/components/transitions/PageTransition";
import { BIFilterBar, BIMetricCard, BIMetricsGrid, BIProjectionCard, BIComparisonCard, BIClientList, BIPurchaseHistory } from "@/components/bi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Target, TrendingUp, ShoppingBag, Clock, Trophy, Percent, Briefcase, CheckCircle, XCircle, Award } from "lucide-react";
import { BICloserHeader } from "@/components/bi/BICloserHeader";
import { BICloserCharts } from "@/components/bi/BICloserCharts";

const STAGE_LABELS: Record<string, string> = { qualified: "Qualificado", proposal: "Proposta", negotiation: "Negociação" };
const formatCurrency = (value: number) => `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

const BICloser = () => {
  const { salesperson } = useAuth();
  const filters = useBIFilters("this_month");
  const { data, isLoading, refetch } = useBICloser({ dateRange: filters.dateRange });

  return (
    <>
    <Helmet>
      <title>BI Closer | Promo Champions</title>
      <meta name="description" content="Business Intelligence para Closers" />
    </Helmet>
    <SkeletonTransition isLoading={isLoading} skeleton={<VendedorDashboardLoadingSkeleton />} duration={400}>
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
            <BICloserHeader
              salesperson={salesperson}
              periodLabel={filters.periodLabel}
              goalProgress={data?.goalProgress || 0}
              commissionRate={data?.commissionRate || 10}
              currentRank={data?.currentRank || 999}
            />

            <BIFilterBar
              period={filters.period} onPeriodChange={filters.setPeriod}
              customRange={filters.customRange} onCustomRangeChange={filters.setCustomRange}
              onReset={filters.resetFilters} hasActiveFilters={filters.hasActiveFilters}
              isLoading={isLoading} onRefresh={() => refetch()}
            />

            <StaggeredContainer delay={0.1}>
              <BIMetricsGrid cols={6}>
                <BIMetricCard title="Faturamento" value={data?.totalRevenue || 0} icon={DollarSign} variant="primary" format="currency"
                  comparison={{ previousPeriod: { value: data?.previousPeriod.revenue || 0, label: "Período Anterior" }, lastYear: { value: data?.sameLastYear.revenue || 0, label: "Mesmo Período Ano Anterior" }, goal: { value: data?.revenueGoal || 0, label: "Meta" } }} delay={0} />
                <BIMetricCard title="Meta" value={data?.revenueGoal || 0} icon={Target} format="currency" delay={1} />
                <BIMetricCard title="Comissão" value={data?.commission || 0} icon={Award} variant="success" format="currency" delay={2} />
                <BIMetricCard title="Ticket Médio" value={data?.avgTicket || 0} icon={ShoppingBag} format="currency"
                  comparison={{ previousPeriod: { value: data?.previousPeriod.avgTicket || 0, label: "Período Anterior" } }} delay={3} />
                <BIMetricCard title="Conversão" value={data?.conversionRate || 0} icon={Percent} format="percent"
                  comparison={{ previousPeriod: { value: data?.previousPeriod.conversionRate || 0, label: "Período Anterior" } }} delay={4} />
                <BIMetricCard title="Ranking" value={`#${data?.currentRank || "-"}`} icon={Trophy}
                  variant={data && data.currentRank <= 3 ? "success" : "default"} subtitle={`de ${data?.totalClosers || 0} Closers`} delay={5} />
              </BIMetricsGrid>
            </StaggeredContainer>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: CheckCircle, color: "success", value: data?.wonDeals || 0, label: "Ganhos" },
                { icon: XCircle, color: "destructive", value: data?.lostDeals || 0, label: "Perdidos" },
                { icon: TrendingUp, color: "primary", value: `${(data?.winRate || 0).toFixed(0)}%`, label: "Win Rate" },
                { icon: Clock, color: "warning", value: `${(data?.avgDaysToClose || 0).toFixed(0)}d`, label: "Tempo p/ Fechar" },
              ].map((m) => (
                <Card key={m.label} className="glass-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-${m.color}/15`}>
                      <m.icon className={`h-5 w-5 text-${m.color}`} />
                    </div>
                    <div>
                      <p className="text-metric">{m.value}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Projection & Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BIProjectionCard title="Projeção de Faturamento" currentValue={data?.totalRevenue || 0}
                projectedValue={data?.projectedRevenue || 0} goalValue={data?.revenueGoal || 0}
                daysRemaining={data?.daysRemaining || 0} dailyRequired={data?.dailyRevenueNeeded || 0} format="currency" />
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
                      <Briefcase className="h-4 w-4 text-primary-foreground" />
                    </div>
                    Pipeline de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-xl glass">
                      <p className="text-lg font-bold gradient-text">{data?.pipelineCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Deals</p>
                    </div>
                    <div className="p-3 rounded-xl glass">
                      <p className="text-lg font-bold">{formatCurrency(data?.pipelineValue || 0)}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                      <p className="text-lg font-bold text-success">{formatCurrency(data?.weightedPipeline || 0)}</p>
                      <p className="text-xs text-muted-foreground">Ponderado</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {data?.pipelineByStage?.map((stage) => (
                      <div key={stage.stage}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">{STAGE_LABELS[stage.stage] || stage.stage}</span>
                          <span className="text-muted-foreground">{stage.count} • {formatCurrency(stage.value)} ({(stage.probability * 100).toFixed(0)}%)</span>
                        </div>
                        <Progress value={stage.probability * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BIComparisonCard title="Faturamento" currentValue={data?.totalRevenue || 0} previousValue={data?.previousPeriod.revenue || 0} lastYearValue={data?.sameLastYear.revenue || 0} format="currency" />
              <BIComparisonCard title="Deals Fechados" currentValue={data?.completedDeals || 0} previousValue={data?.previousPeriod.deals || 0} lastYearValue={data?.sameLastYear.deals || 0} format="number" />
              <BIComparisonCard title="Taxa de Conversão" currentValue={data?.conversionRate || 0} previousValue={data?.previousPeriod.conversionRate || 0} lastYearValue={data?.sameLastYear.conversionRate || 0} format="percent" />
            </div>

            <BICloserCharts
              revenueByDay={data?.revenueByDay || []}
              dealsByCategory={data?.dealsByCategory || []}
              revenueByMonth={data?.revenueByMonth || []}
            />

            {/* Client Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BIClientList title="Top Clientes por Valor"
                clients={data?.topClients?.map(c => ({ name: c.name, company: c.company, totalValue: c.totalValue, dealsCount: c.dealsCount, avgTicket: c.avgTicket })) || []}
                type="top-value" maxItems={10} />
              <BIClientList title="Maior Ticket Médio"
                clients={data?.highestTicketClients?.map(c => ({ name: c.name, totalValue: 0, avgTicket: c.avgTicket, dealsCount: c.totalPurchases })) || []}
                type="top-ticket" maxItems={10} />
            </div>

            {data?.clientPurchaseHistory && data.clientPurchaseHistory.length > 0 && (
              <BIPurchaseHistory data={data.clientPurchaseHistory} />
            )}
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
};

export default BICloser;
