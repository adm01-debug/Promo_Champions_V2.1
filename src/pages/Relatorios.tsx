import { useState, useMemo } from "react";
import { BarChart3, Download, Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
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

// Full dataset for filtering
const allRevenueData = [
  { date: new Date(2024, 6, 15), mes: "Jul", receita: 45000, meta: 50000 },
  { date: new Date(2024, 7, 15), mes: "Ago", receita: 52000, meta: 55000 },
  { date: new Date(2024, 8, 15), mes: "Set", receita: 61000, meta: 60000 },
  { date: new Date(2024, 9, 15), mes: "Out", receita: 58000, meta: 65000 },
  { date: new Date(2024, 10, 15), mes: "Nov", receita: 72000, meta: 70000 },
  { date: new Date(2024, 11, 15), mes: "Dez", receita: 85000, meta: 80000 },
];

const allCategoryData: Record<string, { name: string; value: number; color: string }[]> = {
  "7d": [
    { name: "Assinaturas", value: 40, color: "hsl(24, 100%, 55%)" },
    { name: "Serviços", value: 35, color: "hsl(280, 80%, 60%)" },
    { name: "Projetos", value: 18, color: "hsl(340, 80%, 55%)" },
    { name: "Outros", value: 7, color: "hsl(142, 76%, 45%)" },
  ],
  "30d": [
    { name: "Assinaturas", value: 45, color: "hsl(24, 100%, 55%)" },
    { name: "Serviços", value: 30, color: "hsl(280, 80%, 60%)" },
    { name: "Projetos", value: 15, color: "hsl(340, 80%, 55%)" },
    { name: "Outros", value: 10, color: "hsl(142, 76%, 45%)" },
  ],
  "90d": [
    { name: "Assinaturas", value: 48, color: "hsl(24, 100%, 55%)" },
    { name: "Serviços", value: 28, color: "hsl(280, 80%, 60%)" },
    { name: "Projetos", value: 14, color: "hsl(340, 80%, 55%)" },
    { name: "Outros", value: 10, color: "hsl(142, 76%, 45%)" },
  ],
  "custom": [
    { name: "Assinaturas", value: 42, color: "hsl(24, 100%, 55%)" },
    { name: "Serviços", value: 32, color: "hsl(280, 80%, 60%)" },
    { name: "Projetos", value: 16, color: "hsl(340, 80%, 55%)" },
    { name: "Outros", value: 10, color: "hsl(142, 76%, 45%)" },
  ],
};

const allWeeklyData: Record<string, { dia: string; vendas: number }[]> = {
  "7d": [
    { dia: "Seg", vendas: 12 },
    { dia: "Ter", vendas: 19 },
    { dia: "Qua", vendas: 15 },
    { dia: "Qui", vendas: 22 },
    { dia: "Sex", vendas: 28 },
    { dia: "Sáb", vendas: 18 },
    { dia: "Dom", vendas: 8 },
  ],
  "30d": [
    { dia: "Sem 1", vendas: 85 },
    { dia: "Sem 2", vendas: 102 },
    { dia: "Sem 3", vendas: 95 },
    { dia: "Sem 4", vendas: 118 },
  ],
  "90d": [
    { dia: "Out", vendas: 312 },
    { dia: "Nov", vendas: 358 },
    { dia: "Dez", vendas: 402 },
  ],
  "custom": [
    { dia: "Período 1", vendas: 145 },
    { dia: "Período 2", vendas: 178 },
    { dia: "Período 3", vendas: 162 },
  ],
};

const metricsPerPeriod: Record<string, { title: string; value: string; change: number; icon: any; positive: boolean }[]> = {
  "7d": [
    { title: "Receita Total", value: "R$ 127.500", change: 8.2, icon: DollarSign, positive: true },
    { title: "Novos Clientes", value: "23", change: 5.1, icon: Users, positive: true },
    { title: "Taxa de Conversão", value: "11.8%", change: -1.5, icon: TrendingDown, positive: false },
    { title: "Ticket Médio", value: "R$ 2.450", change: 3.2, icon: TrendingUp, positive: true },
  ],
  "30d": [
    { title: "Receita Total", value: "R$ 547.250", change: 12.5, icon: DollarSign, positive: true },
    { title: "Novos Clientes", value: "89", change: 8.3, icon: Users, positive: true },
    { title: "Taxa de Conversão", value: "12.6%", change: -2.1, icon: TrendingDown, positive: false },
    { title: "Ticket Médio", value: "R$ 2.716", change: 15.7, icon: TrendingUp, positive: true },
  ],
  "90d": [
    { title: "Receita Total", value: "R$ 1.847.250", change: 18.3, icon: DollarSign, positive: true },
    { title: "Novos Clientes", value: "267", change: 12.1, icon: Users, positive: true },
    { title: "Taxa de Conversão", value: "13.2%", change: 2.4, icon: TrendingUp, positive: true },
    { title: "Ticket Médio", value: "R$ 2.890", change: 9.8, icon: TrendingUp, positive: true },
  ],
  "custom": [
    { title: "Receita Total", value: "R$ 425.800", change: 6.7, icon: DollarSign, positive: true },
    { title: "Novos Clientes", value: "52", change: 4.2, icon: Users, positive: true },
    { title: "Taxa de Conversão", value: "12.1%", change: 0.8, icon: TrendingUp, positive: true },
    { title: "Ticket Médio", value: "R$ 2.650", change: 5.5, icon: TrendingUp, positive: true },
  ],
};

const reportsData = [
  { nome: "Relatório de Vendas Mensal", tipo: "Vendas", data: "Dezembro 2024", formato: "PDF" },
  { nome: "Análise de Clientes", tipo: "Clientes", data: "Dezembro 2024", formato: "Excel" },
  { nome: "Performance de Produtos", tipo: "Produtos", data: "Dezembro 2024", formato: "PDF" },
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

  const periodKey = selectedPeriod === "custom" ? "custom" : selectedPeriod;

  const filteredRevenueData = useMemo(() => {
    if (selectedPeriod === "7d") {
      return allRevenueData.slice(-2);
    } else if (selectedPeriod === "30d") {
      return allRevenueData.slice(-3);
    } else if (selectedPeriod === "90d") {
      return allRevenueData.slice(-4);
    } else if (dateRange.from && dateRange.to) {
      return allRevenueData.filter(item => 
        isWithinInterval(item.date, { start: dateRange.from!, end: dateRange.to! })
      );
    }
    return allRevenueData;
  }, [selectedPeriod, dateRange]);

  const categoryData = allCategoryData[periodKey] || allCategoryData["30d"];
  const weeklyData = allWeeklyData[periodKey] || allWeeklyData["30d"];
  const metricsData = metricsPerPeriod[periodKey] || metricsPerPeriod["30d"];

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

  return (
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
              <p className="text-sm text-muted-foreground">Análises e métricas do negócio</p>
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
              className="opacity-0 animate-fade-in-up glass rounded-xl p-5"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className={`text-sm font-medium flex items-center gap-1 ${metric.positive ? 'text-success' : 'text-destructive'}`}>
                  {metric.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(metric.change)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredRevenueData}>
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
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "350ms" }}>
            <h3 className="text-lg font-semibold mb-1">Vendas por Categoria</h3>
            <p className="text-sm text-muted-foreground mb-6">Distribuição de receita</p>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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
                {categoryData.map((item, index) => (
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
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
                      <span className="text-xs text-muted-foreground">{report.data}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted/50">{report.formato}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="glass">
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
  );
};

export default Relatorios;
