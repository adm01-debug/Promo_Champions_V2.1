import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAchievementTrends } from "@/hooks/useAchievementTrends";
import { TrendingUp, Trophy } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PERIOD_OPTIONS = [
  { value: "7", label: "7 dias" },
  { value: "14", label: "14 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
];

export function AchievementTrendChart() {
  const [days, setDays] = useState(30);
  const { data: trends, isLoading } = useAchievementTrends(days);

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução de Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução de Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Trophy className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Nenhuma conquista registrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = trends.map((t) => ({
    ...t,
    dateLabel: format(parseISO(t.date), "dd/MM", { locale: ptBR }),
  }));

  const totalGoals = trends.reduce((sum, t) => sum + t.dailyGoals, 0);
  const totalMilestones = trends.reduce((sum, t) => sum + t.streakMilestones, 0);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução de Conquistas
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rank-gold" />
                <span className="text-muted-foreground">
                  Metas: <span className="font-bold text-foreground">{totalGoals}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-warning" />
                <span className="text-muted-foreground">
                  Marcos: <span className="font-bold text-foreground">{totalMilestones}</span>
                </span>
              </div>
            </div>
          </div>
          <ToggleGroup
            type="single"
            value={String(days)}
            onValueChange={(value) => value && setDays(Number(value))}
            className="justify-start"
          >
            {PERIOD_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                size="sm"
                className="text-xs px-3"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--rank-gold))" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="hsl(var(--rank-gold))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMilestones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--status-warning))" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="hsl(var(--status-warning))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="dateLabel"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                formatter={(value: any, name: any) => {
                  const label = name === "dailyGoals" ? "Metas Batidas" : "Marcos de Sequência";
                  return [value, label];
                }}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Legend
                formatter={(value) => {
                  if (value === "dailyGoals") return "Metas Batidas";
                  if (value === "streakMilestones") return "Marcos de Sequência";
                  return value;
                }}
              />
              <Area
                type="monotone"
                dataKey="dailyGoals"
                stroke="hsl(var(--rank-gold))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGoals)"
              />
              <Area
                type="monotone"
                dataKey="streakMilestones"
                stroke="hsl(var(--status-warning))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMilestones)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
