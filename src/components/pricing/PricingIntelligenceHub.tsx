import { useMemo, useState, lazy, Suspense } from "react";
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
const DiscountOptimizer = lazy(() => import("./DiscountOptimizer").then(m => ({ default: m.DiscountOptimizer })));
const PriceElasticityChart = lazy(() => import("./PriceElasticityChart").then(m => ({ default: m.PriceElasticityChart })));
const RevenueLeakageCard = lazy(() => import("./RevenueLeakageCard").then(m => ({ default: m.RevenueLeakageCard })));

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
  const [days, setDays] = useState<7 | 30 | 90>(30);
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
    <div className="space-y-8 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-info/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sora tracking-tight">Pricing Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Análise de descontos, margem e elasticidade dos seus deals.
          </p>
        </div>
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v) as 7 | 30 | 90)}>
          <TabsList>
            <TabsTrigger value="7">7 dias</TabsTrigger>
            <TabsTrigger value="30">30 dias</TabsTrigger>
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
        <KpiCard 
          icon={DollarSign} 
          label="Ticket médio" 
          value={fmtCurrency(k.avg_ticket)} 
          numericValue={k.avg_ticket}
          isCurrency
          accent="text-info" 
        />
        <KpiCard
          icon={TrendingDown}
          label="Desconto médio"
          value={fmtPct(k.avg_discount_pct)}
          numericValue={k.avg_discount_pct * 100}
          isPercent
          accent={k.avg_discount_pct > 0.15 ? "text-warning" : "text-foreground"}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Receita perdida"
          value={fmtCurrency(k.revenue_lost)}
          numericValue={k.revenue_lost}
          isCurrency
          accent="text-destructive"
        />
        <KpiCard
          icon={Target}
          label="Deals em alerta"
          value={`${k.alerted_deals} (${fmtPct(k.alert_ratio)})`}
          numericValue={k.alerted_deals}
          accent={k.alert_ratio > 0.2 ? "text-destructive" : "text-foreground"}
        />
      </div>

      {/* Revenue Leakage Map */}
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
        <RevenueLeakageCard 
          totalLost={k.revenue_lost}
          discountLost={k.revenue_lost * 0.55}
          competitorLost={k.revenue_lost * 0.30}
          marginErosion={k.revenue_lost * 0.15}
        />
      </Suspense>

      {/* Price Elasticity Chart */}
      <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
        <PriceElasticityChart />
      </Suspense>

      {/* Simulator */}
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <DiscountOptimizer />
      </Suspense>

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

      {/* Margin Alerts - Passo 4 */}
      <Card className="glass border-warning/20 overflow-hidden">
        <CardHeader className="bg-warning/5 border-b border-warning/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-lg font-display">Alertas de Margem Crítica</CardTitle>
            </div>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              3 Ações Requeridas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {[
              { client: "Tech Solutions Inc", deal: "Enterprise License", margin: 12.5, status: "Critical", trend: "down" },
              { client: "Global Retail Ltd", deal: "Consulting Package", margin: 14.2, status: "Warning", trend: "down" },
              { client: "Alpha Systems", deal: "Support Tier 3", margin: 11.8, status: "Critical", trend: "stable" },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-1 h-10 rounded-full",
                    alert.status === "Critical" ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-warning shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  )} />
                  <div>
                    <div className="text-sm font-bold group-hover:text-primary transition-colors">{alert.client}</div>
                    <div className="text-xs text-muted-foreground">{alert.deal}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className={cn(
                      "text-sm font-black font-mono",
                      alert.status === "Critical" ? "text-destructive" : "text-warning"
                    )}>
                      {alert.margin}%
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Margem Real</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold border-white/10 bg-white/5 hover:bg-primary hover:text-primary-foreground transition-all">
                    REVISAR DEAL
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  numericValue,
  isCurrency = false,
  isPercent = false,
  accent,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  numericValue: number;
  isCurrency?: boolean;
  isPercent?: boolean;
  accent: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="glass overflow-hidden border-white/5 relative group">
        <div className={cn(
          "absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
          accent.includes("success") ? "bg-success" : accent.includes("destructive") ? "bg-destructive" : "bg-primary"
        )} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">{label}</span>
            <div className={cn("p-2 rounded-lg bg-background/50 border border-white/5", accent)}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className={cn("text-3xl font-black font-display tracking-tight", accent)}>
              <CountUp 
                value={numericValue} 
                prefix={isCurrency ? "R$ " : ""} 
                suffix={isPercent ? "%" : ""} 
                decimals={isPercent ? 1 : 0}
              />
            </div>
            {isPercent && numericValue > 15 && (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-warning font-bold">
                <AlertTriangle className="h-3 w-3" />
                ACIMA DO BENCHMARK
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const CountUp = ({ value, prefix = "", suffix = "", decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useMemo(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = progress * (end - start) + start;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString("pt-BR", { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
      })}
      {suffix}
    </span>
  );
};
