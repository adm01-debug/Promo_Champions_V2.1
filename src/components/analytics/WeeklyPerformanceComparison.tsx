import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Zap, Target, Award, Flame, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WeeklyMetrics {
  revenue: number;
  salesCount: number;
  conversionRate: number;
  avgTicket: number;
  activitiesCount: number;
  newClients: number;
}

interface WeeklyPerformanceComparisonProps {
  currentWeek?: WeeklyMetrics;
  previousWeek?: WeeklyMetrics;
  className?: string;
}

const DEFAULT_CURRENT: WeeklyMetrics = { revenue: 45000, salesCount: 12, conversionRate: 32, avgTicket: 3750, activitiesCount: 48, newClients: 8 };
const DEFAULT_PREVIOUS: WeeklyMetrics = { revenue: 38000, salesCount: 10, conversionRate: 28, avgTicket: 3800, activitiesCount: 42, newClients: 6 };

function getChangePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function ChangeIndicator({ current, previous, suffix = "" }: { current: number; previous: number; suffix?: string }) {
  const change = getChangePercent(current, previous);
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <span className={cn(
      "flex items-center gap-0.5 text-[10px] font-medium",
      isPositive && "text-success",
      !isPositive && !isNeutral && "text-destructive",
      isNeutral && "text-muted-foreground"
    )}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> :
       isNeutral ? <Minus className="h-3 w-3" /> :
       <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}{change}%{suffix}
    </span>
  );
}

export function WeeklyPerformanceComparison({
  currentWeek = DEFAULT_CURRENT,
  previousWeek = DEFAULT_PREVIOUS,
  className,
}: WeeklyPerformanceComparisonProps) {
  const metrics = useMemo(() => [
    {
      label: "Receita",
      icon: Zap,
      current: currentWeek.revenue,
      previous: previousWeek.revenue,
      format: (v: number) => `R$ ${v.toLocaleString("pt-BR")}`,
      color: "text-primary",
    },
    {
      label: "Vendas",
      icon: Target,
      current: currentWeek.salesCount,
      previous: previousWeek.salesCount,
      format: (v: number) => v.toString(),
      color: "text-info",
    },
    {
      label: "Conversão",
      icon: Award,
      current: currentWeek.conversionRate,
      previous: previousWeek.conversionRate,
      format: (v: number) => `${v.toFixed(1)}%`,
      color: "text-success",
    },
    {
      label: "Ticket Médio",
      icon: BarChart3,
      current: currentWeek.avgTicket,
      previous: previousWeek.avgTicket,
      format: (v: number) => `R$ ${v.toLocaleString("pt-BR")}`,
      color: "text-primary",
    },
    {
      label: "Atividades",
      icon: Flame,
      current: currentWeek.activitiesCount,
      previous: previousWeek.activitiesCount,
      format: (v: number) => v.toString(),
      color: "text-streak",
    },
    {
      label: "Novos Clientes",
      icon: TrendingUp,
      current: currentWeek.newClients,
      previous: previousWeek.newClients,
      format: (v: number) => v.toString(),
      color: "text-info",
    },
  ], [currentWeek, previousWeek]);

  const overallChange = useMemo(() => {
    const totalCurrent = currentWeek.revenue + currentWeek.salesCount * 100;
    const totalPrevious = previousWeek.revenue + previousWeek.salesCount * 100;
    return getChangePercent(totalCurrent, totalPrevious);
  }, [currentWeek, previousWeek]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Comparativo Semanal
          </CardTitle>
          <Badge
            variant={overallChange >= 0 ? "default" : "destructive"}
            className="text-[10px]"
          >
            {overallChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {overallChange >= 0 ? "+" : ""}{overallChange}% geral
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const change = getChangePercent(metric.current, metric.previous);

            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-3 rounded-lg border bg-card",
                  change > 0 && "border-green-500/20",
                  change < 0 && "border-destructive/20"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={cn("h-4 w-4", metric.color)} />
                  <ChangeIndicator current={metric.current} previous={metric.previous} />
                </div>
                <p className="text-lg font-bold">{metric.format(metric.current)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {metric.label} • ant: {metric.format(metric.previous)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
