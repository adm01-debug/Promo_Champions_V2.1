import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, AlertTriangle, CheckCircle, PartyPopper, Trophy } from "lucide-react";
import { useActivityGoalProgress } from "@/hooks/useActivityGoals";
import { useSalespeople } from "@/hooks/useSalespeople";
import { ActivityGoalCard } from "@/components/activities/ActivityGoalCard";
import { ActivityGoalEditDialog } from "@/components/activities/ActivityGoalEditDialog";
import { DailyActivityRanking } from "@/components/activities/DailyActivityRanking";
import { AchievementsHistory } from "@/components/achievements/AchievementsHistory";
import { useCelebration } from "@/hooks/useCelebration";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      label: "Com Metas",
      value: withGoals.length,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "No Caminho",
      value: onTrack,
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Meta Batida",
      value: completed,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: "Atenção",
      value: needsAttention,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-400/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Metas de Atividades Diárias</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Acompanhe o progresso diário de cada vendedor • {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTestCelebration}
                className="gap-2"
              >
                <PartyPopper className="h-4 w-4" />
                Testar Celebração
              </Button>
              <Badge variant="secondary" className="text-xs">
                Progresso médio: {avgProgress.toFixed(0)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          ) : (
            stats.map((stat, index) => (
              <Card key={index} className="glass border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Tabs: Progress + Achievements */}
        <Tabs defaultValue="progress" className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <TabsList className="mb-4">
            <TabsTrigger value="progress" className="gap-2">
              <Target className="h-4 w-4" />
              Progresso Diário
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Trophy className="h-4 w-4" />
              Histórico de Conquistas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ranking */}
              <div>
                {isLoading ? (
                  <Skeleton className="h-[450px] w-full" />
                ) : (
                  <DailyActivityRanking data={progressData || []} />
                )}
              </div>

              {/* Progress Cards Grid */}
              <div className="lg:col-span-2">
                <Card className="glass border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Progresso por Vendedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-64 w-full" />
                        ))}
                      </div>
                    ) : progressData && progressData.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {progressData.map((sp) => (
                          <ActivityGoalCard
                            key={sp.salesperson_id}
                            data={sp}
                            onEdit={setEditingId}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Users className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-sm font-medium">Nenhum vendedor encontrado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
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
  );
}
