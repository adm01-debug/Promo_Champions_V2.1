import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, DollarSign, Target, Activity, Zap, Award, AlertCircle, CheckCircle2, Clock, Layers,
} from "lucide-react";
import { useRevOpsHub } from "@/hooks/useRevOpsHub";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  prospecting: "Prospecção",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação",
  closed: "Fechamento",
};

const HEALTH_CONFIG = {
  excellent: { color: "bg-success/15 text-success border-success/30", icon: CheckCircle2, label: "Excelente" },
  healthy: { color: "bg-info/15 text-info border-info/30", icon: CheckCircle2, label: "Saudável" },
  warning: { color: "bg-warning/15 text-warning border-warning/30", icon: AlertCircle, label: "Atenção" },
  critical: { color: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertCircle, label: "Crítico" },
};

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export function RevOpsHub() {
  const [horizon, setHorizon] = useState(90);
  const { data, isLoading, error } = useRevOpsHub(horizon);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-2" />
          <p className="text-sm text-muted-foreground">Erro ao carregar Revenue Operations.</p>
        </CardContent>
      </Card>
    );
  }

  const healthCfg = HEALTH_CONFIG[data.health.label];
  const HealthIcon = healthCfg.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-page-title">Revenue Operations Hub</h2>
          <p className="text-sm text-muted-foreground">
            Cockpit executivo de pipeline, forecast e performance comercial
          </p>
        </div>
        <Select value={String(horizon)} onValueChange={(v) => setHorizon(Number(v))}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="60">Últimos 60 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="180">Últimos 180 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Health Banner */}
      <Card className={`border-l-4 ${healthCfg.color}`}>
        <CardContent className="p-4 flex items-start gap-4">
          <HealthIcon className="h-6 w-6 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">Saúde do Pipeline:</span>
              <Badge variant="outline" className={healthCfg.color}>{healthCfg.label}</Badge>
              <Badge variant="outline">Coverage {data.kpis.coverage_ratio.toFixed(2)}x</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{data.health.recommendation}</p>
          </div>
        </CardContent>
      </Card>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} label="Pipeline Total" value={fmtCurrency(data.kpis.total_pipeline)} color="text-primary" />
        <KPICard icon={Target} label="Forecast Ponderado" value={fmtCurrency(data.kpis.weighted_forecast)} color="text-info" />
        <KPICard icon={Award} label="Receita Fechada" value={fmtCurrency(data.kpis.closed_revenue)} color="text-success" />
        <KPICard icon={TrendingUp} label="Win Rate" value={`${data.kpis.win_rate}%`} color="text-warning" />
      </div>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <KPICard icon={Zap} label="Sales Velocity" value={fmtCurrency(data.kpis.velocity) + "/dia"} color="text-primary" />
            <KPICard icon={Clock} label="Ciclo Médio" value={`${data.kpis.cycle_days} dias`} color="text-info" />
            <KPICard icon={Activity} label="Eficiência Atividades" value={`${data.kpis.activity_efficiency}%`} color="text-success" />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Resumo de Deals</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div><div className="text-2xl font-bold text-primary">{data.deal_counts.open}</div><div className="text-xs text-muted-foreground">Abertos</div></div>
              <div><div className="text-2xl font-bold text-success">{data.deal_counts.won}</div><div className="text-xs text-muted-foreground">Ganhos</div></div>
              <div><div className="text-2xl font-bold text-destructive">{data.deal_counts.lost}</div><div className="text-xs text-muted-foreground">Perdidos</div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4" />Distribuição por Estágio</CardTitle>
              <CardDescription>Volume e valor por etapa do funil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(data.stage_distribution).map(([stage, info]) => {
                const pct = data.kpis.total_pipeline ? (info.value / data.kpis.total_pipeline) * 100 : 0;
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{STAGE_LABELS[stage] ?? stage}</span>
                      <span className="text-muted-foreground">{info.count} deals · {fmtCurrency(info.value)}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <KPICard icon={DollarSign} label="Ticket Médio" value={fmtCurrency(data.kpis.avg_deal_size)} color="text-primary" />
            <KPICard icon={CheckCircle2} label="Comissões Pagas" value={fmtCurrency(data.kpis.earned_commissions)} color="text-success" />
            <KPICard icon={Clock} label="Comissões Pendentes" value={fmtCurrency(data.kpis.pending_commissions)} color="text-warning" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
