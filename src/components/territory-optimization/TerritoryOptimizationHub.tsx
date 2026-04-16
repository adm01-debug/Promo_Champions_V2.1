import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Crown,
  Swords,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import {
  useTerritoryOptimization,
  type TerritoryHealth,
  type TerritoryStatus,
  type RecommendationPriority,
} from "@/hooks/useTerritoryOptimization";
import { cn } from "@/lib/utils";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);
const fmtPct = (n: number) => `${(n * 100).toFixed(0)}%`;

const healthMeta: Record<TerritoryHealth, { label: string; tone: string; ring: string; desc: string }> = {
  excellent: {
    label: "Excelente",
    tone: "bg-success/15 text-success border-success/30",
    ring: "ring-success/40",
    desc: "Cobertura e balanceamento ótimos.",
  },
  healthy: {
    label: "Saudável",
    tone: "bg-info/15 text-info border-info/30",
    ring: "ring-info/40",
    desc: "Distribuição equilibrada. Continue monitorando.",
  },
  warning: {
    label: "Atenção",
    tone: "bg-warning/15 text-warning border-warning/30",
    ring: "ring-warning/40",
    desc: "Há territórios sub-atendidos ou desbalanceamento.",
  },
  critical: {
    label: "Crítico",
    tone: "bg-destructive/15 text-destructive border-destructive/30",
    ring: "ring-destructive/40",
    desc: "Cobertura comprometida. Rebalanceamento urgente.",
  },
};

const statusMeta: Record<TerritoryStatus, { label: string; cls: string }> = {
  healthy: { label: "Saudável", cls: "bg-success/10 text-success border-success/30" },
  underserved: { label: "Sub-atendido", cls: "bg-warning/10 text-warning border-warning/30" },
  overloaded: { label: "Sobrecarga", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  stagnant: { label: "Estagnado", cls: "bg-muted text-muted-foreground border-border" },
  unowned: { label: "Sem dono", cls: "bg-destructive/10 text-destructive border-destructive/30" },
};

const priorityMeta: Record<RecommendationPriority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-info/10 text-info border-info/30",
};

export function TerritoryOptimizationHub() {
  const [days, setDays] = useState<30 | 60 | 90>(30);
  const { data, isLoading } = useTerritoryOptimization(days);

  const loadChart = useMemo(
    () =>
      (data?.salesperson_loads ?? []).slice(0, 10).map((l) => ({
        name: l.salesperson_name.split(" ")[0],
        territorios: l.territories_count,
        receita: Math.round(l.total_revenue),
      })),
    [data],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Sem dados de territórios disponíveis.
        </CardContent>
      </Card>
    );
  }

  const meta = healthMeta[data.health];
  const k = data.kpis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sora tracking-tight">Territory Optimization</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Análise de cobertura, balanceamento de carteiras e recomendações de IA.
          </p>
        </div>
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v) as 30 | 60 | 90)}>
          <TabsList>
            <TabsTrigger value="30">30 dias</TabsTrigger>
            <TabsTrigger value="60">60 dias</TabsTrigger>
            <TabsTrigger value="90">90 dias</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Health banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-xl border p-5 flex items-center justify-between gap-4 ring-1",
          meta.tone,
          meta.ring,
        )}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5" />
          <div>
            <div className="font-semibold">Saúde dos Territórios: {meta.label}</div>
            <div className="text-xs opacity-80">{meta.desc}</div>
          </div>
        </div>
        <Badge variant="outline" className="bg-background/40 border-current">
          {k.total_territories} territórios
        </Badge>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={MapPin} label="Saudáveis" value={`${k.healthy_count}/${k.total_territories}`} accent="text-success" />
        <KpiCard
          icon={AlertTriangle}
          label="Sub-atendidos"
          value={String(k.underserved_count + k.unowned_count)}
          accent={k.underserved_count + k.unowned_count > 0 ? "text-warning" : "text-foreground"}
        />
        <KpiCard
          icon={Users}
          label="Cobertura média"
          value={fmtPct(k.avg_coverage)}
          accent={k.avg_coverage < 0.5 ? "text-destructive" : "text-info"}
        />
        <KpiCard
          icon={TrendingUp}
          label="Receita potencial perdida"
          value={fmtCurrency(k.potential_revenue_lost)}
          accent="text-destructive"
        />
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-sora text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recomendações da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recommendations.map((r, idx) => (
              <motion.div
                key={`${r.type}-${idx}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card/60 hover:bg-card transition-colors"
              >
                <Badge variant="outline" className={cn("shrink-0 capitalize", priorityMeta[r.priority])}>
                  {r.priority}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.message}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    {r.expected_impact}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 capitalize text-xs">
                  {r.type.replace("_", " ")}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Load distribution chart */}
      {loadChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-sora text-lg">Distribuição de carga por vendedor</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loadChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <RTooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="territorios" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Territory table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-sora text-lg">Territórios analisados</CardTitle>
        </CardHeader>
        <CardContent>
          {data.territories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum território cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Território</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Dono</TableHead>
                  <TableHead className="text-right">Cobertura</TableHead>
                  <TableHead className="text-right">Receita recente</TableHead>
                  <TableHead className="text-right">Potencial</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.territories.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {t.territory_name}
                      {t.is_contested && <Swords className="h-3 w-3 text-destructive" />}
                    </TableCell>
                    <TableCell className="capitalize text-xs text-muted-foreground">
                      {t.territory_type}
                    </TableCell>
                    <TableCell className="text-sm">
                      {t.owner_name ? (
                        <span className="flex items-center gap-1">
                          <Crown className="h-3 w-3 text-primary" /> {t.owner_name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{fmtPct(t.coverage_score)}</TableCell>
                    <TableCell className="text-right">{fmtCurrency(t.recent_revenue)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {fmtCurrency(t.potential_revenue)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusMeta[t.status].cls)}>
                        {statusMeta[t.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
            <Icon className={cn("h-4 w-4", accent)} />
          </div>
          <div className={cn("text-2xl font-bold font-sora", accent)}>{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
