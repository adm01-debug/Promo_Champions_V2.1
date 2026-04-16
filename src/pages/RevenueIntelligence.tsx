import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertTriangle, Activity, DollarSign, Target, CheckCircle2 } from "lucide-react";
import { useRevenueForecast, useRiskSignals, useResolveRiskSignal } from "@/hooks/revenue/useRevenueIntelligence";
import { Helmet } from "react-helmet-async";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-status-warning/15 text-status-warning border-status-warning/30",
  medium: "bg-primary/15 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-border",
};

const SIGNAL_LABELS: Record<string, string> = {
  stagnation: "Estagnação",
  no_contact: "Sem contato",
  engagement_drop: "Queda de engajamento",
  price_resistance: "Resistência a preço",
  competitor_mentioned: "Concorrente citado",
  single_threaded: "Single-threaded",
  overdue_followup: "Follow-up atrasado",
};

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export default function RevenueIntelligence() {
  const { data: forecast, isLoading: loadingForecast } = useRevenueForecast(90);
  const { data: signals, isLoading: loadingSignals } = useRiskSignals();
  const resolve = useResolveRiskSignal();

  const totalWeighted = forecast?.find((f) => f.period === "90d")?.weighted_revenue ?? 0;
  const totalRaw = forecast?.find((f) => f.period === "90d")?.raw_pipeline ?? 0;
  const avgHealth = forecast?.find((f) => f.period === "90d")?.avg_health ?? 50;
  const criticalCount = signals?.filter((s) => s.severity === "critical").length ?? 0;

  return (
    <>
      <Helmet>
        <title>Revenue Intelligence | Promo Champions</title>
        <meta name="description" content="Forecast ponderado, deal health score e sinais de risco do pipeline em tempo real." />
      </Helmet>

      <div className="container max-w-7xl py-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Revenue Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">Previsão inteligente, saúde do pipeline e sinais de risco</p>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="glass border-border/40 hover-lift-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" /> Forecast 90d
              </div>
              <div className="text-xl font-semibold tabular-nums">{loadingForecast ? "—" : formatBRL(totalWeighted)}</div>
              <p className="text-[10px] text-muted-foreground">ponderado por estágio</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/40 hover-lift-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> Pipeline bruto
              </div>
              <div className="text-xl font-semibold tabular-nums">{loadingForecast ? "—" : formatBRL(totalRaw)}</div>
              <p className="text-[10px] text-muted-foreground">90 dias</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/40 hover-lift-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" /> Saúde média
              </div>
              <div className="text-xl font-semibold tabular-nums">{avgHealth}/100</div>
              <Progress value={avgHealth} className="h-1" />
            </CardContent>
          </Card>
          <Card className="glass border-border/40 hover-lift-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" /> Críticos
              </div>
              <div className="text-xl font-semibold tabular-nums text-destructive">{criticalCount}</div>
              <p className="text-[10px] text-muted-foreground">sinais ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Forecast detalhado */}
        <Card className="glass border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Forecast por janela
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingForecast && <Skeleton className="h-32 w-full" />}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forecast?.map((f) => (
                <div key={f.period} className="rounded-lg border border-border/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Próximos {f.period}</span>
                    <Badge variant="secondary" className="text-[10px]">{f.deal_count} deals</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ponderado</p>
                    <p className="text-lg font-semibold text-primary tabular-nums">{formatBRL(f.weighted_revenue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Bruto</p>
                    <p className="text-sm tabular-nums">{formatBRL(f.raw_pipeline)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Saúde média</p>
                    <Progress value={f.avg_health} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground tabular-nums">{f.avg_health}/100</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sinais de risco */}
        <Card className="glass border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-warning" /> Sinais de risco ativos ({signals?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSignals && <Skeleton className="h-20 w-full" />}
            {!loadingSignals && (!signals || signals.length === 0) && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-10 w-10 text-status-success mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum sinal de risco no pipeline. ✨</p>
              </div>
            )}
            <div className="space-y-2">
              {signals?.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${SEVERITY_STYLES[s.severity]}`}>
                      {s.severity}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{SIGNAL_LABELS[s.signal_type] ?? s.signal_type}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(s.detected_at), { addSuffix: true, locale: ptBR })}
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => resolve.mutate(s.id)}>
                      Resolver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
