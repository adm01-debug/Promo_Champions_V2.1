import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Filter, AlertTriangle, Target, DollarSign, Award } from "lucide-react";
import { AnimatedCounter, AnimatedCurrency, AnimatedPercentage } from "@/components/ui/animated-counter";
import { useFunnelComparison } from "@/hooks/reporting/useFunnelComparison";
import { formatDelta, getStageColor, getStageWidth } from "./funnelReportHelpers";

interface Props {
  defaultTimeframe?: number;
  showTimeframeSelector?: boolean;
  embedded?: boolean;
}

const TIMEFRAMES = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 60, label: "60 dias" },
  { value: 90, label: "90 dias" },
];

const DeltaBadge = ({ value, type = "abs" }: { value: number; type?: "pct" | "abs" | "currency" }) => {
  if (value === 0) return <Badge variant="outline" className="text-xs">—</Badge>;
  const positive = value > 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <Badge
      variant="outline"
      className={`text-xs gap-1 ${positive ? "text-success border-success/40 bg-success/10" : "text-destructive border-destructive/40 bg-destructive/10"}`}
    >
      <Icon className="h-3 w-3" />
      {formatDelta(value, type)}
    </Badge>
  );
};

const KpiCard = ({
  icon: Icon, label, children, delta, deltaType,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  delta?: number;
  deltaType?: "pct" | "abs" | "currency";
}) => (
  <Card className="p-4 glass border-border/40 space-y-2">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-page-title font-display text-foreground">{children}</div>
    {delta !== undefined && <DeltaBadge value={delta} type={deltaType} />}
  </Card>
);

export const FunnelReportView = memo(({
  defaultTimeframe = 30,
  showTimeframeSelector = true,
  embedded = false,
}: Props) => {
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const { data, isLoading, error } = useFunnelComparison(timeframe);

  const chartData = useMemo(() => {
    if (!data) return [];
    const prevMap = new Map(data.previous.stages.map((s) => [s.stage, s.count]));
    return data.current.stages.map((s) => ({
      stage: s.stage,
      atual: s.count,
      anterior: prevMap.get(s.stage) ?? 0,
    }));
  }, [data]);

  const maxCount = useMemo(() => {
    if (!data?.current.stages.length) return 0;
    return Math.max(...data.current.stages.map((s) => s.count));
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <Skeleton className="h-[360px] rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 glass border-destructive/40">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm font-medium">Erro ao carregar funil</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{(error as Error).message}</p>
      </Card>
    );
  }

  if (!data || data.current.totalDeals === 0) {
    return (
      <Card className="p-12 glass border-border/40 text-center">
        <Filter className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Sem dados no período selecionado</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {showTimeframeSelector && (
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="text-xs">
            Comparando {timeframe}d atuais vs {timeframe}d anteriores
          </Badge>
          <Select value={String(timeframe)} onValueChange={(v) => setTimeframe(Number(v))}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((t) => (
                <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiCard icon={Target} label="Conversão Geral" delta={data.kpiDeltas.overallConversion} deltaType="pct">
          <AnimatedPercentage value={data.current.overallConversion} />
        </KpiCard>
        <KpiCard icon={DollarSign} label="Total Won" delta={data.kpiDeltas.totalValue} deltaType="currency">
          <AnimatedCurrency value={data.current.totalValue} />
        </KpiCard>
        <KpiCard icon={Award} label="Avg Deal Size" delta={data.kpiDeltas.avgDealSize} deltaType="currency">
          <AnimatedCurrency value={data.current.avgDealSize} />
        </KpiCard>
        <KpiCard icon={AlertTriangle} label="Top Drop-off">
          <span className="text-base">{data.current.topDropOffStage}</span>
        </KpiCard>
      </div>

      {/* Visual funnel */}
      <Card className="p-5 glass border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold">Funil Visual</h3>
          <Badge variant="secondary" className="text-xs">
            <AnimatedCounter value={data.current.wonCount} /> won · <AnimatedCounter value={data.current.totalDeals} /> deals
          </Badge>
        </div>
        <div className="space-y-2 py-2">
          {data.current.stages.map((s, i) => {
            const width = getStageWidth(s.count, maxCount);
            const color = getStageColor(i, data.current.stages.length);
            return (
              <motion.div
                key={s.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{s.stage}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {s.count} · {s.conversionRate}%
                  </span>
                </div>
                <div className="relative h-9 rounded-md overflow-hidden bg-muted/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ delay: i * 0.08 + 0.1, duration: 0.6, ease: "easeOut" }}
                    style={{ background: color }}
                    className="h-full rounded-md flex items-center px-3"
                  >
                    <span className="text-xs font-semibold text-primary-foreground mix-blend-difference">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(s.value)}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <div className={`grid grid-cols-1 ${embedded ? "" : "lg:grid-cols-2"} gap-4`}>
        {/* Comparison bar chart */}
        <Card className="p-4 glass border-border/40">
          <h3 className="text-sm font-display font-semibold mb-3">Atual vs Período Anterior</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="anterior" fill="hsl(var(--muted-foreground) / 0.5)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="atual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Drop-off table */}
        <Card className="p-4 glass border-border/40">
          <h3 className="text-sm font-display font-semibold mb-3">Drop-off por Etapa</h3>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Stage</TableHead>
                  <TableHead className="text-xs text-right">Count</TableHead>
                  <TableHead className="text-xs text-right">Conv.</TableHead>
                  <TableHead className="text-xs text-right">Drop-off</TableHead>
                  <TableHead className="text-xs text-right">Δ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.current.stages.map((s, i) => {
                  const delta = data.deltas[i];
                  return (
                    <TableRow key={s.stage}>
                      <TableCell className="text-xs font-medium">{s.stage}</TableCell>
                      <TableCell className="text-xs text-right tabular-nums">{s.count}</TableCell>
                      <TableCell className="text-xs text-right tabular-nums">{s.conversionRate}%</TableCell>
                      <TableCell className="text-xs text-right tabular-nums text-destructive">{s.dropOffRate}%</TableCell>
                      <TableCell className="text-xs text-right">
                        <DeltaBadge value={delta?.countDelta ?? 0} type="abs" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
});
FunnelReportView.displayName = "FunnelReportView";
