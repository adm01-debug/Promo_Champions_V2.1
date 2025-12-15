import { useBIVendedor } from "@/hooks/useBIVendedor";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { VendedorDashboardLoadingSkeleton as BIVendedorLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
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
  Flame,
  Zap,
  Activity,
  Star,
  Calendar,
  Percent,
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--accent))"];

const STAGE_LABELS: Record<string, string> = {
  pending: "Lead",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação"
};

const BIVendedor = () => {
  const { salesperson } = useAuth();
  const { data, isLoading } = useBIVendedor();

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<BIVendedorLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="opacity-0 animate-fade-in-up">
            <div className="glass rounded-2xl p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/30 shadow-xl">
                    <AvatarImage src={salesperson?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl font-bold">
                      {salesperson?.name?.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {data && data.goalProgress >= 100 && (
                    <div className="absolute -top-1 -right-1 p-1.5 bg-success rounded-full shadow-lg">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-black">Meu BI</h1>
                  <p className="text-muted-foreground">{salesperson?.name} • {currentMonth}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {data?.commissionRate}% comissão
                    </Badge>
                    {data && data.currentRank <= 3 && (
                      <Badge className="bg-rank-gold/20 text-rank-gold border-rank-gold/30">
                        <Trophy className="h-3 w-3 mr-1" /> Top {data.currentRank}
                      </Badge>
                    )}
                    {data && data.currentStreak >= 3 && (
                      <Badge className="bg-warning/20 text-warning border-warning/30">
                        <Flame className="h-3 w-3 mr-1" /> {data.currentStreak} dias
                      </Badge>
                    )}
                  </div>
                </div>
                {/* Goal Progress Circle */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm text-muted-foreground">Progresso da Meta</span>
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="none"
                        stroke={data && data.goalProgress >= 100 ? "hsl(var(--success))" : "url(#gradientBI)"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.min(data?.goalProgress || 0, 100) * 3.02} 302`}
                      />
                      <defs>
                        <linearGradient id="gradientBI" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--secondary))" />
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
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { title: "Faturamento", value: formatCurrency(data?.totalRevenue || 0), icon: DollarSign, change: data?.revenueChange, variant: "primary" },
              { title: "Meta", value: formatCurrency(data?.currentGoal || 0), icon: Target },
              { title: "Comissão", value: formatCurrency(data?.commission || 0), icon: TrendingUp, variant: "success" },
              { title: "Pipeline", value: formatCurrency(data?.pipelineValue || 0), icon: ShoppingBag },
              { title: "Conversão", value: `${(data?.conversionRate || 0).toFixed(1)}%`, icon: Percent },
              { title: "Ranking", value: `#${data?.currentRank || "-"}`, icon: Trophy, variant: data && data.currentRank <= 3 ? "gold" : "default" }
            ].map((stat, index) => (
              <div key={stat.title} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${100 + index * 50}ms` }}>
                <Card className={cn(
                  "glass hover-lift",
                  stat.variant === "primary" && "border-primary/30 bg-primary/5",
                  stat.variant === "success" && "border-success/30 bg-success/5",
                  stat.variant === "gold" && "border-rank-gold/30 bg-rank-gold/5"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "p-2 rounded-lg",
                        stat.variant === "primary" ? "gradient-primary" :
                        stat.variant === "success" ? "bg-success/20" :
                        stat.variant === "gold" ? "bg-rank-gold/20" : "bg-muted"
                      )}>
                        <stat.icon className={cn(
                          "h-4 w-4",
                          stat.variant ? "text-white" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className="text-xs text-muted-foreground">{stat.title}</span>
                    </div>
                    <p className={cn(
                      "text-lg font-bold",
                      stat.variant === "primary" && "gradient-text"
                    )}>{stat.value}</p>
                    {stat.change !== undefined && (
                      <span className={cn(
                        "text-xs",
                        stat.change > 0 ? "text-success" : stat.change < 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {stat.change > 0 && "+"}{stat.change.toFixed(1)}% vs mês anterior
                      </span>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Daily Target Alert */}
          {data && data.dailyRequired > 0 && data.goalProgress < 100 && (
            <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4 border border-warning/30 bg-warning/5" style={{ animationDelay: "350ms" }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Calendar className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Para bater a meta</p>
                  <p className="text-sm text-muted-foreground">
                    Faltam <span className="font-bold text-warning">{data.daysRemaining} dias</span> • 
                    Você precisa vender <span className="font-bold text-warning">{formatCurrency(data.dailyRequired)}/dia</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <Card className="lg:col-span-2 glass opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Vendas do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.salesByDay && data.salesByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.salesByDay}>
                      <defs>
                        <linearGradient id="colorValueBI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Vendas"]}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValueBI)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Nenhuma venda este mês
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Pie */}
            <Card className="glass opacity-0 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
              <CardHeader>
                <CardTitle className="text-lg">Por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.salesByCategory && data.salesByCategory.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={data.salesByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                          {data.salesByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {data.salesByCategory.map((cat, idx) => (
                        <div key={cat.category} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="flex-1 truncate">{cat.category}</span>
                          <span className="font-medium">{formatCurrency(cat.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-muted-foreground">Sem dados</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pipeline & Activities Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline by Stage */}
            <Card className="glass opacity-0 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Pipeline por Estágio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.dealsByStage.map((stage, idx) => (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{STAGE_LABELS[stage.stage] || stage.stage}</span>
                        <span className="font-medium">{stage.count} deals • {formatCurrency(stage.value)}</span>
                      </div>
                      <Progress value={stage.count > 0 ? (stage.value / (data?.pipelineValue || 1)) * 100 : 0} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Média no pipeline</span>
                  </div>
                  <span className="font-bold">{(data?.avgDaysInPipeline || 0).toFixed(0)} dias</span>
                </div>
              </CardContent>
            </Card>

            {/* Activities & Streak */}
            <Card className="glass opacity-0 animate-fade-in-up" style={{ animationDelay: "550ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Atividades & Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold gradient-text">{data?.totalActivities || 0}</p>
                    <p className="text-xs text-muted-foreground">Atividades (30d)</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-success">{data?.totalAchievements || 0}</p>
                    <p className="text-xs text-muted-foreground">Conquistas</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-warning" />
                      <span className="font-medium">Sequência Atual</span>
                    </div>
                    <span className="text-xl font-bold text-warning">{data?.currentStreak || 0} dias</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="font-medium">Recorde Pessoal</span>
                    </div>
                    <span className="text-xl font-bold text-primary">{data?.bestStreak || 0} dias</span>
                  </div>
                </div>
                {data?.activitiesByType && data.activitiesByType.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Por tipo</p>
                    <div className="flex flex-wrap gap-2">
                      {data.activitiesByType.map(a => (
                        <Badge key={a.type} variant="secondary">{a.type}: {a.count}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SkeletonTransition>
  );
};

export default BIVendedor;
