import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  ChevronRight,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: FC<{ className?: string }>;
  variant: "primary" | "success" | "warning" | "info";
  breakdown: MetricBreakdown[];
  trend: TrendPoint[];
}

interface MetricBreakdown {
  label: string;
  value: string;
  percentage: number;
}

interface TrendPoint {
  label: string;
  value: number;
}

interface MetricsDrilldownProps {
  className?: string;
}

export const MetricsDrilldown: FC<MetricsDrilldownProps> = ({ className }) => {
  const { data: kpis } = useDashboardKPIs();
  const [selectedMetric, setSelectedMetric] = useState<MetricCard | null>(null);

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const metrics: MetricCard[] = [
    {
      id: "revenue",
      title: "Receita Total",
      value: formatCurrency(kpis?.current.totalRevenue ?? 0),
      change: kpis?.changes.revenue ?? 0,
      changeLabel: "vs mês anterior",
      icon: DollarSign,
      variant: "primary",
      breakdown: [
        { label: "Novos Clientes", value: formatCurrency(45000), percentage: 35 },
        { label: "Upsell", value: formatCurrency(32000), percentage: 25 },
        { label: "Cross-sell", value: formatCurrency(25000), percentage: 20 },
        { label: "Renovações", value: formatCurrency(26000), percentage: 20 },
      ],
      trend: [
        { label: "Jan", value: 85000 },
        { label: "Fev", value: 92000 },
        { label: "Mar", value: 88000 },
        { label: "Abr", value: 105000 },
        { label: "Mai", value: 115000 },
        { label: "Jun", value: 128000 },
      ],
    },
    {
      id: "deals",
      title: "Deals no Pipeline",
      value: String(kpis?.current.newDeals ?? 0),
      change: kpis?.changes.deals ?? 0,
      changeLabel: "novos esta semana",
      icon: Target,
      variant: "success",
      breakdown: [
        { label: "Qualificação", value: "12", percentage: 30 },
        { label: "Proposta", value: "8", percentage: 20 },
        { label: "Negociação", value: "15", percentage: 38 },
        { label: "Fechamento", value: "5", percentage: 12 },
      ],
      trend: [
        { label: "Jan", value: 32 },
        { label: "Fev", value: 28 },
        { label: "Mar", value: 35 },
        { label: "Abr", value: 42 },
        { label: "Mai", value: 38 },
        { label: "Jun", value: 40 },
      ],
    },
    {
      id: "conversion",
      title: "Taxa de Conversão",
      value: `${kpis?.current.conversionRate ?? 0}%`,
      change: 2.5,
      changeLabel: "pontos percentuais",
      icon: TrendingUp,
      variant: "info",
      breakdown: [
        { label: "SDRs", value: "18%", percentage: 45 },
        { label: "Closers", value: "32%", percentage: 80 },
        { label: "Gestão", value: "45%", percentage: 100 },
      ],
      trend: [
        { label: "Jan", value: 22 },
        { label: "Fev", value: 24 },
        { label: "Mar", value: 21 },
        { label: "Abr", value: 26 },
        { label: "Mai", value: 28 },
        { label: "Jun", value: 27 },
      ],
    },
    {
      id: "team",
      title: "Equipe Ativa",
      value: "8",
      change: 0,
      changeLabel: "vendedores",
      icon: Users,
      variant: "warning",
      breakdown: [
        { label: "SDRs", value: "4", percentage: 50 },
        { label: "Closers", value: "3", percentage: 37.5 },
        { label: "Gestores", value: "1", percentage: 12.5 },
      ],
      trend: [
        { label: "Jan", value: 6 },
        { label: "Fev", value: 7 },
        { label: "Mar", value: 7 },
        { label: "Abr", value: 8 },
        { label: "Mai", value: 8 },
        { label: "Jun", value: 8 },
      ],
    },
  ];

  const getVariantStyles = (variant: MetricCard["variant"]) => {
    switch (variant) {
      case "primary":
        return {
          bg: "bg-primary/10",
          border: "border-primary/20",
          icon: "text-primary",
          gradient: "from-primary/20 to-primary/5",
        };
      case "success":
        return {
          bg: "bg-success/10",
          border: "border-success/20",
          icon: "text-success",
          gradient: "from-success/20 to-success/5",
        };
      case "warning":
        return {
          bg: "bg-warning/10",
          border: "border-warning/20",
          icon: "text-warning",
          gradient: "from-warning/20 to-warning/5",
        };
      case "info":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          icon: "text-blue-500",
          gradient: "from-blue-500/20 to-blue-500/5",
        };
    }
  };

  return (
    <>
      <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4", className)}>
        {metrics.map((metric, index) => {
          const styles = getVariantStyles(metric.variant);
          const Icon = metric.icon;

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "glass border-border/40 cursor-pointer transition-all group",
                  "hover:shadow-lg hover:border-border/60"
                )}
                onClick={() => setSelectedMetric(metric)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-transform group-hover:scale-110",
                        styles.bg
                      )}
                    >
                      <Icon className={cn("h-5 w-5", styles.icon)} />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {metric.change >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-success" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-destructive" />
                      )}
                      <span
                        className={cn(
                          "text-xs font-medium",
                          metric.change >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {metric.change >= 0 ? "+" : ""}
                        {metric.change}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {metric.changeLabel}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Metric Drill-down Dialog */}
      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMetric && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      getVariantStyles(selectedMetric.variant).bg
                    )}
                  >
                    <selectedMetric.icon
                      className={cn(
                        "h-6 w-6",
                        getVariantStyles(selectedMetric.variant).icon
                      )}
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedMetric.title}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {selectedMetric.value}
                      </span>
                      <Badge
                        className={cn(
                          selectedMetric.change >= 0 ? "bg-success" : "bg-destructive"
                        )}
                      >
                        {selectedMetric.change >= 0 ? "+" : ""}
                        {selectedMetric.change}%
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="breakdown" className="mt-6">
                <TabsList className="w-full">
                  <TabsTrigger value="breakdown" className="flex-1">
                    <PieChart className="h-4 w-4 mr-2" />
                    Breakdown
                  </TabsTrigger>
                  <TabsTrigger value="trend" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Tendência
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="breakdown" className="mt-4">
                  <div className="space-y-4">
                    {selectedMetric.breakdown.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-muted-foreground">{item.value}</span>
                        </div>
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full",
                              "bg-gradient-to-r",
                              getVariantStyles(selectedMetric.variant).gradient
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{
                              background: `linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.5))`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                          {item.percentage}%
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="trend" className="mt-4">
                  <div className="space-y-4">
                    {/* Simple bar chart visualization */}
                    <div className="flex items-end justify-between gap-2 h-40 px-2">
                      {selectedMetric.trend.map((point, index) => {
                        const maxValue = Math.max(
                          ...selectedMetric.trend.map((p) => p.value)
                        );
                        const height = (point.value / maxValue) * 100;

                        return (
                          <motion.div
                            key={point.label}
                            className="flex-1 flex flex-col items-center gap-2"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            style={{ transformOrigin: "bottom" }}
                          >
                            <div
                              className={cn(
                                "w-full rounded-t-lg transition-all hover:opacity-80",
                                "bg-gradient-to-t",
                                getVariantStyles(selectedMetric.variant).gradient
                              )}
                              style={{
                                height: `${height}%`,
                                minHeight: "8px",
                                background: `linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary) / 0.3))`,
                              }}
                              title={`${point.label}: ${point.value}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {point.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Mínimo</p>
                        <p className="font-bold">
                          {Math.min(...selectedMetric.trend.map((p) => p.value))}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Média</p>
                        <p className="font-bold">
                          {Math.round(
                            selectedMetric.trend.reduce((a, b) => a + b.value, 0) /
                              selectedMetric.trend.length
                          )}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Máximo</p>
                        <p className="font-bold">
                          {Math.max(...selectedMetric.trend.map((p) => p.value))}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
                <Button className="flex-1">
                  <Activity className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
