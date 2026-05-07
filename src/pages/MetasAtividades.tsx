import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, AlertTriangle, CheckCircle, PartyPopper, Trophy, Flame } from "lucide-react";
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
      <div className="min-h-screen bg-background bg-gradient-subtle">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-page-title gradient-text">Metas de Atividades Diárias</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Acompanhe o progresso diário de cada vendedor • {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTestCelebration}
                className="gap-2 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <PartyPopper className="h-4 w-4" />
                Testar Celebração
              </Button>
              <Badge variant="secondary" className="text-xs shadow-sm">
                Progresso médio: {avgProgress.toFixed(0)}%
              </Badge>
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
                  "animate-fade-in-up hover:shadow-2xl transition-all duration-500 overflow-hidden relative group border-border/40 card-elevated",
                  `stagger-${index + 1}`
                )}
              >
                <div className={cn("absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full -mr-12 -mt-12 transition-all opacity-10 group-hover:opacity-20", stat.bgColor)} />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-2xl shadow-inner transition-transform duration-500 group-hover:scale-110", stat.bgColor)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                    <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest border-none px-2", stat.bgColor, stat.color)}>
                      {stat.trend}
                    </Badge>
                  </div>
                  <div>
                    <p className={cn("text-3xl font-display font-black tracking-tighter leading-none mb-1", stat.color)}>{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/80 mb-1">{stat.label}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">{stat.description}</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ranking */}
              <div className="animate-fade-in-up stagger-1">
                {isLoading ? (
                  <Skeleton className="h-[450px] w-full rounded-xl" />
                ) : (
                  <DailyActivityRanking data={progressData || []} />
                )}
              </div>

              {/* Progress Cards Grid */}
              <div className="lg:col-span-2 animate-fade-in-up stagger-2">
                <Card variant="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div className="icon-container-primary p-1.5 rounded-lg">
                        <Target className="h-4 w-4" />
                      </div>
                      Progresso por Vendedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-64 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : progressData && progressData.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <p className="empty-state-title">Nenhum vendedor encontrado</p>
                        <p className="empty-state-description">Adicione vendedores para ver o progresso de atividades.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
