import { useBIGestor } from "@/hooks/useBIGestor";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { AnalyticsLoadingSkeleton as BIGestorLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  Trophy,
  Clock,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  TrendingDown,
  Briefcase
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--accent))"];
const ABC_COLORS = { A: "hsl(var(--success))", B: "hsl(var(--warning))", C: "hsl(var(--destructive))" };

const STAGE_LABELS: Record<string, string> = {
  pending: "Lead",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação"
};

const BIGestor = () => {
  const { data, isLoading } = useBIGestor();

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<BIGestorLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="opacity-0 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black gradient-text">BI Gestão</h1>
                <p className="text-muted-foreground">{currentMonth} • Visão consolidada do time</p>
              </div>
              <div className="flex items-center gap-2">
                {data && data.stagnantDeals > 0 && (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    <AlertTriangle className="h-3 w-3 mr-1" /> {data.stagnantDeals} deals estagnados
                  </Badge>
                )}
                {data && data.missedGoals > 0 && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    <TrendingDown className="h-3 w-3 mr-1" /> {data.missedGoals} abaixo da meta
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Team KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { title: "Faturamento Time", value: formatCurrency(data?.totalTeamRevenue || 0), icon: DollarSign, change: data?.teamRevenueChange, variant: "primary" },
              { title: "Meta Time", value: formatCurrency(data?.totalTeamGoal || 0), icon: Target, progress: data?.teamGoalProgress },
              { title: "Pipeline Total", value: formatCurrency(data?.totalPipelineValue || 0), icon: Briefcase },
              { title: "Forecast Ponderado", value: formatCurrency(data?.weightedForecast || 0), icon: TrendingUp, variant: "success" },
              { title: "Vendedores Ativos", value: String(data?.activeSalespeople || 0), icon: Users },
              { title: "Performance Média", value: `${(data?.avgPerformance || 0).toFixed(0)}%`, icon: BarChart3 }
            ].map((stat, index) => (
              <div key={stat.title} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${100 + index * 50}ms` }}>
                <Card className={cn(
                  "glass hover-lift",
                  stat.variant === "primary" && "border-primary/30 bg-primary/5",
                  stat.variant === "success" && "border-success/30 bg-success/5"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "p-2 rounded-lg",
                        stat.variant === "primary" ? "gradient-primary" :
                        stat.variant === "success" ? "bg-success/20" : "bg-muted"
                      )}>
                        <stat.icon className={cn("h-4 w-4", stat.variant ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{stat.title}</span>
                    </div>
                    <p className={cn("text-lg font-bold", stat.variant === "primary" && "gradient-text")}>{stat.value}</p>
                    {stat.change !== undefined && (
                      <span className={cn("text-xs", stat.change > 0 ? "text-success" : stat.change < 0 ? "text-destructive" : "text-muted-foreground")}>
                        {stat.change > 0 && "+"}{stat.change.toFixed(1)}% vs mês anterior
                      </span>
                    )}
                    {stat.progress !== undefined && (
                      <div className="mt-2">
                        <Progress value={Math.min(stat.progress, 100)} className="h-1.5" />
                        <span className="text-xs text-muted-foreground">{stat.progress.toFixed(0)}% da meta</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend */}
            <Card className="lg:col-span-2 glass opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Evolução de Receita (6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.revenueByMonth && data.revenueByMonth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.revenueByMonth}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(value: number) => [formatCurrency(value), "Receita"]}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">Sem dados</div>
                )}
              </CardContent>
            </Card>

            {/* ABC Analysis */}
            <Card className="glass opacity-0 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieIcon className="h-5 w-5 text-primary" />
                  Análise ABC
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.abcClients && data.abcClients.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={data.abcClients} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="revenue">
                          {data.abcClients.map((entry) => (
                            <Cell key={entry.classification} fill={ABC_COLORS[entry.classification as keyof typeof ABC_COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {data.abcClients.map(abc => (
                        <div key={abc.classification} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ABC_COLORS[abc.classification as keyof typeof ABC_COLORS] }} />
                          <span className="font-medium">Classe {abc.classification}</span>
                          <span className="text-muted-foreground">• {abc.count} vendedores</span>
                          <span className="ml-auto font-medium">{formatCurrency(abc.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[160px] flex items-center justify-center text-muted-foreground">Sem dados</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pipeline & Team Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Health */}
            <Card className="glass opacity-0 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Saúde do Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold">{data?.totalPipelineDeals || 0}</p>
                    <p className="text-xs text-muted-foreground">Deals</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-warning/10">
                    <p className="text-2xl font-bold text-warning">{data?.atRiskDeals || 0}</p>
                    <p className="text-xs text-muted-foreground">Em Risco</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold">{(data?.avgDaysInPipeline || 0).toFixed(0)}d</p>
                    <p className="text-xs text-muted-foreground">Média</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {data?.dealsByStage.map((stage) => (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{STAGE_LABELS[stage.stage] || stage.stage}</span>
                        <span className="font-medium">{stage.count} • {formatCurrency(stage.value)}</span>
                      </div>
                      <Progress value={stage.count > 0 ? (stage.value / (data?.totalPipelineValue || 1)) * 100 : 0} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deals by Source */}
            <Card className="glass opacity-0 animate-fade-in-up" style={{ animationDelay: "550ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Deals por Fonte
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.dealsBySource && data.dealsBySource.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.dealsBySource} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="source" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(value: number) => [formatCurrency(value), "Valor"]}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground">Sem dados</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team Ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card className="glass opacity-0 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-rank-gold" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.topPerformers && data.topPerformers.length > 0 ? (
                  <div className="space-y-3">
                    {data.topPerformers.map((sp, idx) => (
                      <div key={sp.id} className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        idx === 0 ? "bg-rank-gold/10 border border-rank-gold/30" : "bg-muted/30"
                      )}>
                        <span className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          idx === 0 ? "bg-rank-gold text-black" : idx === 1 ? "bg-rank-silver text-black" : idx === 2 ? "bg-rank-bronze text-white" : "bg-muted"
                        )}>
                          {idx + 1}
                        </span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={sp.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{sp.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{sp.name}</p>
                          <p className="text-xs text-muted-foreground">{sp.deals} vendas • {sp.goalProgress.toFixed(0)}% da meta</p>
                        </div>
                        <span className="font-bold text-success">{formatCurrency(sp.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">Nenhum vendedor atingiu 100% da meta</div>
                )}
              </CardContent>
            </Card>

            {/* Underperformers */}
            <Card className="glass opacity-0 animate-fade-in-up" style={{ animationDelay: "650ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Requerem Atenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.underperformers && data.underperformers.length > 0 ? (
                  <div className="space-y-3">
                    {data.underperformers.map(sp => (
                      <div key={sp.id} className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={sp.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{sp.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{sp.name}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={sp.goalProgress} className="h-1.5 flex-1" />
                            <span className="text-xs text-warning">{sp.goalProgress.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(sp.revenue)}</p>
                          <p className="text-xs text-muted-foreground">{sp.activities} atividades</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-center">
                    <div>
                      <Trophy className="h-8 w-8 text-success mx-auto mb-2" />
                      <p>Todos os vendedores estão no caminho!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full Team Table */}
          <Card className="glass opacity-0 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Performance Completa do Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-2">#</th>
                      <th className="text-left py-3 px-2">Vendedor</th>
                      <th className="text-right py-3 px-2">Receita</th>
                      <th className="text-right py-3 px-2">Deals</th>
                      <th className="text-right py-3 px-2">Conversão</th>
                      <th className="text-right py-3 px-2">Ticket Médio</th>
                      <th className="text-right py-3 px-2">Atividades</th>
                      <th className="text-right py-3 px-2">Meta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.salespeoplePerformance.map((sp, idx) => (
                      <tr key={sp.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2">
                          <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            idx === 0 ? "bg-rank-gold text-black" : idx === 1 ? "bg-rank-silver text-black" : idx === 2 ? "bg-rank-bronze text-white" : "bg-muted text-muted-foreground"
                          )}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={sp.avatar_url || undefined} />
                              <AvatarFallback className="text-[10px]">{sp.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{sp.name}</p>
                              <Badge variant="outline" className="text-[10px] px-1">{sp.role}</Badge>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-medium">{formatCurrency(sp.revenue)}</td>
                        <td className="py-3 px-2 text-right">{sp.deals}</td>
                        <td className="py-3 px-2 text-right">{sp.conversionRate.toFixed(1)}%</td>
                        <td className="py-3 px-2 text-right">{formatCurrency(sp.avgTicket)}</td>
                        <td className="py-3 px-2 text-right">{sp.activities}</td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={Math.min(sp.goalProgress, 100)} className="w-16 h-1.5" />
                            <span className={cn(
                              "text-xs font-medium",
                              sp.goalProgress >= 100 ? "text-success" : sp.goalProgress >= 80 ? "text-foreground" : "text-warning"
                            )}>
                              {sp.goalProgress.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SkeletonTransition>
  );
};

export default BIGestor;
