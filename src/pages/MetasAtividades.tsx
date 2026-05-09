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
import { ActivityHeatmap } from "@/components/activities/ActivityHeatmap";
import { ArenaAITips } from "@/components/activities/ArenaAITips";
import { AchievementBadgeDisplay } from "@/components/activities/AchievementBadgeDisplay";
import { ArenaStatusBadge } from "@/components/arena/ArenaStatusBadge";
import { EnhancedActivityCard } from "@/components/arena/EnhancedActivityCard";

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
    <style dangerouslySetInnerHTML={{ __html: `
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      
      .arena-scrollbar::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      .arena-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
        border-radius: 10px;
      }
      .arena-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(var(--primary), 0.3);
        border-radius: 10px;
      }
      .arena-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(var(--primary), 0.5);
      }

      @keyframes scan {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(1000%); }
      }
      .scan-line {
        position: absolute;
        width: 100%;
        height: 100px;
        background: linear-gradient(to bottom, transparent, rgba(var(--primary), 0.1), transparent);
        animation: scan 8s linear infinite;
        pointer-events: none;
        z-index: 40;
      }
      
      .magnetic-hover {
        transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      }
      .magnetic-hover:hover {
        transform: translate(var(--mx, 0px), var(--my, 0px)) scale(1.02);
      }
    `}} />
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
      <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/30">
        {/* Background Decorative Elements - Advanced Arena DNA */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-accent/15 blur-[120px] rounded-full animate-float pointer-events-none" />
        
        {/* Scanning Line Effect - Improved */}
        <div className="scan-line" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />


        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8 relative z-10">
          {/* Header Section with Holographic Title */}
          <div className="animate-fade-in-up relative group/arena-header">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 p-10 rounded-[3rem] glass border border-white/20 shadow-glow-primary/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-50" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <ArenaStatusBadge status="online" label="Arena de Operações Live" />
                  <ArenaStatusBadge status="busy" label="Alta Volatilidade" showRipple={false} />
                </div>

                <div className="relative">
                  <h1 className="text-6xl sm:text-8xl font-display font-black tracking-tighter gradient-text uppercase italic leading-none filter drop-shadow-glow transition-all duration-700 group-hover/arena-header:scale-[1.02]">
                    Arena de Atividades
                  </h1>
                  <div className="h-2 w-48 bg-gradient-to-r from-primary via-accent to-transparent rounded-full mt-4 animate-shimmer" />
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
                
                <div className="flex flex-col items-end gap-2 group/boss-bar">
                  <div className="px-10 py-6 rounded-[2.5rem] glass-morphism border border-primary/30 shadow-2xl shadow-primary/20 flex flex-col items-end group/ritmo relative overflow-hidden min-w-[280px] transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 opacity-50" />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary via-accent to-primary animate-shimmer"
                        style={{ width: `${avgProgress}%` }}
                      />
                    </div>
                    
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <TrendingUp className="w-16 h-16 text-primary group-hover/boss-bar:scale-125 transition-transform duration-700" />
                    </div>
                    
                    <div className="flex flex-col items-end relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80 leading-none mb-3 italic flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Arena Boss Bar
                      </span>
                      <div className="flex items-center gap-5">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Ritmo Coletivo</span>
                          <div className="flex items-center gap-2">
                            <span className="text-5xl font-display font-black text-foreground leading-none tracking-tighter drop-shadow-glow">
                              {avgProgress.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-glow-primary/20 animate-float">
                          <Flame className="h-7 w-7 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/40 backdrop-blur-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground shadow-lg">
                    <span className="text-primary animate-pulse">● Live</span>
                    <span>Meta Diária: {completed}/{withGoals.length} Concluídas</span>
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
                  "animate-fade-in-up hover:shadow-glow-primary/10 transition-all duration-700 overflow-hidden relative group border-white/10 card-elevated rounded-[2.5rem] hover:-translate-y-2",
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
                    <div className="flex items-baseline gap-3 mb-2">
                      <p className={cn("text-6xl font-display font-black tracking-tighter leading-none drop-shadow-glow", stat.color)}>{stat.value}</p>
                      {stat.trend.startsWith('+') && <span className="text-status-success text-sm font-black animate-fire-pulse bg-status-success/20 px-2 py-0.5 rounded-full">{stat.trend}</span>}
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
          <TabsList className="mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-xl">
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
                <AchievementBadgeDisplay />
                <ArenaPulseFeed data={progressData || []} />
                <ArenaAITips data={progressData || []} />
                <PredictiveVelocity data={progressData || []} />
                <ActivityVersusDuel data={progressData || []} />
                <ActivityHeatmap />
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
                    {completed > 0 && (
                      <div className="mb-6 p-6 rounded-[2rem] bg-gradient-to-r from-rank-gold/20 via-primary/10 to-rank-gold/20 border border-rank-gold/30 shadow-glow-gold/10 animate-pulse relative overflow-hidden group">
                        <div className="absolute inset-0 bg-shimmer opacity-20" />
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-rank-gold shadow-glow-gold">
                              <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-display font-black tracking-tighter uppercase italic text-rank-gold">Membro no Hall da Fama!</h4>
                              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/70">O pódio da arena já tem ocupantes hoje.</p>
                            </div>
                          </div>
                          <Badge className="bg-rank-gold hover:bg-rank-gold text-white font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest animate-bounce">
                            MVP ATIVO
                          </Badge>
                        </div>
                      </div>
                    )}
                    <Card variant="glass" className="rounded-[2.5rem] border-white/10 overflow-hidden shadow-2xl transition-all duration-500 hover:bg-background/30 group/grid">
                      <CardHeader className="pb-6 bg-primary/5 border-b border-white/5">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {progressData.map((sp, index) => (
                              <div key={sp.salesperson_id} className={cn("animate-fade-in-up w-full", `stagger-${index + 1}`)}>
                                <EnhancedActivityCard
                                  data={sp}
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
      </div>

      <ActivityGoalEditDialog
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
        salespersonId={editingId || ""}
        salespersonName={editingSalesperson?.name || ""}
      />
    </SkeletonTransition>
    </>
    </PageTransition>
  );
}
