import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Activity, RefreshCw, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RollbackPoint {
  captured_at: string;
  xact_commit: number;
  xact_rollback: number;
  deadlocks: number;
  rollbacks_per_min: number;
  commits_per_min: number;
  rollback_ratio_pct: number;
}

/** Limite acima do qual o sistema deve alertar (rollbacks/min). */
const ROLLBACK_ALERT_THRESHOLD = 50;

async function fetchSeries(hours: number): Promise<RollbackPoint[]> {
  const { data, error } = await supabase.rpc("admin_get_rollback_rate_series", {
    _hours: hours,
  });
  if (error) throw error;
  return (data ?? []) as RollbackPoint[];
}

export function DbRollbackRatePanel() {
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["admin", "db-rollback-rate", 24],
    queryFn: () => fetchSeries(24),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });

  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return { current: 0, peak: 0, avg: 0, ratio: 0, points: 0, deadlocks: 0 };
    }
    // Ignora o 1º ponto (LAG null → rate 0 artificial)
    const meaningful = data.slice(1);
    if (meaningful.length === 0) {
      return { current: 0, peak: 0, avg: 0, ratio: 0, points: data.length, deadlocks: 0 };
    }
    const rates = meaningful.map((p) => Number(p.rollbacks_per_min) || 0);
    const _ratios = meaningful.map((p) => Number(p.rollback_ratio_pct) || 0);
    const last = meaningful[meaningful.length - 1];
    const peak = rates.reduce((m, r) => (r > m ? r : m), 0);
    const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
    const lastRatio = Number(last?.rollback_ratio_pct) || 0;
    const deadlocks = last.deadlocks - (data[0].deadlocks ?? 0);
    return {
      current: Number(last?.rollbacks_per_min) || 0,
      peak,
      avg: Math.round(avg * 100) / 100,
      ratio: lastRatio,
      points: data.length,
      deadlocks: Math.max(0, deadlocks),
    };
  }, [data]);

  const chartData = useMemo(
    () =>
      (data ?? []).slice(1).map((p) => ({
        time: format(new Date(p.captured_at), "HH:mm", { locale: ptBR }),
        rate: Number(p.rollbacks_per_min) || 0,
        ratio: Number(p.rollback_ratio_pct) || 0,
      })),
    [data],
  );

  const isAlerting = stats.peak >= ROLLBACK_ALERT_THRESHOLD;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              isAlerting ? "bg-destructive/10" : "bg-primary/10",
            )}
          >
            {isAlerting ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <Activity className="h-4 w-4 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              Taxa de Rollback (últimas 24h)
              {isAlerting ? (
                <Badge variant="destructive" className="text-[10px]">
                  Pico alto
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  Saudável
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Snapshots a cada 5 minutos · alerta em ≥ {ROLLBACK_ALERT_THRESHOLD}/min
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Atual" value={`${stats.current}/min`} accent={stats.current >= ROLLBACK_ALERT_THRESHOLD} />
          <StatTile label="Pico 24h" value={`${stats.peak}/min`} accent={isAlerting} />
          <StatTile label="Média 24h" value={`${stats.avg}/min`} />
          <StatTile label="Deadlocks 24h" value={`${stats.deadlocks}`} accent={stats.deadlocks > 0} />
        </div>

        {isLoading ? (
          <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
            Carregando série…
          </div>
        ) : error ? (
          <div className="h-[180px] flex items-center justify-center text-sm text-destructive">
            Falha ao carregar série de rollbacks.
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[180px] flex flex-col items-center justify-center text-sm text-muted-foreground gap-1">
            <TrendingUp className="h-5 w-5 opacity-50" />
            Aguardando ao menos 2 snapshots (10 minutos).
          </div>
        ) : (
          <div className="h-[180px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rollbackFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={32} />
                <RTooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name) => [
                    name === "rate" ? `${value}/min` : `${value}%`,
                    name === "rate" ? "Rollbacks" : "Ratio",
                  ]}
                />
                <ReferenceLine
                  y={ROLLBACK_ALERT_THRESHOLD}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="4 4"
                  label={{
                    value: `alerta ${ROLLBACK_ALERT_THRESHOLD}/min`,
                    fontSize: 10,
                    fill: "hsl(var(--destructive))",
                    position: "insideTopRight",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#rollbackFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        accent ? "border-destructive/40 bg-destructive/5" : "border-border bg-muted/20",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-lg font-semibold tabular-nums mt-0.5",
          accent && "text-destructive",
        )}
      >
        {value}
      </div>
    </div>
  );
}
