import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, AlertTriangle, CheckCircle, PartyPopper, Trophy, Flame, Calendar } from "lucide-react";
import { useActivityGoalProgress } from "@/hooks/useActivityGoals";
import { useSalespeople } from "@/hooks/useSalespeople";
import { ActivityGoalCard } from "@/components/activities/ActivityGoalCard";
import { ActivityGoalEditDialog } from "@/components/activities/ActivityGoalEditDialog";
import { DailyActivityRanking } from "@/components/activities/DailyActivityRanking";
import { AchievementsHistory } from "@/components/achievements/AchievementsHistory";
import { StreakRanking } from "@/components/achievements/StreakRanking";
import { TeamAchievementStats } from "@/components/achievements/TeamAchievementStats";
import { useCelebration } from "@/hooks/useCelebration";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetasAtividadesLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/transitions/PageTransition";
import { ArenaPulseFeed } from "@/components/activities/ArenaPulseFeed";
import { ActivityVersusDuel } from "@/components/activities/ActivityVersusDuel";
import { PredictiveVelocity } from "@/components/activities/PredictiveVelocity";

export default function MetasAtividades() {
  const { data: progressData, isLoading } = useActivityGoalProgress();
  const { data: salespeople } = useSalespeople();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { celebrate, resetCelebration } = useCelebration();

  const editingSalesperson = salespeople?.find(sp => sp.id === editingId);

  const handleTestCelebration = () => {
    resetCelebration('test-celebration');
    celebrate('test-celebration');
  };

  // Calculate summary stats
  const withGoals = progressData?.filter(p => p.hasGoals) || [];
  const onTrack = withGoals.filter(p => p.progress.overall >= 70).length;
  const needsAttention = withGoals.filter(p => p.progress.overall < 40).length;
  const completed = withGoals.filter(p => p.progress.overall >= 100).length;
  const avgProgress = withGoals.length > 0
    ? withGoals.reduce((sum, p) => sum + p.progress.overall, 0) / withGoals.length
    : 0;

  const stats = [
    {
      label: "Com Metas Ativas",
      value: withGoals.length,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Base total monitorada",
      trend: "Estável"
    },
    {
      label: "Performance Turbo",
      value: onTrack,
      icon: TrendingUp,
      color: "text-info",
      bgColor: "bg-info/10",
      description: "Acima de 70% da meta",
      trend: "+12%"
    },
    {
      label: "Hall da Fama",
      value: completed,
      icon: CheckCircle,
      color: "text-status-success",
      bgColor: "bg-status-success/10",
      description: "Metas 100% batidas",
      trend: "MVP"
    },
    {
      label: "Zonas de Risco",
      value: needsAttention,
      icon: AlertTriangle,
      color: "text-status-error",
      bgColor: "bg-status-error/10",
      description: "Abaixo de 40% da meta",
      trend: "Crítico"
    },
  ];

  return (
    <PageTransition>
    <>
    <Helmet>
      <title>Metas de Atividades | Promo Champions</title>
      <meta name="description" content="Metas e objetivos de atividades" />
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<MetasAtividadesLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full animate-float pointer-events-none" />
        
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8 relative z-10">
          {/* Header Section with Holographic Title */}
          <div className="animate-fade-in-up relative">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 p-8 rounded-[2rem] glass border border-white/10 shadow-2xl overflow-hidden group">
              {/* Animated background lines for the header */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer-reverse" />
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 backdrop-blur-md shadow-glow-primary/20 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow-primary" />
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary drop-shadow-sm">Arena de Operações Live</span>
                </div>
                
                <div className="relative">
                  <h1 className="text-5xl sm:text-7xl font-display font-black tracking-tighter gradient-text uppercase italic leading-none filter drop-shadow-2xl">
                    Arena de Atividades
                  </h1>
                  {/* Decorative underline */}
                  <div className="h-1.5 w-32 bg-gradient-to-r from-primary via-accent to-transparent rounded-full mt-2" />
                </div>
                
                <p className="text-base text-muted-foreground font-medium flex items-center gap-3 pl-1">
                  <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
                    <Calendar className="h-5 w-5 text-primary/70" />
                  </div>
                  <span>
                    {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })} 
                    <span className="mx-2 text-border">|</span>
                    <span className="text-foreground/90 font-bold uppercase tracking-widest text-xs">Ciclo de Alta Performance</span>
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 relative z-10">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleTestCelebration}
                  className="gap-3 border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-500 group rounded-2xl bg-background/40 backdrop-blur-xl shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
                >
                  <PartyPopper className="h-5 w-5 text-primary group-hover:rotate-12 group-hover:scale-110 transition-all" />
                  <span className="text-xs font-black uppercase tracking-widest">Testar Vitória</span>
                </Button>
                
                <div className="px-8 py-4 rounded-[2rem] glass-morphism border border-primary/30 shadow-2xl shadow-primary/10 flex flex-col items-end group/ritmo relative overflow-hidden min-w-[180px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 opacity-50 pointer-events-none" />
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <TrendingUp className="w-12 h-12 text-primary" />
                  </div>
                  
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 leading-none mb-2 relative z-10 italic">Pulse Global</span>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-status-success/20 border border-status-success/40 shadow-glow-success/20">
                      <Flame className="h-5 w-5 text-status-success animate-pulse" />
                    </div>
                    <span className="text-4xl font-display font-black text-primary leading-none tracking-tighter drop-shadow-glow">
                      {avgProgress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))
          ) : (
            stats.map((stat, index) => (
              <Card 
                key={index} 
                variant="glass"
                className={cn(
                  "animate-fade-in-up hover:shadow-2xl transition-all duration-500 overflow-hidden relative group border-border/40 card-elevated rounded-3xl",
                  `stagger-${index + 1}`
                )}
              >
                <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-all opacity-20 group-hover:opacity-40 group-hover:scale-150 duration-700", stat.bgColor)} />
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn("p-4 rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", stat.bgColor)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest border-none px-3 py-1 rounded-full shadow-sm", stat.bgColor, stat.color)}>
                      {stat.trend}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className={cn("text-5xl font-display font-black tracking-tighter leading-none", stat.color)}>{stat.value}</p>
                      {stat.trend.startsWith('+') && <span className="text-status-success text-xs font-bold animate-pulse">{stat.trend}</span>}
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/90 mb-2">{stat.label}</p>
                    <p className="text-[10px] text-muted-foreground font-medium italic opacity-80 group-hover:opacity-100 transition-opacity">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Tabs: Progress + Achievements */}
        <Tabs defaultValue="progress" className="animate-fade-in-up stagger-5">
          <TabsList className="mb-4 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="progress" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Target className="h-4 w-4" />
              Progresso Diário
            </TabsTrigger>
            <TabsTrigger value="streaks" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Flame className="h-4 w-4" />
              Ranking de Sequências
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <TrendingUp className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Trophy className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="animate-fade-in">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Left Column: Live Intelligence */}
              <div className="xl:col-span-1 space-y-6 animate-fade-in-up stagger-1">
                <ArenaPulseFeed data={progressData || []} />
                <PredictiveVelocity data={progressData || []} />
                <ActivityVersusDuel data={progressData || []} />
              </div>

              {/* Center Column: Ranking & Main Progress */}
              <div className="xl:col-span-3 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Ranking */}
                  <div className="lg:col-span-1 animate-fade-in-up stagger-2">
                    {isLoading ? (
                      <Skeleton className="h-[600px] w-full rounded-3xl" />
                    ) : (
                      <DailyActivityRanking data={progressData || []} />
                    )}
                  </div>

                  {/* Progress Cards Grid */}
                  <div className="lg:col-span-2 animate-fade-in-up stagger-3">
                    <Card variant="glass" className="rounded-3xl border-border/40 overflow-hidden">
                      <CardHeader className="pb-4 bg-muted/20 border-b border-border/10">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                          <div className="icon-container-primary p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <Target className="h-4 w-4 text-primary" />
                          </div>
                          Grid de Performance Individual
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {isLoading ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => (
                              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                            ))}
                          </div>
                        ) : progressData && progressData.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {progressData.map((sp, index) => (
                              <div key={sp.salesperson_id} className={cn("animate-fade-in-up", `stagger-${index + 1}`)}>
                                <ActivityGoalCard
                                  data={sp}
                                  onEdit={setEditingId}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state">
                            <Users className="empty-state-icon" />
                            <p className="empty-state-title">Nenhum piloto na pista</p>
                            <p className="empty-state-description">Configure os pilotos para iniciar a monitoração na arena.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="streaks" className="animate-fade-in">
            <StreakRanking />
          </TabsContent>

          <TabsContent value="stats" className="animate-fade-in">
            <TeamAchievementStats />
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <AchievementsHistory />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      {editingId && editingSalesperson && (
        <ActivityGoalEditDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          salespersonId={editingId}
          salespersonName={editingSalesperson.name}
        />
      )}
    </div>
    </SkeletonTransition>
  </>
    </PageTransition>
  );
}
