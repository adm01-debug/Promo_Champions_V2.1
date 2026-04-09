import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { BarChart3, Download, Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useReportMetrics } from "@/hooks/useReportData";
import { RelatoriosLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { downloadSalesReport, downloadClientsReport, downloadProductsReport } from "@/utils/reportDownload";
import { toast } from "sonner";
import { ReportCharts } from "@/components/reports/ReportCharts";
import { PageTransition } from "@/components/ui/page-transition";

type DateRange = { from: Date | undefined; to: Date | undefined };

const reportsData = [
  { nome: "Relatório de Vendas", tipo: "Vendas", formato: "CSV", action: "sales" },
  { nome: "Análise de Clientes", tipo: "Clientes", formato: "CSV", action: "clients" },
  { nome: "Performance de Produtos", tipo: "Produtos", formato: "CSV", action: "products" },
];

const Relatorios = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30d");
  const [dateRange, setDateRange] = useState<DateRange>({ from: subDays(new Date(), 30), to: new Date() });
  const { metrics, revenueData, categoryData, salesData, isLoading } = useReportMetrics(dateRange);

  const handlePeriodClick = (period: string) => {
    setSelectedPeriod(period);
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
    if (daysMap[period]) setDateRange({ from: subDays(new Date(), daysMap[period]), to: new Date() });
  };

  const metricsData = [
    { title: "Receita Total", value: `R$ ${metrics.totalRevenue.toLocaleString("pt-BR")}`, change: metrics.revenueChange, icon: DollarSign, positive: metrics.revenueChange > 0 },
    { title: "Novos Clientes", value: metrics.newClients.toString(), change: metrics.clientsChange, icon: Users, positive: metrics.clientsChange > 0 },
    { title: "Taxa de Conversão", value: `${metrics.conversionRate.toFixed(1)}%`, change: metrics.conversionChange, icon: metrics.conversionChange >= 0 ? TrendingUp : TrendingDown, positive: metrics.conversionChange >= 0 },
    { title: "Ticket Médio", value: `R$ ${metrics.avgTicket.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`, change: metrics.ticketChange, icon: TrendingUp, positive: metrics.ticketChange > 0 },
  ];

  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Relatórios | Promo Champions</title>
        <meta name="description" content="Relatórios de vendas e performance" />
      </Helmet>
    <SkeletonTransition isLoading={isLoading} skeleton={<RelatoriosLoadingSkeleton />} duration={400}>
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Header */}
          <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl gradient-primary"><BarChart3 className="h-6 w-6 text-primary-foreground" /></div>
              <div>
                <h1 className="text-page-title gradient-text">Relatórios</h1>
                <p className="text-sm text-muted-foreground">Análises e métricas do negócio{isLoading && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}</p>
              </div>
            </div>
          </div>

          {/* Period Filters */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4" style={{ animationDelay: "50ms" }}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {[{ key: "7d", label: "7 dias" }, { key: "30d", label: "30 dias" }, { key: "90d", label: "90 dias" }].map((period) => (
                  <Button key={period.key} variant={selectedPeriod === period.key ? "default" : "outline"} size="sm" onClick={() => handlePeriodClick(period.key)} className={cn(selectedPeriod === period.key ? "gradient-primary text-primary-foreground" : "glass hover:bg-muted/50")}>{period.label}</Button>
                ))}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", selectedPeriod === "custom" ? "gradient-primary text-primary-foreground" : "glass", !dateRange.from && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (dateRange.to ? <>{format(dateRange.from, "dd MMM", { locale: ptBR })} - {format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}</> : format(dateRange.from, "dd MMM yyyy", { locale: ptBR })) : <span>Período personalizado</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="end">
                  <Calendar initialFocus mode="range" defaultMonth={dateRange.from} selected={dateRange} onSelect={(range) => { setDateRange({ from: range?.from, to: range?.to }); if (range?.from && range?.to) setSelectedPeriod("custom"); }} numberOfMonths={2} locale={ptBR} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            {dateRange.from && dateRange.to && (
              <p className="text-xs text-muted-foreground mt-3">Exibindo dados de {format(dateRange.from, "dd 'de' MMMM", { locale: ptBR })} até {format(dateRange.to, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricsData.map((metric, index) => (
              <div key={metric.title} className="opacity-0 animate-fade-in-up glass rounded-xl p-5 border border-border/40 dark:border-glow hover-lift cursor-pointer group" style={{ animationDelay: `${100 + index * 50}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${index === 0 ? 'gradient-primary' : 'bg-muted/50 group-hover:bg-muted/80'} transition-colors`}>
                    <metric.icon className={`h-4 w-4 ${index === 0 ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'} transition-colors`} />
                  </div>
                  <span className={`text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-full ${metric.positive ? 'bg-status-success/20 text-status-success' : 'bg-status-error/20 text-status-error'}`}>
                    {metric.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{Math.abs(metric.change)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{metric.title}</p>
                <p className={`text-2xl font-bold ${index === 0 ? 'gradient-text' : ''}`}>{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <ReportCharts revenueData={revenueData} categoryData={categoryData} salesData={salesData} selectedPeriod={selectedPeriod} />

          {/* Reports List */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl" style={{ animationDelay: "450ms" }}>
            <div className="p-5 border-b border-border/50">
              <h2 className="text-lg font-semibold">Relatórios Disponíveis</h2>
              <p className="text-sm text-muted-foreground">Baixe relatórios detalhados</p>
            </div>
            <div className="divide-y divide-border/30">
              {reportsData.map((report, index) => (
                <div key={index} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium">{report.nome}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{report.tipo}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted/50">{report.formato}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="glass" onClick={async () => {
                    try {
                      if (report.action === "sales") await downloadSalesReport(selectedPeriod);
                      else if (report.action === "clients") await downloadClientsReport();
                      else if (report.action === "products") await downloadProductsReport();
                      toast.success("Relatório baixado com sucesso!");
                    } catch { toast.error("Erro ao baixar relatório"); }
                  }}>
                    <Download className="h-4 w-4 mr-2" />Baixar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonTransition>
    </>
    </PageTransition>
  );
};

export default Relatorios;
