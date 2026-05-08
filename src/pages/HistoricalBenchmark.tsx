import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, ArrowRight, Calendar, Minus } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TooltipProps as RechartsTooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

type Period = "mom" | "qoq" | "yoy";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-muted-foreground">
          {entry.name}: <span className="font-semibold text-foreground">
            {typeof entry.value === "number" ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
};

const HistoricalBenchmark = () => {
  const [period, setPeriod] = useState<Period>("mom");

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["historical-benchmark"],
    queryFn: async () => {
      const now = new Date();
      const from = subMonths(now, 13);
      const { data, error } = await supabase
        .from("sales")
        .select("id, amount, status, created_at")
        .gte("created_at", from.toISOString())
        .order("created_at");
      if (error) throw error;
      return data || [];
    },
  });

  const monthlyData = useMemo(() => {
    if (!salesData?.length) return [];
    const months = new Map<string, { revenue: number; deals: number; won: number }>();
    salesData.forEach(s => {
      const key = format(new Date(s.created_at), "yyyy-MM");
      const m = months.get(key) || { revenue: 0, deals: 0, won: 0 };
      m.deals += 1;
      if (s.status === "completed" || s.status === "won") {
        m.revenue += s.amount || 0;
        m.won += 1;
      }
      months.set(key, m);
    });
    return Array.from(months.entries()).sort().map(([key, v]) => ({
      month: key,
      label: format(new Date(key + "-01"), "MMM yy", { locale: ptBR }),
      ...v,
      winRate: v.deals > 0 ? (v.won / v.deals) * 100 : 0,
    }));
  }, [salesData]);

  const comparisons = useMemo(() => {
    if (monthlyData.length < 2) return [];
    const offset = period === "mom" ? 1 : period === "qoq" ? 3 : 12;
    return monthlyData.slice(offset).map((curr, i) => {
      const prev = monthlyData[i];
      if (!prev) return null;
      const revChange = prev.revenue > 0 ? ((curr.revenue - prev.revenue) / prev.revenue) * 100 : 0;
      const dealChange = prev.deals > 0 ? ((curr.deals - prev.deals) / prev.deals) * 100 : 0;
      const wrChange = curr.winRate - prev.winRate;
      return { ...curr, prevRevenue: prev.revenue, prevDeals: prev.deals, revChange, dealChange, wrChange };
    }).filter(Boolean);
  }, [monthlyData, period]);

  const kpis = useMemo(() => {
    if (!comparisons.length) return null;
    const latest = comparisons[comparisons.length - 1]!;
    return latest;
  }, [comparisons]);

  const KPICard = ({ label, value, change, prefix = "" }: { label: string; value: string; change: number; prefix?: string }) => {
    const isPositive = change > 0;
    const isNeutral = Math.abs(change) < 0.5;
    return (
      <Card className="glass border-border/40 p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display font-bold text-xl mt-1">{prefix}{value}</p>
        <div className={cn("flex items-center gap-1 mt-1", isNeutral ? "text-muted-foreground" : isPositive ? "text-status-success" : "text-destructive")}>
          {isNeutral ? <Minus className="h-3 w-3" /> : isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span className="text-xs font-medium">{change > 0 ? "+" : ""}{change.toFixed(1)}%</span>
          <span className="text-[10px] text-muted-foreground ml-1">
            vs {period === "mom" ? "mês ant." : period === "qoq" ? "trim. ant." : "ano ant."}
          </span>
        </div>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Benchmarking Histórico | Promo Champions</title>
        <meta name="description" content="Compare KPIs de vendas entre períodos: MoM, QoQ e YoY." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-page-title font-display">📊 Benchmarking Histórico</h1>
              <p className="text-sm text-muted-foreground mt-1">Comparação de KPIs entre períodos</p>
            </div>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mom">Mês a Mês (MoM)</SelectItem>
                <SelectItem value="qoq">Trimestre (QoQ)</SelectItem>
                <SelectItem value="yoy">Ano a Ano (YoY)</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : kpis ? (
            <>
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard label="Receita" value={new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(kpis.revenue)} change={kpis.revChange} prefix="R$" />
                <KPICard label="Total de Deals" value={String(kpis.deals)} change={kpis.dealChange} />
                <KPICard label="Win Rate" value={`${kpis.winRate.toFixed(1)}%`} change={kpis.wrChange} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" /> Evolução de Receita
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="revenue" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : (
            <Card className="p-8 text-center glass border-border/40">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold">Dados insuficientes para comparação</p>
            </Card>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default HistoricalBenchmark;
