import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  FileText,
  ShoppingCart,
  DollarSign,
  Users,
  Percent,
  TrendingUp,
  BarChart3,
  Crown,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useVendasMacro } from "@/hooks/useVendasMacro";
import { TopSellersRankList } from "./TopSellersRankList";

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCompact = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

interface KpiCardProps {
  icon: FC<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  variant?: "default" | "highlight" | "success";
}

const KpiCard: FC<KpiCardProps> = ({ icon: Icon, label, value, sub, variant = "default" }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center p-3 rounded-xl border text-center min-w-0 transition-all hover-scale-sm",
      variant === "highlight"
        ? "border-primary/40 bg-primary/10"
        : variant === "success"
        ? "border-success/40 bg-success/10"
        : "border-border/40 bg-muted/30"
    )}
  >
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className={cn("h-3.5 w-3.5", variant === "highlight" ? "text-primary" : variant === "success" ? "text-success" : "text-muted-foreground")} />
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
    </div>
    <p className={cn(
      "text-xl font-black font-display leading-tight",
      variant === "highlight" ? "text-primary" : variant === "success" ? "text-success" : "text-foreground"
    )}>
      {value}
    </p>
    {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-border/50 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-sm">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 justify-between">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
          <span className="font-medium">
            {entry.name === "Faturamento" ? formatCompact(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const BIVendasMacro: FC<{ className?: string }> = ({ className }) => {
  const { data, isLoading } = useVendasMacro(30);

  if (isLoading) {
    return (
      <Card className={cn("glass-card", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-20 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="h-[250px] bg-muted rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            Vendas Internas (Macro)
          </CardTitle>
          <Badge variant="outline" className="border-success/40 text-success font-bold">
            <Percent className="h-3 w-3 mr-1" />
            {data.conversionRate.toFixed(1)}% conversão
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Orçamentos vs Pedidos de toda a equipe · 30 dias
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard
            icon={FileText}
            label="Orçado (qtd)"
            value={data.totalQuoted.toLocaleString("pt-BR")}
            sub={formatCurrency(data.totalQuotedValue)}
          />
          <KpiCard
            icon={ShoppingCart}
            label="Vendido (qtd)"
            value={data.totalSold.toLocaleString("pt-BR")}
            sub={formatCurrency(data.totalSoldValue)}
            variant="highlight"
          />
          <KpiCard
            icon={DollarSign}
            label="Ticket médio"
            value={formatCurrency(data.avgTicket)}
            sub="por pedido"
          />
          <KpiCard
            icon={Users}
            label="Vendedores"
            value={String(data.activeSellers)}
            sub="ativos"
          />
          <KpiCard
            icon={Percent}
            label="Conversão"
            value={`${data.conversionRate.toFixed(1)}%`}
            sub="orç → ped"
          />
          <KpiCard
            icon={TrendingUp}
            label="Faturamento"
            value={formatCurrency(data.totalRevenue)}
            sub="total no período"
            variant="success"
          />
        </div>

        {/* Combo Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barQuoted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="barSold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="day"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="qty"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="rev"
                orientation="right"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                yAxisId="qty"
                dataKey="quoted"
                name="Qtd Orçada"
                fill="url(#barQuoted)"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
              <Bar
                yAxisId="qty"
                dataKey="sold"
                name="Qtd Vendida"
                fill="url(#barSold)"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
              <Line
                yAxisId="rev"
                type="monotone"
                dataKey="revenue"
                name="Faturamento"
                stroke="hsl(var(--success))"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--success))" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <TopSellersRankList sellers={data.topSellers} />
      </CardContent>
    </Card>
  );
};
