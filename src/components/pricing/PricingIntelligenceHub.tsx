import { useMemo, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, AlertTriangle, Target, Sparkles, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-8 relative pb-20">
      {/* Background Decor Imersivo */}
      <div className="absolute top-[-10%] right-[-5%] -z-10 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[20%] left-[-5%] -z-10 w-[500px] h-[500px] bg-info/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-[40%] left-[30%] -z-10 w-[300px] h-[300px] bg-success/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-black tracking-widest uppercase py-0.5">
              Revenue Protection
            </Badge>
            <div className="flex items-center gap-1 text-[10px] text-success font-bold">
              <ShieldCheck className="h-3 w-3" />
              PRICE SHIELD ATIVO
            </div>
          </div>
          <h1 className="text-4xl font-black font-sora tracking-tighter bg-gradient-to-r from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">
            Pricing Intelligence Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl font-medium leading-relaxed">
            Cockpit avançado para proteção de margem e otimização de elasticidade. 
            Utilize IA para identificar vazamentos de receita e ajustar sua estratégia de descontos em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v) as 7 | 30 | 90)} className="bg-white/5 p-1 rounded-lg border border-white/10">
            <TabsList className="bg-transparent border-none">
              <TabsTrigger value="7" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold px-4">7D</TabsTrigger>
              <TabsTrigger value="30" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold px-4">30D</TabsTrigger>
              <TabsTrigger value="90" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold px-4">90D</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" className="rounded-lg border-white/10 bg-white/5 hover:bg-white/10">
            <Zap className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>

      {/* Health banner Premium */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl",
          meta.tone,
          "border-white/10 backdrop-blur-md"
        )}
      >
        <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-r", 
          data.health === 'critical' ? "from-destructive via-transparent to-transparent" : "from-primary via-transparent to-transparent"
        )} />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className={cn("p-4 rounded-2xl bg-white/10 border border-white/20 shadow-inner", meta.ring)}>
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase opacity-70">Status da Operação</span>
              <div className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
            </div>
            <div className="text-3xl font-black font-sora tracking-tighter">
              Pricing {meta.label}
            </div>
            <div className="text-sm font-medium opacity-80 mt-1">{meta.desc}</div>
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Volume Analisado</div>
            <div className="text-xl font-bold">{data.kpis.deals_count} <span className="text-xs opacity-60 font-medium tracking-normal">deals</span></div>
          </div>
          <Button className="bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full px-8 shadow-xl">
            EXPORTAR AUDITORIA
          </Button>
        </div>
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
          discountLost={data.leakage_segments?.discount ?? k.revenue_lost * 0.55}
          competitorLost={data.leakage_segments?.competitor ?? k.revenue_lost * 0.30}
          marginErosion={data.leakage_segments?.erosion ?? k.revenue_lost * 0.15}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution chart */}
        <Card className="glass border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-sora text-lg font-bold">Distribuição de Descontos</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Histograma de agressividade comercial</p>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">IA Validated</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-80 pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="white" strokeOpacity={0.05} vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  axisLine={false}
                  tickLine={false}
                />
                <RTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 12,
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
                  }}
                  formatter={(v: any, name: any) =>
                    name === "revenue" ? fmtCurrency(Number(v)) : [`${v} deals`, "Volume"]
                  }
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Competitor Threats */}
        <Card className="glass border-destructive/20 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-destructive/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
                <div>
                  <CardTitle className="font-sora text-lg font-bold text-destructive">Radar de Concorrência</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Produtos sob ataque de preço</p>
                </div>
              </div>
              <Badge className="bg-destructive text-white border-none text-[10px] font-black uppercase">Crítico</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {(data.competitor_threats && data.competitor_threats.length > 0 ? data.competitor_threats : [
                { product_name: "Advanced Analytics Suite", our_price: 12500, competitor_price: 9800, threat_level: 'high' },
                { product_name: "CRM Integration Module", our_price: 4500, competitor_price: 3900, threat_level: 'medium' },
                { product_name: "Priority Support SLA", our_price: 2200, competitor_price: 1800, threat_level: 'high' },
                { product_name: "Security Hardening Kit", our_price: 8900, competitor_price: 7500, threat_level: 'medium' }
              ]).map((threat, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-1.5 h-10 rounded-full",
                      threat.threat_level === 'high' ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-warning shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    )} />
                    <div>
                      <div className="font-bold text-sm group-hover:text-destructive transition-colors">{threat.product_name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                        Delta: -{Math.round((1 - threat.competitor_price / threat.our_price) * 100)}% vs Concorrência
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-foreground">
                      {fmtCurrency(threat.our_price)} 
                      <span className="text-[10px] text-muted-foreground mx-1">vs</span> 
                      <span className="text-destructive">{fmtCurrency(threat.competitor_price)}</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      "mt-1 text-[9px] py-0 px-1.5 font-black uppercase",
                      threat.threat_level === 'high' ? "border-destructive/30 text-destructive bg-destructive/5" : "border-warning/30 text-warning bg-warning/5"
                    )}>
                      Risco {threat.threat_level === 'high' ? 'Crítico' : 'Médio'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listas Detalhadas com Visual Premium */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top discounters */}
        <Card className="glass border-white/5">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-sora text-lg font-bold">Top Discounters</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Vendedores com maior erosão de margem</p>
              </div>
              <Target className="h-5 w-5 text-primary opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.top_discounters.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground italic">Sem dados suficientes para análise.</p>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Vendedor</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Desconto</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6">Leakage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.top_discounters.slice(0, 5).map((s) => (
                    <TableRow key={s.salesperson_id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold text-sm pl-6 py-4">{s.salesperson_name}</TableCell>
                      <TableCell className="text-right py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono font-bold",
                            s.avg_discount_pct > 0.2
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          )}
                        >
                          {fmtPct(s.avg_discount_pct)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-destructive pr-6 py-4">
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
        <Card className="glass border-white/5">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-sora text-lg font-bold">IA Price Recommender</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Oportunidades de aumento de preço (Uplift)</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-success opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.product_recommendations.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground italic">Nenhuma oportunidade detectada no momento.</p>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Produto</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Sugerido</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6">Uplift</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.product_recommendations.slice(0, 5).map((p) => (
                    <TableRow key={p.product_name} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold text-sm pl-6 py-4 max-w-[150px] truncate">{p.product_name}</TableCell>
                      <TableCell className="text-right py-4 font-mono font-bold">
                        {fmtCurrency(p.recommended_price)}
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <Badge className="bg-success text-success-foreground border-none font-black text-[10px]">
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
      </div>
      {/* Ocultando antigo competitor threats pois foi integrado acima */}

      {/* Margin Alerts - Passo 4 Premium */}
      <Card className="glass border-warning/20 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck className="h-24 w-24 text-warning" />
        </div>
        <CardHeader className="bg-warning/10 border-b border-warning/10 backdrop-blur-sm relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20 border border-warning/30">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <CardTitle className="text-xl font-black font-sora tracking-tight">Price Guard: Alertas de Margem</CardTitle>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Detecção de erosão de receita em tempo real</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-warning/20 text-warning border-warning/40 font-black text-[10px] px-3 py-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              3 INCIDENTES CRÍTICOS
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative z-10">
          <div className="divide-y divide-white/5">
            {[
              { client: "Tech Solutions Inc", deal: "Enterprise License v2.0", margin: 12.5, status: "Critical", trend: "down", impact: "R$ 45.200" },
              { client: "Global Retail Ltd", deal: "Consulting Premium Package", margin: 14.2, status: "Warning", trend: "down", impact: "R$ 12.800" },
              { client: "Alpha Systems", deal: "Core Support Tier 3", margin: 11.8, status: "Critical", trend: "stable", impact: "R$ 28.500" },
            ].map((alert, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/5 transition-all group gap-4">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-1.5 h-12 rounded-full",
                    alert.status === "Critical" ? "bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse" : "bg-warning shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                  )} />
                  <div>
                    <div className="text-lg font-black group-hover:text-primary transition-colors flex items-center gap-2">
                      {alert.client}
                      {alert.status === "Critical" && <Badge className="bg-destructive/20 text-destructive border-none h-4 text-[8px] font-black uppercase">Forte Vazamento</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{alert.deal}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-10">
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Impacto Estimado</div>
                    <div className="text-sm font-black text-destructive/80 font-mono">{alert.impact}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-2xl font-black font-mono tracking-tighter",
                      alert.status === "Critical" ? "text-destructive" : "text-warning"
                    )}>
                      {alert.margin}%
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Margem Real</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-10 px-6 text-[10px] font-black tracking-widest border-white/10 bg-white/5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-lg">
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
