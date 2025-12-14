import { useState } from "react";
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
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

const reportsData = [
  { nome: "Relatório de Vendas", tipo: "Vendas", formato: "CSV", action: "sales" },
  { nome: "Análise de Clientes", tipo: "Clientes", formato: "CSV", action: "clients" },
  { nome: "Performance de Produtos", tipo: "Produtos", formato: "CSV", action: "products" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-border/50">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? `R$ ${entry.value.toLocaleString("pt-BR")}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Relatorios = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30d");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { metrics, revenueData, categoryData, salesData, isLoading } = useReportMetrics(dateRange);

  const handlePeriodClick = (period: string) => {
    setSelectedPeriod(period);
    if (period === "7d") {
      setDateRange({ from: subDays(new Date(), 7), to: new Date() });
    } else if (period === "30d") {
      setDateRange({ from: subDays(new Date(), 30), to: new Date() });
    } else if (period === "90d") {
      setDateRange({ from: subDays(new Date(), 90), to: new Date() });
    }
  };

  const metricsData = [
    { 
      title: "Receita Total", 
      value: `R$ ${metrics.totalRevenue.toLocaleString("pt-BR")}`, 
      change: metrics.revenueChange, 
      icon: DollarSign, 
      positive: metrics.revenueChange > 0 
    },
    { 
      title: "Novos Clientes", 
      value: metrics.newClients.toString(), 
      change: metrics.clientsChange, 
      icon: Users, 
      positive: metrics.clientsChange > 0 
    },
    { 
      title: "Taxa de Conversão", 
      value: `${metrics.conversionRate.toFixed(1)}%`, 
      change: metrics.conversionChange, 
      icon: metrics.conversionChange >= 0 ? TrendingUp : TrendingDown, 
      positive: metrics.conversionChange >= 0 
    },
    { 
      title: "Ticket Médio", 
      value: `R$ ${metrics.avgTicket.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`, 
      change: metrics.ticketChange, 
      icon: TrendingUp, 
      positive: metrics.ticketChange > 0 
    },
  ];

  // Use real data - no fallbacks
  const displayRevenueData = revenueData;
  const displayCategoryData = categoryData;
  const displaySalesData = salesData;

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<RelatoriosLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Relatórios</h1>
              <p className="text-sm text-muted-foreground">
                Análises e métricas do negócio
                {isLoading && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
              </p>
            </div>
          </div>
        </div>

        {/* Period Filters */}
        <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4" style={{ animationDelay: "50ms" }}>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "7d", label: "7 dias" },
                { key: "30d", label: "30 dias" },
                { key: "90d", label: "90 dias" },
              ].map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePeriodClick(period.key)}
                  className={cn(
                    selectedPeriod === period.key 
                      ? "gradient-primary text-white" 
                      : "glass hover:bg-muted/50"
                  )}
                >
                  {period.label}
                </Button>
              ))}
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "justify-start text-left font-normal",
                    selectedPeriod === "custom" ? "gradient-primary text-white" : "glass",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy", { locale: ptBR })
                    )
                  ) : (
                    <span>Período personalizado</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange({ from: range?.from, to: range?.to });
                    if (range?.from && range?.to) {
                      setSelectedPeriod("custom");
                    }
                  }}
                  numberOfMonths={2}
                  locale={ptBR}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {dateRange.from && dateRange.to && (
            <p className="text-xs text-muted-foreground mt-3">
              Exibindo dados de {format(dateRange.from, "dd 'de' MMMM", { locale: ptBR })} até {format(dateRange.to, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsData.map((metric, index) => (
            <div 
              key={metric.title}
              className="opacity-0 animate-fade-in-up glass rounded-xl p-5 border border-border/40 dark:border-glow hover-lift cursor-pointer group"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${index === 0 ? 'gradient-primary' : 'bg-muted/50 group-hover:bg-muted/80'} transition-colors`}>
                  <metric.icon className={`h-4 w-4 ${index === 0 ? 'text-white' : 'text-muted-foreground group-hover:text-primary'} transition-colors`} />
                </div>
                <span className={`text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-full ${metric.positive ? 'bg-status-success/20 text-status-success' : 'bg-status-error/20 text-status-error'}`}>
                  {metric.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(metric.change)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{metric.title}</p>
              <p className={`text-2xl font-bold ${index === 0 ? 'gradient-text' : ''}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "300ms" }}>
            <h3 className="text-lg font-semibold mb-1">Evolução de Receita</h3>
            <p className="text-sm text-muted-foreground mb-6">Receita vs Meta mensal</p>
            <div className="h-[280px]">
              {displayRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayRevenueData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(24, 100%, 55%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(24, 100%, 55%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                    <XAxis dataKey="mes" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="receita" 
                      stroke="hsl(24, 100%, 55%)" 
                      strokeWidth={2}
                      fill="url(#colorReceita)" 
                      name="Receita"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="meta" 
                      stroke="hsl(280, 80%, 60%)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#colorMeta)" 
                      name="Meta"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">Nenhum dado de receita disponível</p>
                  <p className="text-xs">Configure métricas diárias para ver a evolução</p>
                </div>
              )}
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "350ms" }}>
            <h3 className="text-lg font-semibold mb-1">Vendas por Categoria</h3>
            <p className="text-sm text-muted-foreground mb-6">Distribuição de receita</p>
            <div className="h-[280px] flex items-center">
              {displayCategoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {displayCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${value}%`}
                        contentStyle={{ 
                          background: 'hsl(222, 47%, 8%)', 
                          border: '1px solid hsl(222, 30%, 16%)',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {displayCategoryData.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1">
                          <p className="text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.value}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                  <DollarSign className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma categoria registrada</p>
                  <p className="text-xs">Configure métricas de categoria para ver a distribuição</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Bar Chart */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "400ms" }}>
            <h3 className="text-lg font-semibold mb-1">Vendas por Período</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {selectedPeriod === "7d" ? "Últimos 7 dias" : 
               selectedPeriod === "30d" ? "Últimas 4 semanas" : 
               selectedPeriod === "90d" ? "Últimos 3 meses" : "Período selecionado"}
            </p>
            <div className="h-[280px]">
              {displaySalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displaySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                    <XAxis dataKey="dia" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <Tooltip 
                      formatter={(value) => [`${value} vendas`, 'Vendas']}
                      contentStyle={{ 
                        background: 'hsl(222, 47%, 8%)', 
                        border: '1px solid hsl(222, 30%, 16%)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="vendas" 
                      fill="url(#barGradient)" 
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(24, 100%, 55%)" />
                        <stop offset="100%" stopColor="hsl(280, 80%, 60%)" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Users className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma venda no período</p>
                  <p className="text-xs">Registre vendas para ver a distribuição por período</p>
                </div>
              )}
            </div>
          </div>

          {/* Reports List */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl" style={{ animationDelay: "450ms" }}>
            <div className="p-5 border-b border-border/50">
              <h2 className="text-lg font-semibold">Relatórios Disponíveis</h2>
              <p className="text-sm text-muted-foreground">Baixe relatórios detalhados</p>
            </div>
            <div className="divide-y divide-border/30">
              {reportsData.map((report, index) => (
                <div 
                  key={index}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{report.nome}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{report.tipo}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted/50">{report.formato}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="glass"
                    onClick={async () => {
                      try {
                        if (report.action === "sales") await downloadSalesReport(selectedPeriod);
                        else if (report.action === "clients") await downloadClientsReport();
                        else if (report.action === "products") await downloadProductsReport();
                        toast.success("Relatório baixado com sucesso!");
                      } catch (error) {
                        toast.error("Erro ao baixar relatório");
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </SkeletonTransition>
  );
};

export default Relatorios;
