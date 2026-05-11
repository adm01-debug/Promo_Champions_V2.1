import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, AlertTriangle, Target, Sparkles, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import { usePricingIntelligence, type PricingHealth } from "@/hooks/usePricingIntelligence";
import { cn } from "@/lib/utils";
import { DiscountOptimizer } from "./DiscountOptimizer";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

const healthMeta: Record<PricingHealth, { label: string; tone: string; ring: string; desc: string }> = {
  excellent: {
    label: "Excelente",
    tone: "bg-success/15 text-success border-success/30",
    ring: "ring-success/40",
    desc: "Margem protegida. Descontos sob controle.",
  },
  healthy: {
    label: "Saudável",
    tone: "bg-info/15 text-info border-info/30",
    ring: "ring-info/40",
    desc: "Pricing está em linha. Continue monitorando.",
  },
  warning: {
    label: "Atenção",
    tone: "bg-warning/15 text-warning border-warning/30",
    ring: "ring-warning/40",
    desc: "Descontos elevados em parte da carteira. Revise política.",
  },
  critical: {
    label: "Crítico",
    tone: "bg-destructive/15 text-destructive border-destructive/30",
    ring: "ring-destructive/40",
    desc: "Erosão de margem significativa. Ação imediata necessária.",
  },
};

export function PricingIntelligenceHub() {
  const [days, setDays] = useState<30 | 60 | 90>(30);
  const { data, isLoading } = usePricingIntelligence(days);

  const distribution = useMemo(
    () => (data?.distribution ?? []).map((d) => ({ ...d, revenueShort: Math.round(d.revenue) })),
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
          Sem dados de pricing disponíveis para o período.
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
          <h1 className="text-3xl font-bold font-sora tracking-tight">Pricing Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Análise de descontos, margem e elasticidade dos seus deals.
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
            <div className="font-semibold">Saúde do Pricing: {meta.label}</div>
            <div className="text-xs opacity-80">{meta.desc}</div>
          </div>
        </div>
        <Badge variant="outline" className="bg-background/40 border-current">
          {data.kpis.deals_count} deals analisados
        </Badge>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="Ticket médio" value={fmtCurrency(k.avg_ticket)} accent="text-info" />
        <KpiCard
          icon={TrendingDown}
          label="Desconto médio"
          value={fmtPct(k.avg_discount_pct)}
          accent={k.avg_discount_pct > 0.15 ? "text-warning" : "text-foreground"}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Receita perdida"
          value={fmtCurrency(k.revenue_lost)}
          accent="text-destructive"
        />
        <KpiCard
          icon={Target}
          label="Deals em alerta"
          value={`${k.alerted_deals} (${fmtPct(k.alert_ratio)})`}
          accent={k.alert_ratio > 0.2 ? "text-destructive" : "text-foreground"}
        />
      </div>

      {/* Simulator */}
      <DiscountOptimizer />

      {/* Distribution chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-sora text-lg">Distribuição de descontos</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <RTooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: any, name: any) =>
                  name === "revenue" ? fmtCurrency(Number(v)) : `${v} deals`
                }
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top discounters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-sora text-lg">Vendedores com maior desconto médio</CardTitle>
        </CardHeader>
        <CardContent>
          {data.top_discounters.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados suficientes.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Deals</TableHead>
                  <TableHead className="text-right">Ticket médio</TableHead>
                  <TableHead className="text-right">Desconto médio</TableHead>
                  <TableHead className="text-right">Receita perdida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.top_discounters.map((s) => (
                  <TableRow key={s.salesperson_id}>
                    <TableCell className="font-medium">{s.salesperson_name}</TableCell>
                    <TableCell className="text-right">{s.deals_count}</TableCell>
                    <TableCell className="text-right">{fmtCurrency(s.avg_ticket)}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          s.avg_discount_pct > 0.2
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : s.avg_discount_pct > 0.1
                              ? "bg-warning/10 text-warning border-warning/30"
                              : "bg-success/10 text-success border-success/30",
                        )}
                      >
                        {fmtPct(s.avg_discount_pct)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {fmtCurrency(s.revenue_lost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="font-sora text-lg flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-success" />
            Sugestões de reajuste de preço (IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.product_recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum produto com oportunidade clara de reajuste no período.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Deals</TableHead>
                  <TableHead className="text-right">Preço mediano</TableHead>
                  <TableHead className="text-right">Win-rate</TableHead>
                  <TableHead className="text-right">Preço sugerido</TableHead>
                  <TableHead className="text-right">Uplift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.product_recommendations.map((p) => (
                  <TableRow key={p.product_name}>
                    <TableCell className="font-medium max-w-xs truncate">{p.product_name}</TableCell>
                    <TableCell className="text-right">{p.deals_count}</TableCell>
                    <TableCell className="text-right">{fmtCurrency(p.median_price)}</TableCell>
                    <TableCell className="text-right">{fmtPct(p.win_rate)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {fmtCurrency(p.recommended_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-success/15 text-success border border-success/30">
                        +{fmtPct(p.uplift_pct)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Competitor Threats */}
      {data.competitor_threats && data.competitor_threats.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="font-sora text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Ameaças Competitivas Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.competitor_threats.map((threat) => (
                <div key={threat.product_name} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-destructive/20">
                  <div>
                    <div className="font-bold">{threat.product_name}</div>
                    <div className="text-xs text-muted-foreground">Nosso: {fmtCurrency(threat.our_price)} | Concorrente: {fmtCurrency(threat.competitor_price)}</div>
                  </div>
                  <Badge className={cn(
                    threat.threat_level === 'high' ? "bg-destructive" : "bg-warning"
                  )}>
                    Risco {threat.threat_level === 'high' ? 'Crítico' : 'Médio'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof DollarSign;
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
