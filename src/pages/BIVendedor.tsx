import { Helmet } from "react-helmet-async";
import { useBIVendedor } from "@/hooks/bi/useBIVendedor";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { VendedorDashboardLoadingSkeleton as BIVendedorLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CompactStatCard } from "@/components/dashboard/CompactStatCard";
import { cn } from "@/lib/utils";
import { DollarSign, Target, TrendingUp, ShoppingBag, Clock, Trophy, Flame, Activity, Star, Calendar, Percent, Award, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { PageTransition, StaggeredContainer } from "@/components/transitions/PageTransition";
import { BIVendedorCharts } from "@/components/bi/BIVendedorCharts";

const BIVendedor = () => {
  const { salesperson } = useAuth();
  const { data, isLoading } = useBIVendedor();
  const formatCurrency = (value: number) => `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <>
    <Helmet>
      <title>BI Vendedor | Promo Champions</title>
      <meta name="description" content="Business Intelligence para Vendedores" />
    </Helmet>
    <SkeletonTransition isLoading={isLoading} skeleton={<BIVendedorLoadingSkeleton />} duration={400}>
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
              <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-primary/30 shadow-xl hover-scale">
                      <AvatarImage src={salesperson?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xl font-bold">{salesperson?.name?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    {data && data.goalProgress >= 100 && (<div className="absolute -top-1 -right-1 p-1.5 bg-success rounded-full shadow-lg animate-bounce-in"><Star className="h-4 w-4 text-success-foreground" /></div>)}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-display flex items-center justify-center md:justify-start gap-2"><Sparkles className="h-6 w-6 text-primary" /><span className="gradient-text">Meu BI</span></h1>
                    <p className="text-muted-foreground font-medium">{salesperson?.name} • {currentMonth}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20 hover-scale-sm">{data?.commissionRate}% comissão</Badge>
                      {data && data.currentRank <= 3 && (<Badge className="rank-gold text-rank-gold-foreground animate-pulse-glow"><Trophy className="h-3 w-3 mr-1" /> Top {data.currentRank}</Badge>)}
                      {data && data.currentStreak >= 3 && (<Badge className="bg-streak/20 text-streak border-streak/30 animate-streak-fire"><Flame className="h-3 w-3 mr-1" /> {data.currentStreak} dias</Badge>)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm text-muted-foreground font-medium">Progresso da Meta</span>
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle cx="56" cy="56" r="48" fill="none" stroke={data && data.goalProgress >= 100 ? "hsl(var(--success))" : "url(#gradientBI)"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.min(data?.goalProgress || 0, 100) * 3.02} 302`} className="transition-all duration-1000 ease-out" />
                        <defs><linearGradient id="gradientBI" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="100%" stopColor="hsl(var(--primary-glow))" /></linearGradient></defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center"><span className={cn("text-xl font-black", data && data.goalProgress >= 100 ? "text-success" : "gradient-text")}>{(data?.goalProgress || 0).toFixed(0)}%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* KPI Stats */}
            <StaggeredContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" delay={0.2}>
              {[
                { title: "Faturamento", value: formatCurrency(data?.totalRevenue || 0), icon: DollarSign, change: data?.revenueChange, variant: "primary" as const },
                { title: "Meta", value: formatCurrency(data?.currentGoal || 0), icon: Target, variant: "default" as const },
                { title: "Comissão", value: formatCurrency(data?.commission || 0), icon: TrendingUp, variant: "success" as const },
                { title: "Pipeline", value: formatCurrency(data?.pipelineValue || 0), icon: ShoppingBag, variant: "warning" as const },
                { title: "Conversão", value: `${(data?.conversionRate || 0).toFixed(1)}%`, icon: Percent, variant: "default" as const },
                { title: "Ranking", value: `#${data?.currentRank || "-"}`, icon: Trophy, variant: data && data.currentRank <= 3 ? "gold" as const : "default" as const },
              ].map((stat, index) => {
                const variantMap = { primary: { border: "border-l-primary", bg: "bg-primary/15", text: "text-primary" }, success: { border: "border-l-success", bg: "bg-success/15", text: "text-success" }, warning: { border: "border-l-warning", bg: "bg-warning/15", text: "text-warning" }, gold: { border: "border-l-rank-gold", bg: "bg-rank-gold/15", text: "text-rank-gold" }, default: { border: "border-l-muted-foreground/30", bg: "bg-muted/50", text: "text-muted-foreground" } };
                const v = variantMap[stat.variant];
                return (
                  <div key={stat.title} className="animate-slide-up" style={{ animationDelay: `${100 + index * 80}ms` }}>
                    <Card className={cn("glass-card hover-lift press-scale group relative overflow-hidden border-border/40 border-l-4", v.border)}>
                      <CardContent className="p-4 relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn("p-2 rounded-xl transition-all duration-300 group-hover:scale-110", v.bg)}><stat.icon className={cn("h-4 w-4", v.text)} /></div>
                          <span className="text-xs text-muted-foreground font-medium">{stat.title}</span>
                        </div>
                        <p className={cn("text-lg font-bold font-display", stat.variant === "primary" && "gradient-text", stat.variant === "gold" && "gradient-text-gold")}>{stat.value}</p>
                        {stat.change !== undefined && (<span className={cn("text-xs font-medium", stat.change > 0 ? "text-success" : stat.change < 0 ? "text-destructive" : "text-muted-foreground")}>{stat.change > 0 && "+"}{stat.change.toFixed(1)}% vs mês anterior</span>)}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </StaggeredContainer>

            {/* Secondary Metrics */}
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
              <CompactStatCard title="Deals Ativos" value={data?.dealsByStage.reduce((acc, s) => acc + s.count, 0) || 0} icon={ShoppingBag} variant="primary" />
              <CompactStatCard title="Dias no Pipeline" value={`${(data?.avgDaysInPipeline || 0).toFixed(0)}d`} icon={Clock} variant="info" />
              <CompactStatCard title="Atividades (30d)" value={data?.totalActivities || 0} icon={Activity} variant="success" />
              <CompactStatCard title="Conquistas" value={data?.totalAchievements || 0} icon={Award} variant="warning" />
              <CompactStatCard title="Sequência" value={`${data?.currentStreak || 0}d`} icon={Flame} variant="danger" />
              <CompactStatCard title="Recorde" value={`${data?.bestStreak || 0}d`} icon={Trophy} variant="primary" />
            </motion.div>

            {/* Daily Target Alert */}
            {data && data.dailyRequired > 0 && data.goalProgress < 100 && (
              <div className="animate-slide-up glass-card rounded-xl p-4 border-2 border-warning/30 relative overflow-hidden" style={{ animationDelay: "350ms" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-warning/5 via-transparent to-warning/5 pointer-events-none" />
                <div className="relative flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-warning to-warning/80 animate-pulse-glow"><Calendar className="h-5 w-5 text-warning-foreground" /></div>
                  <div>
                    <p className="font-display font-semibold text-foreground">Para bater a meta</p>
                    <p className="text-sm text-muted-foreground">Faltam <span className="font-bold text-warning">{data.daysRemaining} dias</span> • Você precisa vender <span className="font-bold text-warning">{formatCurrency(data.dailyRequired)}/dia</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            <BIVendedorCharts
              salesByDay={data?.salesByDay}
              salesByCategory={data?.salesByCategory}
              dealsByStage={data?.dealsByStage}
              pipelineValue={data?.pipelineValue}
              avgDaysInPipeline={data?.avgDaysInPipeline}
              totalActivities={data?.totalActivities}
              totalAchievements={data?.totalAchievements}
              currentStreak={data?.currentStreak}
              bestStreak={data?.bestStreak}
               activitiesByType={data?.activitiesByType}
              conversationInsights={data?.conversationInsights}
            />
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
};

export default BIVendedor;
