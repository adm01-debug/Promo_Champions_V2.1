import { Helmet } from "react-helmet-async";
import { LeadSourceMetrics } from "@/components/analytics/LeadSourceMetrics";
import { LeadSourceTrendChart } from "@/components/analytics/LeadSourceTrendChart";
import { LeadSourceDistribution } from "@/components/analytics/LeadSourceDistribution";
import { Card, CardContent } from "@/components/ui/card";
import { useLeadSourceAnalysis, sourceLabels } from "@/hooks/useLeadSourceAnalysis";
import { Target, TrendingUp, DollarSign, Percent } from "lucide-react";
import { FonteLeadsLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";

export default function FonteLeads() {
  const { data, isLoading } = useLeadSourceAnalysis(3);

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const overallConversion = data?.totalLeads && data.totalLeads > 0 
    ? ((data.totalClosed / data.totalLeads) * 100).toFixed(1) 
    : "0";

  const avgTicket = data?.totalClosed && data.totalClosed > 0 
    ? data.totalValue / data.totalClosed 
    : 0;

  return (
    <>
    <Helmet>
      <title>Fonte de Leads | Promo Champions</title>
      <meta name="description" content="Análise de origens de leads" />
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<FonteLeadsLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-page-title gradient-text">Análise de Fonte de Leads</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Identifique quais canais geram mais conversão e ROI
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Últimos 3 meses</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.totalLeads || 0}</p>
                <p className="text-xs text-muted-foreground">Total de Leads</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.totalClosed || 0}</p>
                <p className="text-xs text-muted-foreground">Fechamentos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/10">
                <Percent className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallConversion}%</p>
                <p className="text-xs text-muted-foreground">Conversão Geral</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-streak/10">
                <DollarSign className="h-5 w-5 text-streak" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(avgTicket)}</p>
                <p className="text-xs text-muted-foreground">Ticket Médio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Source Metrics - Main */}
          <div className="lg:col-span-2 opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <LeadSourceMetrics />
          </div>

          {/* Distribution Chart */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <LeadSourceDistribution />
          </div>
        </div>

        {/* Trend Chart */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <LeadSourceTrendChart />
        </div>

        {/* Insights */}
        {data && data.sources.length > 0 && (
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <Card className="glass border-border/40">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium mb-4">💡 Insights Automáticos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.highestValueSource && (
                    <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success mb-1">Maior ROI</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>{sourceLabels[data.highestValueSource]}</strong> gerou o maior valor em vendas fechadas. 
                        Considere aumentar investimento neste canal.
                      </p>
                    </div>
                  )}
                  {data.bestConversionSource && (
                    <div className="p-4 rounded-lg bg-info/5 border border-info/20">
                      <p className="text-sm font-medium text-info mb-1">Melhor Conversão</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>{sourceLabels[data.bestConversionSource]}</strong> tem a maior taxa de conversão. 
                        Leads deste canal são mais qualificados.
                      </p>
                    </div>
                  )}
                  {data.highestVolumeSource && data.highestVolumeSource !== data.highestValueSource && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm font-medium text-primary mb-1">Maior Volume</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>{sourceLabels[data.highestVolumeSource]}</strong> gera mais leads, mas nem sempre maior valor. 
                        Analise a qualidade dos leads.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
    </SkeletonTransition>
  </>
  );
}
