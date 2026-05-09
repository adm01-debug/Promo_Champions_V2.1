import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Brain, TrendingUp, AlertTriangle, Target, Activity, Sparkles,
  ChevronRight, Zap, Shield, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePredictiveIntelligence } from "@/hooks/usePredictiveIntelligence";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LeadScoreExplainCard } from "@/components/lead-scoring/LeadScoreExplainCard";
import { cn } from "@/lib/utils";
import { PredictiveScenarioPlanner } from "./PredictiveScenarioPlanner";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function PredictiveIntelligenceDashboard() {
  const [horizon, setHorizon] = useState(90);
  const { data, isLoading, isFetching, refetch } = usePredictiveIntelligence({ horizonDays: horizon });

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Inteligência Preditiva | PROMO CHAMPIONS</title>
        <meta name="description" content="Centro unificado de previsões: forecast, churn, win-propensity e insights de IA." />
      </Helmet>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-page-title flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            Inteligência Preditiva
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Forecast ponderado, risco de churn, propensão de fechamento e recomendações de IA — em um único hub.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(horizon)} onValueChange={(v) => setHorizon(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="180">180 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* AI INSIGHTS */}
      {data?.ai_insights && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Análise da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{data.ai_insights.summary}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-success mb-2 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> Recomendações
                </h4>
                <ul className="space-y-1.5">
                  {data.ai_insights.recommendations.map((r, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <ChevronRight className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-destructive mb-2 flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> Riscos
                </h4>
                <ul className="space-y-1.5">
                  {data.ai_insights.risks.map((r, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Forecast Ponderado"
          value={isLoading ? null : formatBRL(data?.forecast.weighted_revenue ?? 0)}
          sub={`${data?.forecast.deal_count ?? 0} deals · ${horizon}d`}
          tone="primary"
        />
        <KpiCard
          icon={<Target className="h-4 w-4" />}
          label="Confiança"
          value={isLoading ? null : `${data?.forecast.confidence ?? 0}%`}
          sub={`Win-rate 30d: ${data?.trends.win_rate_30d ?? 0}%`}
          tone={(data?.forecast.confidence ?? 0) >= 60 ? "success" : (data?.forecast.confidence ?? 0) >= 40 ? "warning" : "destructive"}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Receita em Risco"
          value={isLoading ? null : formatBRL(data?.churn.total_revenue_at_risk ?? 0)}
          sub={`${data?.churn.high_risk_count ?? 0} clientes críticos`}
          tone="destructive"
        />
        <KpiCard
          icon={<Activity className="h-4 w-4" />}
          label="Velocity Δ"
          value={isLoading ? null : `${data?.trends.velocity_change_pct ?? 0 > 0 ? "+" : ""}${data?.trends.velocity_change_pct ?? 0}%`}
          sub={`Ciclo médio: ${data?.trends.avg_deal_cycle_days ?? 0}d`}
          tone={(data?.trends.velocity_change_pct ?? 0) >= 0 ? "success" : "warning"}
        />
      </div>

      {/* SCENARIO PLANNER */}
      <PredictiveScenarioPlanner />

      {/* TABS */}
      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="health">Saúde Pipeline</TabsTrigger>
          <TabsTrigger value="churn">Churn</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cenários de Receita</CardTitle>
              <CardDescription>Projeção ponderada por estágio, lead score e tempo no estágio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? <Skeleton className="h-32 w-full" /> : (
                <>
                  <ScenarioRow label="Pessimista" value={data?.forecast.worst_case ?? 0} max={data?.forecast.best_case ?? 1} tone="destructive" />
                  <ScenarioRow label="Esperado (ponderado)" value={data?.forecast.weighted_revenue ?? 0} max={data?.forecast.best_case ?? 1} tone="primary" />
                  <ScenarioRow label="Otimista" value={data?.forecast.best_case ?? 0} max={data?.forecast.best_case ?? 1} tone="success" />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição da Saúde do Pipeline</CardTitle>
              <CardDescription>Probabilidade média: {data?.pipeline_health.avg_probability ?? 0}%</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HealthBucket label="Saudáveis" count={data?.pipeline_health.healthy ?? 0} tone="success" />
              <HealthBucket label="Em Risco" count={data?.pipeline_health.at_risk ?? 0} tone="warning" />
              <HealthBucket label="Críticos" count={data?.pipeline_health.critical ?? 0} tone="destructive" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clientes em Risco de Churn</CardTitle>
              <CardDescription>Top 5 clientes com maior risco e maior valor</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-40 w-full" /> : data?.churn.top_at_risk.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhum cliente em risco crítico no momento. ✨</p>
              ) : (
                <div className="space-y-2">
                  {data?.churn.top_at_risk.map((c) => (
                    <div key={c.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{c.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {c.reasons.map((r, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 h-4">{r}</Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant="destructive" className="flex-shrink-0">{c.risk}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Oportunidades de Fechamento</CardTitle>
              <CardDescription>Maior valor esperado (amount × probabilidade)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-40 w-full" /> : data?.win_propensity.top_opportunities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma oportunidade de alta propensão no momento.</p>
              ) : (
                <div className="space-y-2">
                  {data?.win_propensity.top_opportunities.map((o) => (
                    <Popover key={o.id}>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate flex items-center gap-2">
                              <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
                              {o.client}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatBRL(o.amount)} · clique para explicação IA</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={o.probability * 100} className="w-20 h-2" />
                            <Badge variant="default" className="flex-shrink-0">{Math.round(o.probability * 100)}%</Badge>
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[420px] p-0" align="end">
                        <LeadScoreExplainCard saleId={o.id} />
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {data?.generated_at && (
        <p className="text-xs text-muted-foreground text-right">
          Atualizado em {new Date(data.generated_at).toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, tone }: {
  icon: React.ReactNode; label: string; value: string | null; sub: string;
  tone: "primary" | "success" | "warning" | "destructive";
}) {
  const toneClasses = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">{label}</span>
          <div className={cn("p-1.5 rounded-lg", toneClasses[tone])}>{icon}</div>
        </div>
        {value === null ? <Skeleton className="h-7 w-24" /> : (
          <p className="text-xl font-bold">{value}</p>
        )}
        <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function ScenarioRow({ label, value, max, tone }: { label: string; value: number; max: number; tone: "primary" | "success" | "destructive" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const barTone = { primary: "bg-primary", success: "bg-success", destructive: "bg-destructive" }[tone];
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-mono">{formatBRL(value)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barTone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function HealthBucket({ label, count, tone }: { label: string; count: number; tone: "success" | "warning" | "destructive" }) {
  const toneClasses = {
    success: "border-success/30 bg-success/5 text-success",
    warning: "border-warning/30 bg-warning/5 text-warning",
    destructive: "border-destructive/30 bg-destructive/5 text-destructive",
  };
  return (
    <div className={cn("rounded-lg border p-4 text-center", toneClasses[tone])}>
      <p className="text-3xl font-bold">{count}</p>
      <p className="text-xs font-medium mt-1">{label}</p>
    </div>
  );
}
