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
  Award,
  Sparkles
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
import { motion } from "framer-motion";
import { PageTransition, StaggeredContainer, MotionItem } from "@/components/transitions/PageTransition";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

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
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 relative overflow-hidden">
              {/* Background gradient effect */}
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
                    <span className="gradient-text">Meu BI</span>
                  </h1>
                  <p className="text-muted-foreground font-medium">{salesperson?.name} • {currentMonth}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover-scale-sm">
                      {data?.commissionRate}% comissão
                    </Badge>
                    {data && data.currentRank <= 3 && (
                      <Badge className="rank-gold text-rank-gold-foreground animate-pulse-glow">
                        <Trophy className="h-3 w-3 mr-1" /> Top {data.currentRank}
                      </Badge>
                    )}
                    {data && data.currentStreak >= 3 && (
                      <Badge className="bg-streak/20 text-streak border-streak/30 animate-streak-fire">
                        <Flame className="h-3 w-3 mr-1" /> {data.currentStreak} dias
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
                        stroke={data && data.goalProgress >= 100 ? "hsl(var(--success))" : "url(#gradientBI)"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.min(data?.goalProgress || 0, 100) * 3.02} 302`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="gradientBI" x1="0%" y1="0%" x2="100%" y2="0%">
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

            {/* KPI Stats */}
            <StaggeredContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" delay={0.2}>
            {[
              { title: "Faturamento", value: formatCurrency(data?.totalRevenue || 0), icon: DollarSign, change: data?.revenueChange, variant: "primary" },
              { title: "Meta", value: formatCurrency(data?.currentGoal || 0), icon: Target },
              { title: "Comissão", value: formatCurrency(data?.commission || 0), icon: TrendingUp, variant: "success" },
              { title: "Pipeline", value: formatCurrency(data?.pipelineValue || 0), icon: ShoppingBag },
              { title: "Conversão", value: `${(data?.conversionRate || 0).toFixed(1)}%`, icon: Percent },
              { title: "Ranking", value: `#${data?.currentRank || "-"}`, icon: Trophy, variant: data && data.currentRank <= 3 ? "gold" : "default" }
            ].map((stat, index) => (
              <div key={stat.title} className="animate-slide-up" style={{ animationDelay: `${100 + index * 80}ms` }}>
                <Card className={cn(
                  "glass-card hover-lift press-scale group relative overflow-hidden",
                  stat.variant === "primary" && "border-primary/30",
                  stat.variant === "success" && "border-success/30",
                  stat.variant === "gold" && "border-rank-gold/30"
                )}>
                  {/* Gradient overlay */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                    stat.variant === "primary" && "bg-gradient-to-br from-primary/10 to-transparent",
                    stat.variant === "success" && "bg-gradient-to-br from-success/10 to-transparent",
                    stat.variant === "gold" && "bg-gradient-to-br from-rank-gold/10 to-transparent"
                  )} />
                  
                  <CardContent className="p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "p-2 rounded-xl transition-all duration-300 group-hover:scale-110",
                        stat.variant === "primary" ? "bg-gradient-to-br from-primary to-primary-glow" :
                        stat.variant === "success" ? "bg-gradient-to-br from-success to-success/80" :
                        stat.variant === "gold" ? "rank-gold" : "bg-muted"
                      )}>
                        <stat.icon className={cn(
                          "h-4 w-4",
                          stat.variant ? "text-primary-foreground" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{stat.title}</span>
                    </div>
                    <p className={cn(
                      "text-lg font-bold",
                      stat.variant === "primary" && "gradient-text",
                      stat.variant === "gold" && "gradient-text-gold"
                    )}>{stat.value}</p>
                    {stat.change !== undefined && (
                      <span className={cn(
                        "text-xs font-medium",
                        stat.change > 0 ? "text-success" : stat.change < 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {stat.change > 0 && "+"}{stat.change.toFixed(1)}% vs mês anterior
                      </span>
                    )}
                  </CardContent>
                </Card>
              </div>
              ))}
            </StaggeredContainer>

            {/* Daily Target Alert */}
          {data && data.dailyRequired > 0 && data.goalProgress < 100 && (
            <div className="animate-slide-up glass-card rounded-xl p-4 border-2 border-warning/30 relative overflow-hidden" style={{ animationDelay: "350ms" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-warning/5 via-transparent to-warning/5 pointer-events-none" />
              <div className="relative flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-warning to-warning/80 animate-pulse-glow">
                  <Calendar className="h-5 w-5 text-warning-foreground" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">Para bater a meta</p>
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
            <Card className="lg:col-span-2 glass-card animate-slide-up" style={{ animationDelay: "400ms" }}>
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
                    <TrendingUp className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Vendas do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.salesByDay && data.salesByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.salesByDay}>
                      <defs>
                        <linearGradient id="colorValueBI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "var(--shadow-lg)"
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Vendas"]}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValueBI)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>Nenhuma venda este mês</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Pie */}
            <Card className="glass-card animate-slide-up" style={{ animationDelay: "450ms" }}>
              <CardHeader>
                <CardTitle className="text-lg font-display">Por Categoria</CardTitle>
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
                      {data.salesByCategory.map((cat, idx) => (
                        <div key={cat.category} className="flex items-center gap-2 text-sm hover-scale-sm cursor-default">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="flex-1 truncate text-muted-foreground">{cat.category}</span>
                          <span className="font-semibold">{formatCurrency(cat.value)}</span>
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
            <Card className="glass-card animate-slide-up" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
                    <ShoppingBag className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Pipeline por Estágio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.dealsByStage.map((stage, idx) => (
                    <div key={stage.stage} className="animate-slide-up" style={{ animationDelay: `${550 + idx * 50}ms` }}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{STAGE_LABELS[stage.stage] || stage.stage}</span>
                        <span className="text-muted-foreground">{stage.count} deals • <span className="font-semibold text-foreground">{formatCurrency(stage.value)}</span></span>
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
                  <span className="font-bold gradient-text">{(data?.avgDaysInPipeline || 0).toFixed(0)} dias</span>
                </div>
              </CardContent>
            </Card>

            {/* Activities & Streak */}
            <Card className="glass-card animate-slide-up" style={{ animationDelay: "550ms" }}>
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-xp to-primary">
                    <Activity className="h-4 w-4 text-xp-foreground" />
                  </div>
                  Atividades & Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 rounded-xl glass hover-scale-sm">
                    <p className="text-2xl font-black gradient-text">{data?.totalActivities || 0}</p>
                    <p className="text-xs text-muted-foreground font-medium">Atividades (30d)</p>
                  </div>
                  <div className="text-center p-4 rounded-xl glass hover-scale-sm">
                    <p className="text-2xl font-black text-success">{data?.totalAchievements || 0}</p>
                    <p className="text-xs text-muted-foreground font-medium">Conquistas</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-streak/10 to-transparent border border-streak/20 hover-lift-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-streak/20 animate-streak-fire">
                        <Flame className="h-5 w-5 text-streak" />
                      </div>
                      <span className="font-display font-semibold">Sequência Atual</span>
                    </div>
                    <span className="text-xl font-black text-streak">{data?.currentStreak || 0} dias</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 hover-lift-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-display font-semibold">Recorde Pessoal</span>
                    </div>
                    <span className="text-xl font-black gradient-text">{data?.bestStreak || 0} dias</span>
                  </div>
                </div>
                {data?.activitiesByType && data.activitiesByType.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">Por tipo</p>
                    <div className="flex flex-wrap gap-2">
                      {data.activitiesByType.map(a => (
                        <Badge key={a.type} variant="secondary" className="hover-scale-sm">
                          {a.type}: {a.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </PageTransition>
    </SkeletonTransition>
  );
};

export default BIVendedor;