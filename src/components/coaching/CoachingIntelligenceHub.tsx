import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, AlertTriangle, TrendingUp, CheckCircle2, Target, Activity, ArrowRight } from "lucide-react";
import { useCoachingIntelligence, type CoachingTarget } from "@/hooks/useCoachingIntelligence";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CoachingOpportunityPanel } from "./opportunities/CoachingOpportunityPanel";
import { SkillGapAnalyzerPanel } from "./skills/SkillGapAnalyzerPanel";
import { CoachingSessionPlanner } from "./sessions/CoachingSessionPlanner";

const PRIORITY_STYLES: Record<CoachingTarget["priority"], { border: string; badge: "destructive" | "default" | "secondary"; label: string; icon: typeof AlertTriangle }> = {
  critical: { border: "border-l-4 border-l-destructive", badge: "destructive", label: "Crítico", icon: AlertTriangle },
  warning: { border: "border-l-4 border-l-warning", badge: "default", label: "Atenção", icon: TrendingUp },
  healthy: { border: "border-l-4 border-l-success", badge: "secondary", label: "Saudável", icon: CheckCircle2 },
};

export function CoachingIntelligenceHub() {
  const { data, isLoading } = useCoachingIntelligence();

  const summary = data?.summary;
  const targets = data?.targets ?? [];

  return (
    <>
      <Helmet>
        <title>Coaching Inteligente | Promo Champions</title>
        <meta name="description" content="Hub unificado de coaching com priorização automática por IA, oportunidades de skill gap e recomendações personalizadas para cada vendedor" />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Coaching Inteligente
            </h1>
            <p className="text-muted-foreground mt-1">
              Priorização automática + detecção de gaps de skill por vendedor
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="opportunities">Oportunidades de Coaching</TabsTrigger>
            <TabsTrigger value="skills">Skill Gap Analyzer</TabsTrigger>
            <TabsTrigger value="sessions">Sessões 1:1</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-6">
            {isLoading ? (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
                </div>
                <Skeleton className="h-96" />
              </>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" /> Críticos
                      </CardDescription>
                      <CardTitle className="text-3xl text-destructive">{summary?.critical ?? 0}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-warning" /> Em atenção
                      </CardDescription>
                      <CardTitle className="text-3xl text-warning">{summary?.warning ?? 0}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" /> Saudáveis
                      </CardDescription>
                      <CardTitle className="text-3xl text-success">{summary?.healthy ?? 0}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Health Score médio
                      </CardDescription>
                      <CardTitle className={cn(
                        "text-3xl",
                        (summary?.avg_health_score ?? 0) >= 70 ? "text-success" :
                        (summary?.avg_health_score ?? 0) >= 40 ? "text-warning" : "text-destructive",
                      )}>
                        {summary?.avg_health_score ?? 0}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Vendedores priorizados ({targets.length})
                    </CardTitle>
                    <CardDescription>
                      Ordenados por urgência: críticos primeiro, depois por menor health score
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {targets.length === 0 ? (
                      <div className="text-center py-12 space-y-2">
                        <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
                        <p className="font-medium">Nenhum vendedor cadastrado ou todos performando bem!</p>
                      </div>
                    ) : (
                      targets.map((t) => {
                        const style = PRIORITY_STYLES[t.priority];
                        const Icon = style.icon;
                        return (
                          <div key={t.salesperson_id} className={cn("rounded-lg border bg-card p-4 space-y-3", style.border)}>
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-3 min-w-[260px] flex-1">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={t.avatar_url ?? undefined} alt={t.name} />
                                  <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold">{t.name}</h3>
                                    <Badge variant={style.badge} className="gap-1">
                                      <Icon className="h-3 w-3" />
                                      {style.label}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{t.top_issue}</p>
                                </div>
                              </div>
                              <Button asChild size="sm" variant="outline" className="gap-2 shrink-0">
                                <Link to={`/vendedor/${t.salesperson_id}`}>
                                  Ver detalhes
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div className="space-y-0.5">
                                <p className="text-muted-foreground">Win rate</p>
                                <p className="font-semibold">{t.win_rate}%</p>
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-muted-foreground">Deals (30d)</p>
                                <p className="font-semibold">{t.deals_count}</p>
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-muted-foreground">Atividades (30d)</p>
                                <p className="font-semibold">{t.activities_30d}</p>
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-muted-foreground">Ticket médio</p>
                                <p className="font-semibold">R$ {t.avg_deal_size.toLocaleString("pt-BR")}</p>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Health Score</span>
                                <span className="font-semibold">{t.health_score}/100</span>
                              </div>
                              <Progress value={t.health_score} className="h-1.5" />
                            </div>

                            <div className="flex items-start gap-2 text-xs bg-muted/40 rounded p-2">
                              <Brain className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                              <span><strong>Ação recomendada:</strong> {t.recommended_action}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="mt-4">
            <CoachingOpportunityPanel />
          </TabsContent>

          <TabsContent value="skills" className="mt-4">
            <SkillGapAnalyzerPanel />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
