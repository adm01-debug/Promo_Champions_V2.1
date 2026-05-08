import React from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { BarChart3, Package, TrendingUp } from "lucide-react";
import type { TooltipProps as RechartsTooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--status-success))",
  "hsl(var(--status-warning))",
  "hsl(var(--status-info))",
  "hsl(var(--status-purple))",
  "hsl(var(--destructive))",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground">{data.category}</p>
      <p className="text-muted-foreground">{data.count} produtos • R${data.revenue?.toLocaleString("pt-BR")}</p>
    </div>
  );
};

const CategoryMetrics = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["category-metrics-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category, sales_count, price");
      if (error) throw error;

      const map = new Map<string, { category: string; count: number; totalSales: number; revenue: number }>();
      (data || []).forEach((p) => {
        const cat = p.category || "Sem Categoria";
        const existing = map.get(cat) || { category: cat, count: 0, totalSales: 0, revenue: 0 };
        existing.count += 1;
        existing.totalSales += p.sales_count || 0;
        existing.revenue += (p.price || 0) * (p.sales_count || 0);
        map.set(cat, existing);
      });

      return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
    },
  });

  const totalRevenue = categories?.reduce((s, c) => s + c.revenue, 0) || 1;

  return (
    <>
      <Helmet>
        <title>Métricas por Categoria | Promo Champions</title>
        <meta name="description" content="Análise de performance de vendas por categoria de produto." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-page-title font-display">📊 Métricas por Categoria</h1>
            <p className="text-sm text-muted-foreground mt-1">Breakdown de vendas e receita por categoria de produto</p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          ) : !categories?.length ? (
            <Card className="p-8 text-center glass border-border/40">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold">Sem dados de categorias</p>
            </Card>
          ) : (
            <>
              {/* Charts Row */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <Card className="glass border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" /> Distribuição de Receita
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={categories}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="revenue"
                          nameKey="category"
                          paddingAngle={2}
                        >
                          {categories.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Bar Chart */}
                <Card className="glass border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" /> Vendas por Categoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={categories} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                        <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={100} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="totalSales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Category List */}
              <motion.div variants={itemVariants} className="space-y-2">
                {categories.map((cat, i) => {
                  const pct = ((cat.revenue / totalRevenue) * 100).toFixed(1);
                  return (
                    <Card key={cat.category} className="p-4 glass border-border/40 flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-primary-foreground"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{cat.category}</p>
                        <p className="text-xs text-muted-foreground">{cat.count} produtos • {cat.totalSales} vendas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-sm">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(cat.revenue)}
                        </p>
                        <p className="text-xs text-muted-foreground">{pct}%</p>
                      </div>
                    </Card>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default CategoryMetrics;
