import { useAuth } from "@/contexts/AuthContext";
import { useBIFilters } from "@/hooks/useBIFilters";
import { useBICloser } from "@/hooks/useBICloser";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { VendedorDashboardLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { PageTransition, StaggeredContainer } from "@/components/transitions/PageTransition";
import { 
  BIFilterBar, 
  BIMetricCard, 
  BIMetricsGrid, 
  BIProjectionCard,
  BIComparisonCard,
  BIClientList,
  BIPurchaseHistory
} from "@/components/bi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Target,
  TrendingUp,
  ShoppingBag,
  Clock,
  Trophy,
  Percent,
  Briefcase,
  CheckCircle,
  XCircle,
  Sparkles,
  Star,
  Award
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const STAGE_LABELS: Record<string, string> = {
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação"
};

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

const BICloser = () => {
  const { salesperson } = useAuth();
  const filters = useBIFilters("this_month");
  const { data, isLoading, refetch } = useBICloser({ 
    dateRange: filters.dateRange 
  });

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<VendedorDashboardLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-primary/30 shadow-xl hover-scale">
                      <AvatarImage src={salesperson?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xl font-bold">
                        {salesperson?.name?.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {data && data.goalProgress >= 100 && (
                      <div className="absolute -top-1 -right-1 p-1.5 bg-success rounded-full shadow-lg animate-bounce-in">
                        <Star className="h-4 w-4 text-success-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-display flex items-center justify-center md:justify-start gap-2">
                      <Sparkles className="h-6 w-6 text-primary" />
                      <span className="gradient-text">BI Closer</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">{salesperson?.name} • {filters.periodLabel}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {data?.commissionRate || 10}% comissão
                      </Badge>
                      {data && data.currentRank <= 3 && (
                        <Badge className="rank-gold text-rank-gold-foreground animate-pulse-glow">
                          <Trophy className="h-3 w-3 mr-1" /> Top {data.currentRank}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Goal Progress Circle */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm text-muted-foreground font-medium">Progresso da Meta</span>
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          fill="none"
                          stroke={data && data.goalProgress >= 100 ? "hsl(var(--success))" : "url(#gradientCloser)"}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${Math.min(data?.goalProgress || 0, 100) * 3.02} 302`}
                        />
                        <defs>
                          <linearGradient id="gradientCloser" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn(
                          "text-xl font-black",
                          data && data.goalProgress >= 100 ? "text-success" : "gradient-text"
                        )}>
                          {(data?.goalProgress || 0).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <BIFilterBar
              period={filters.period}
              onPeriodChange={filters.setPeriod}
              customRange={filters.customRange}
              onCustomRangeChange={filters.setCustomRange}
              onReset={filters.resetFilters}
              hasActiveFilters={filters.hasActiveFilters}
              isLoading={isLoading}
              onRefresh={() => refetch()}
            />

            {/* KPI Metrics */}
            <StaggeredContainer delay={0.1}>
              <BIMetricsGrid cols={6}>
                <BIMetricCard
                  title="Faturamento"
                  value={data?.totalRevenue || 0}
                  icon={DollarSign}
                  variant="primary"
                  format="currency"
                  comparison={{
                    previousPeriod: { 
                      value: data?.previousPeriod.revenue || 0, 
                      label: "Período Anterior" 
                    },
                    lastYear: { 
                      value: data?.sameLastYear.revenue || 0, 
                      label: "Mesmo Período Ano Anterior" 
                    },
                    goal: {
                      value: data?.revenueGoal || 0,
                      label: "Meta"
                    }
                  }}
                  delay={0}
                />
                <BIMetricCard
                  title="Meta"
                  value={data?.revenueGoal || 0}
                  icon={Target}
                  format="currency"
                  delay={1}
                />
                <BIMetricCard
                  title="Comissão"
                  value={data?.commission || 0}
                  icon={Award}
                  variant="success"
                  format="currency"
                  delay={2}
                />
                <BIMetricCard
                  title="Ticket Médio"
                  value={data?.avgTicket || 0}
                  icon={ShoppingBag}
                  format="currency"
                  comparison={{
                    previousPeriod: { 
                      value: data?.previousPeriod.avgTicket || 0, 
                      label: "Período Anterior" 
                    }
                  }}
                  delay={3}
                />
                <BIMetricCard
                  title="Conversão"
                  value={data?.conversionRate || 0}
                  icon={Percent}
                  format="percent"
                  comparison={{
                    previousPeriod: { 
                      value: data?.previousPeriod.conversionRate || 0, 
                      label: "Período Anterior" 
                    }
                  }}
                  delay={4}
                />
                <BIMetricCard
                  title="Ranking"
                  value={`#${data?.currentRank || "-"}`}
                  icon={Trophy}
                  variant={data && data.currentRank <= 3 ? "success" : "default"}
                  subtitle={`de ${data?.totalClosers || 0} Closers`}
                  delay={5}
                />
              </BIMetricsGrid>
            </StaggeredContainer>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-success/15">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data?.wonDeals || 0}</p>
                    <p className="text-xs text-muted-foreground">Ganhos</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-destructive/15">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data?.lostDeals || 0}</p>
                    <p className="text-xs text-muted-foreground">Perdidos</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/15">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{(data?.winRate || 0).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-warning/15">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{(data?.avgDaysToClose || 0).toFixed(0)}d</p>
                    <p className="text-xs text-muted-foreground">Tempo p/ Fechar</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projection & Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BIProjectionCard
                title="Projeção de Faturamento"
                currentValue={data?.totalRevenue || 0}
                projectedValue={data?.projectedRevenue || 0}
                goalValue={data?.revenueGoal || 0}
                daysRemaining={data?.daysRemaining || 0}
                dailyRequired={data?.dailyRevenueNeeded || 0}
                format="currency"
              />
              
              {/* Pipeline Card */}
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
                          <span className="text-muted-foreground">
                            {stage.count} • {formatCurrency(stage.value)} ({(stage.probability * 100).toFixed(0)}%)
                          </span>
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
              <BIComparisonCard
                title="Faturamento"
                currentValue={data?.totalRevenue || 0}
                previousValue={data?.previousPeriod.revenue || 0}
                lastYearValue={data?.sameLastYear.revenue || 0}
                format="currency"
              />
              <BIComparisonCard
                title="Deals Fechados"
                currentValue={data?.completedDeals || 0}
                previousValue={data?.previousPeriod.deals || 0}
                lastYearValue={data?.sameLastYear.deals || 0}
                format="number"
              />
              <BIComparisonCard
                title="Taxa de Conversão"
                currentValue={data?.conversionRate || 0}
                previousValue={data?.previousPeriod.conversionRate || 0}
                lastYearValue={data?.sameLastYear.conversionRate || 0}
                format="percent"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Day */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
                      <TrendingUp className="h-4 w-4 text-primary-foreground" />
                    </div>
                    Faturamento por Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.revenueByDay && data.revenueByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={data.revenueByDay}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px"
                          }}
                          formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
                        />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma venda no período</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Deals by Category */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.dealsByCategory && data.dealsByCategory.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={data.dealsByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {data.dealsByCategory.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [formatCurrency(value)]}
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "12px"
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {data.dealsByCategory.map((cat, idx) => (
                          <div key={cat.category} className="flex items-center gap-2 text-sm hover-scale-sm cursor-default">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="truncate">{cat.category}</span>
                            <span className="ml-auto font-bold">{formatCurrency(cat.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-muted-foreground">
                      Sem dados
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trend */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display">Evolução Mensal (Histórico)</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.revenueByMonth && data.revenueByMonth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px"
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Sem dados históricos
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BIClientList
                title="Top Clientes por Valor"
                clients={data?.topClients?.map(c => ({
                  name: c.name,
                  company: c.company,
                  totalValue: c.totalValue,
                  dealsCount: c.dealsCount,
                  avgTicket: c.avgTicket
                })) || []}
                type="top-value"
                maxItems={10}
              />
              <BIClientList
                title="Maior Ticket Médio"
                clients={data?.highestTicketClients?.map(c => ({
                  name: c.name,
                  totalValue: 0,
                  avgTicket: c.avgTicket,
                  dealsCount: c.totalPurchases
                })) || []}
                type="top-ticket"
                maxItems={10}
              />
            </div>

            {/* Purchase History */}
            {data?.clientPurchaseHistory && data.clientPurchaseHistory.length > 0 && (
              <BIPurchaseHistory data={data.clientPurchaseHistory} />
            )}
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  );
};

export default BICloser;
