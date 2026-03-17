import { useMemo } from "react";
import { useWeightedForecast } from "@/hooks/useWeightedForecast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Target,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  BarChart3,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

const STAGE_COLORS = [
  "hsl(var(--muted-foreground))",
  "hsl(var(--primary))",
  "hsl(45, 93%, 47%)",
  "hsl(142, 71%, 45%)",
];

export function WeightedForecastDashboard() {
  const { data, isLoading } = useWeightedForecast();

  const funnelData = useMemo(() => {
    if (!data) return [];
    return data.stages.map((s, i) => ({
      name: s.label,
      value: s.weighted_value,
      total: s.total_value,
      count: s.count,
      fill: STAGE_COLORS[i] || "hsl(var(--muted))",
    }));
  }, [data]);

  const topDeals = useMemo(() => {
    if (!data) return [];
    return data.deals.slice(0, 10);
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 lg:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const goalProgress = data.monthlyGoal > 0 ? Math.round((data.currentRevenue / data.monthlyGoal) * 100) : 0;

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Forecast Ponderado</h1>
          <p className="text-sm text-muted-foreground">Previsão de receita baseada em probabilidade × valor</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              Forecast Ponderado
            </div>
            <p className="text-xl font-bold text-primary">{formatCurrency(data.weightedForecast)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">de {formatCurrency(data.totalPipeline)} no pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Target className="h-3.5 w-3.5" />
              Meta do Mês
            </div>
            <p className="text-xl font-bold">{formatCurrency(data.monthlyGoal)}</p>
            <Progress value={goalProgress} className="h-1.5 mt-2" />
            <p className="text-[10px] text-muted-foreground mt-1">{goalProgress}% atingido</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-status-success" />
              Melhor Cenário
            </div>
            <p className="text-xl font-bold text-status-success">{formatCurrency(data.bestCase)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">otimista (+30%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <ArrowDownRight className="h-3.5 w-3.5 text-status-error" />
              Pior Cenário
            </div>
            <p className="text-xl font-bold text-status-error">{formatCurrency(data.worstCase)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">conservador (-40%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Gauge className="h-3.5 w-3.5" />
              Confiança
            </div>
            <p className={cn("text-xl font-bold",
              data.confidenceScore >= 70 ? "text-status-success" :
              data.confidenceScore >= 40 ? "text-status-warning" : "text-status-error"
            )}>
              {data.confidenceScore}%
            </p>
            <Progress value={data.confidenceScore} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Stage Breakdown Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Pipeline por Stage (Ponderado vs Total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} className="text-xs" />
                <YAxis type="category" dataKey="name" width={90} className="text-xs" />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                />
                <Bar dataKey="total" name="Valor Total" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="value" name="Valor Ponderado" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stage Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Distribuição do Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.stages.map((stage, i) => {
                const pct = data.totalPipeline > 0 ? Math.round((stage.total_value / data.totalPipeline) * 100) : 0;
                return (
                  <div key={stage.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STAGE_COLORS[i] }} />
                        <span className="font-medium">{stage.label}</span>
                        <Badge variant="outline" className="text-[10px] h-4">{stage.count} deals</Badge>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{formatCurrency(stage.weighted_value)}</span>
                        <span className="text-muted-foreground text-xs ml-1">({Math.round(stage.probability * 100)}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: STAGE_COLORS[i] }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Total: {formatCurrency(stage.total_value)}</span>
                      <span>{pct}% do pipeline</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border/50">
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-lg font-bold">{formatCurrency(data.avgDealSize)}</p>
                <p className="text-[10px] text-muted-foreground">Ticket Médio</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-lg font-bold">{data.avgCloseTime}d</p>
                </div>
                <p className="text-[10px] text-muted-foreground">Tempo Médio no Stage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Deals Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Top 10 Deals por Valor Ponderado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {topDeals.map((deal, i) => (
                <div key={deal.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-border/30">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{deal.client_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{deal.product_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(deal.weighted_value)}</p>
                    <p className="text-[10px] text-muted-foreground">{formatCurrency(deal.amount)} × {Math.round(deal.probability * 100)}%</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px] h-4">
                      {deal.days_in_stage}d
                    </Badge>
                    {deal.days_in_stage > 30 && (
                      <AlertTriangle className="h-3 w-3 text-status-warning" />
                    )}
                  </div>
                  {deal.lead_score !== null && (
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      deal.lead_score >= 70 ? "bg-status-success/20 text-status-success" :
                      deal.lead_score >= 40 ? "bg-status-warning/20 text-status-warning" :
                      "bg-status-error/20 text-status-error"
                    )}>
                      {deal.lead_score}
                    </div>
                  )}
                </div>
              ))}
              {topDeals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum deal ativo no pipeline</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
