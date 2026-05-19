import { Helmet } from "react-helmet-async";
import { Clock, Sparkles, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGlobalSendTimeStats,
  useTopSendTimeProfiles,
  useOptimizeSendTime,
} from "@/hooks/engagement/useSendTimeOptimization";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ScheduledSendsPanel } from "@/components/engagement/SendTime/ScheduledSendsPanel";
import { SendTimeHeatmap } from "@/components/engagement/SendTime/SendTimeHeatmap";
import { formatWindow } from "@/components/sequences/sendTimeHelpers";

export default function SendTimeOptimizationPage() {
  const { data: globalStats } = useGlobalSendTimeStats();
  const { data: top = [], isLoading: loadingTop } = useTopSendTimeProfiles(10);
  const optimize = useOptimizeSendTime();
  const { isAdminOrManager } = useUserRoles();

  return (
    <>
      <Helmet>
        <title>Send Time IA — melhor horário de envio | Promo Champions</title>
        <meta name="description" content="Otimize o horário de envio de e-mails e mensagens com IA, baseado no comportamento real de cada lead." />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-page-title flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" /> Send Time IA
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Calcula o melhor horário e dia para falar com cada lead, com base em aberturas históricas.
            </p>
          </div>
          {isAdminOrManager && (
            <Button
              onClick={() => optimize.mutate({ recompute_all: true })}
              loading={optimize.isPending}
              loadingText="Recalculando…"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" /> Recalcular todos
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" /> Melhor janela global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {globalStats ? formatWindow(globalStats.best_dow, globalStats.best_hour) : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {globalStats?.sample_size ?? 0} aberturas em 90 dias
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4" /> Perfis de alta confiança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {top.filter((p) => p.confidence >= 0.6).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">≥60% de confiança</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" /> Perfis calculados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{top.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Top 10 mais confiáveis</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 leads — perfis mais confiáveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingTop && <div className="text-sm text-muted-foreground">Carregando…</div>}
            {!loadingTop && top.length === 0 && (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Nenhum perfil ainda. Use "Recalcular todos" para gerar.
              </div>
            )}
            {top.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-mono text-muted-foreground">{p.sale_id.slice(0, 8)}…</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {formatWindow(p.best_dow, p.best_hour)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(Number(p.confidence) * 100)}% conf · {p.sample_size} amostras
                    </span>
                  </div>
                </div>
                <div className="hidden md:block w-64">
                  <SendTimeHeatmap
                    hourDistribution={p.hour_distribution}
                    dowDistribution={p.dow_distribution}
                    compact
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <ScheduledSendsPanel status="pending" />
      </div>
    </>
  );
}
