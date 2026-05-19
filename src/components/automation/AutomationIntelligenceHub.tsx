import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Zap, TrendingUp, Clock, CheckCircle2, AlertCircle, Plus, Activity } from "lucide-react";
import { useAutomationIntelligence, useApplyAutomationTemplate, type AutomationSuggestion } from "@/hooks/automation/useAutomationIntelligence";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<AutomationSuggestion["priority"], string> = {
  high: "border-destructive/40 bg-destructive/5",
  medium: "border-warning/40 bg-warning/5",
  low: "border-border bg-muted/20",
};

const PRIORITY_BADGE: Record<AutomationSuggestion["priority"], "destructive" | "default" | "secondary"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

export function AutomationIntelligenceHub() {
  const { data, isLoading } = useAutomationIntelligence();
  const applyTemplate = useApplyAutomationTemplate();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const roi = data?.roi_metrics;
  const suggestions = data?.suggestions ?? [];

  return (
    <>
      <Helmet>
        <title>Automação Inteligente | Promo Champions</title>
        <meta name="description" content="Hub unificado de automações com sugestões de IA e métricas de ROI" />
      </Helmet>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Automação Inteligente
            </h1>
            <p className="text-muted-foreground mt-1">
              Hub centralizado: sugestões com IA, ROI em tempo real e templates one-click
            </p>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link to="/workflow-builder">
              <Plus className="h-4 w-4" />
              Criar workflow customizado
            </Link>
          </Button>
        </div>

        {/* ROI Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> Workflows ativos
              </CardDescription>
              <CardTitle className="text-3xl">
                {data?.active_workflows ?? 0}
                <span className="text-sm text-muted-foreground font-normal"> / {data?.total_workflows ?? 0}</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> Execuções (30d)
              </CardDescription>
              <CardTitle className="text-3xl">{roi?.total_runs_30d ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Taxa de sucesso
              </CardDescription>
              <CardTitle className={cn(
                "text-3xl",
                (roi?.success_rate_pct ?? 0) >= 90 ? "text-success" :
                (roi?.success_rate_pct ?? 0) >= 70 ? "text-warning" : "text-destructive",
              )}>
                {roi?.success_rate_pct ?? 0}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Tempo economizado
              </CardDescription>
              <CardTitle className="text-3xl text-success">
                {roi?.estimated_time_saved_hours ?? 0}h
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Sugestões inteligentes ({suggestions.length})
            </CardTitle>
            <CardDescription>
              Automações recomendadas com base no padrão de uso e dados do seu pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
                <p className="font-medium">Tudo otimizado!</p>
                <p className="text-sm text-muted-foreground">Não há novas sugestões no momento. Suas automações estão cobrindo bem os cenários principais.</p>
              </div>
            ) : (
              suggestions.map((s) => (
                <div key={s.id} className={cn("rounded-lg border p-4 space-y-3 transition-colors", PRIORITY_STYLES[s.priority])}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-[260px]">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{s.title}</h3>
                        <Badge variant={PRIORITY_BADGE[s.priority]} className="capitalize">{s.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => applyTemplate.mutate(s.template)}
                      disabled={applyTemplate.isPending}
                      className="gap-2 shrink-0"
                    >
                      <Zap className="h-4 w-4" />
                      Aplicar template
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Economiza ~{s.estimated_time_saved_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Trigger: <code className="px-1 rounded bg-muted">{s.trigger_type}</code>
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs bg-background/60 rounded p-2">
                    <AlertCircle className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{s.rationale}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Workflows existentes</CardTitle>
              <CardDescription>Gerencie e monitore automações ativas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/automacoes">Ver workflows</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Builder visual</CardTitle>
              <CardDescription>Crie workflows complexos com editor drag-and-drop</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/workflow-builder">Abrir builder</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Aprovações</CardTitle>
              <CardDescription>Workflows de aprovação para descontos e negociações</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/aprovacoes">Ver aprovações</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
