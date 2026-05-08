import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePriceHistory, usePriceAlerts } from "@/hooks/usePriceHistory";
import { useProducts } from "@/hooks/useProducts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Bell, BellOff, ArrowUpDown, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TooltipProps as RechartsTooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span style={{ color: entry.color }}>{entry.name}</span>:{" "}
          <span className="font-semibold text-foreground">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(entry.value))}
          </span>
        </p>
      ))}
    </div>
  );
};

const PriceEvolution = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: history, isLoading: historyLoading } = usePriceHistory(selectedProduct || undefined);
  const { alerts, unreadCount, markAsRead, markAllAsRead } = usePriceAlerts();

  const chartData = React.useMemo(() => {
    if (!history?.length) return [];
    const grouped = new Map<string, { date: string; [supplier: string]: number | string }>();
    history.forEach((h) => {
      const dateKey = format(new Date(h.recorded_at), "dd/MM", { locale: ptBR });
      const supplierName = h.suppliers?.name || "Fornecedor";
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, { date: dateKey });
      }
      grouped.get(dateKey)![supplierName] = h.new_price;
    });
    return Array.from(grouped.values());
  }, [history]);

  const supplierNames = React.useMemo(() => {
    if (!history?.length) return [];
    const names = new Set<string>();
    history.forEach((h) => names.add(h.suppliers?.name || "Fornecedor"));
    return Array.from(names);
  }, [history]);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--status-success))", "hsl(var(--status-warning))"];

  return (
    <>
      <Helmet>
        <title>Evolução de Preços | Promo Champions</title>
        <meta name="description" content="Acompanhe a evolução de preços dos produtos e alertas de variação." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-page-title font-display">📈 Evolução de Preços</h1>
              <p className="text-sm text-muted-foreground mt-1">Histórico de variações de preço por produto e fornecedor</p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllAsRead.mutate()}>
                  <Bell className="h-4 w-4 text-status-warning" />
                  {unreadCount} alerta{unreadCount > 1 ? "s" : ""}
                </Button>
              )}
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Price Alerts */}
          {alerts.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-status-warning" /> Alertas Recentes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {alerts.slice(0, 4).map((alert) => (
                  <Card
                    key={alert.id}
                    className={cn(
                      "p-3 glass border-border/40 cursor-pointer transition-all hover-lift-sm",
                      !alert.is_read && "border-status-warning/30 bg-status-warning/5"
                    )}
                    onClick={() => !alert.is_read && markAsRead.mutate(alert.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        alert.alert_type === "price_drop" ? "bg-status-success/10" : "bg-destructive/10"
                      )}>
                        {alert.alert_type === "price_drop" ? (
                          <TrendingDown className="h-4 w-4 text-status-success" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{alert.products?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{alert.suppliers?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-xs font-bold",
                          alert.alert_type === "price_drop" ? "text-status-success" : "text-destructive"
                        )}>
                          {alert.price_change_percent != null ? `${alert.price_change_percent > 0 ? "+" : ""}${alert.price_change_percent.toFixed(1)}%` : ""}
                        </p>
                        {!alert.is_read && <Badge variant="outline" className="text-[8px] mt-0.5">Novo</Badge>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chart */}
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  Histórico de Preços
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedProduct ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                    <DollarSign className="h-8 w-8 mr-2 opacity-30" />
                    Selecione um produto para ver o gráfico
                  </div>
                ) : historyLoading ? (
                  <Skeleton className="h-64 rounded-xl" />
                ) : chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados de preço para este produto
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {supplierNames.map((name, i) => (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={COLORS[i % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* History Table */}
          {history && history.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="glass border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Últimas Variações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {history.slice(0, 10).map((h) => (
                      <div key={h.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-1.5 rounded-md",
                            h.new_price > h.old_price ? "bg-destructive/10" : "bg-status-success/10"
                          )}>
                            {h.new_price > h.old_price ? (
                              <TrendingUp className="h-3 w-3 text-destructive" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-status-success" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{h.products?.name || "Produto"}</p>
                            <p className="text-[10px] text-muted-foreground">{h.suppliers?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs">
                            <span className="text-muted-foreground line-through mr-2">
                              R${h.old_price.toFixed(2)}
                            </span>
                            <span className="font-bold text-foreground">R${h.new_price.toFixed(2)}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(h.recorded_at), "dd/MM HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default PriceEvolution;
