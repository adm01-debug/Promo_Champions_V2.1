import { useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Brain, TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RechartsTooltipProps } from "@/types/recharts";

export interface CompetencyData {
  area: string;
  icon?: string;
  value: number;
  maxValue: number;
  previousValue?: number;
}

interface CompetencyRadarProps {
  data?: CompetencyData[];
  title?: string;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const DEFAULT_DATA: CompetencyData[] = [
  { area: "Prospecção", value: 72, maxValue: 100, previousValue: 65 },
  { area: "Negociação", value: 85, maxValue: 100, previousValue: 80 },
  { area: "Fechamento", value: 60, maxValue: 100, previousValue: 55 },
  { area: "Follow-up", value: 90, maxValue: 100, previousValue: 85 },
  { area: "Qualificação", value: 78, maxValue: 100, previousValue: 70 },
  { area: "Apresentação", value: 65, maxValue: 100, previousValue: 62 },
];


const renderCustomTooltip = ({ active, payload }: RechartsTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as CompetencyData;
    const percentage = Math.round((data.value / data.maxValue) * 100);
    const status =
      percentage >= 70
        ? { label: "Excelente", color: "text-success" }
        : percentage >= 40
        ? { label: "Em Desenvolvimento", color: "text-warning" }
        : { label: "Gap Identificado", color: "text-destructive" };

    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm">
          {data.icon} {data.area}
        </p>
        <p className="text-xs text-muted-foreground">
          Nível: <span className="font-medium">{data.value}/{data.maxValue}</span>
        </p>
        <p className={cn("text-xs font-medium", status.color)}>
          Status: {status.label}
        </p>
      </div>
    );
  }
  return null;
};

export function CompetencyRadar({
  data: externalData,
  title = "Radar de Competências",
  showDetails = true,
  compact = false,
  className,
}: CompetencyRadarProps) {
  const [showComparison, setShowComparison] = useState(false);
  const data = externalData || DEFAULT_DATA;

  const chartData = data.map((d) => ({
    subject: d.area,
    value: d.value,
    maxValue: d.maxValue,
    previousValue: d.previousValue || 0,
    fullMark: d.maxValue,
    icon: d.icon,
    area: d.area,
  }));

  const avgScore = Math.round(
    data.reduce((sum, d) => sum + (d.value / d.maxValue) * 100, 0) / data.length
  );

  const improvements = data.filter(
    (d) => d.previousValue && d.value > d.previousValue
  ).length;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={avgScore >= 70 ? "default" : avgScore >= 40 ? "secondary" : "destructive"}
              className="text-[10px]"
            >
              <Target className="h-3 w-3 mr-1" />
              {avgScore}% média
            </Badge>
            {data.some((d) => d.previousValue !== undefined) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowComparison(!showComparison)}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                {showComparison ? "Esconder" : "Comparar"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={compact ? "h-48" : "h-64"}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, "dataMax"]}
                tick={false}
                axisLine={false}
              />

              {showComparison && (
                <Radar
                  name="Anterior"
                  dataKey="previousValue"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.1}
                  strokeDasharray="5 5"
                />
              )}

              <Radar
                name="Atual"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.25}
                strokeWidth={2}
              />

              <Tooltip content={renderCustomTooltip} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {showDetails && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {data.map((item, index) => {
              const percentage = Math.round((item.value / item.maxValue) * 100);
              const change = item.previousValue
                ? item.value - item.previousValue
                : 0;

              return (
                <motion.div
                  key={item.area}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 text-xs p-2 rounded border"
                >
                  <span>{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.area}</p>
                    <p className="text-muted-foreground">{percentage}%</p>
                  </div>
                  {change !== 0 && (
                    <span className={cn(
                      "flex items-center gap-0.5",
                      change > 0 ? "text-success" : "text-destructive"
                    )}>
                      {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {change > 0 ? "+" : ""}{change}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
