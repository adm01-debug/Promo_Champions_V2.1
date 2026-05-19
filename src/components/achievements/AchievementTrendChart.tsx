import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAchievementTrends } from "@/hooks/gamification/useAchievementTrends";
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
    <Card variant="glass" className="bg-background/20 backdrop-blur-xl border-white/10 shadow-2xl transition-all duration-500 hover:bg-background/30 group">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <TrendingUp className="h-4 w-4 animate-pulse" />
              Evolução de Conquistas
            </CardTitle>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rank-gold shadow-glow-gold" />
                <span className="text-muted-foreground">
                  Metas: <span className="text-foreground">{totalGoals}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-status-warning shadow-glow-warning" />
                <span className="text-muted-foreground">
                  Marcos: <span className="text-foreground">{totalMilestones}</span>
                </span>
              </div>
            </div>
          </div>
          <ToggleGroup
            type="single"
            value={String(days)}
            onValueChange={(value) => value && setDays(Number(value))}
            className="justify-start bg-white/5 p-1 rounded-xl w-fit border border-white/5"
          >
            {PERIOD_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                size="sm"
                className="text-[9px] font-black uppercase tracking-widest px-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all"
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
                  <stop offset="5%" stopColor="hsl(var(--rank-gold))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--rank-gold))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMilestones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--status-warning))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--status-warning))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 900 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 900 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  fontSize: "10px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}
                itemStyle={{ padding: "2px 0" }}
                cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }}
                formatter={(value: any, name: any) => {
                  const label = name === "dailyGoals" ? "Metas Batidas" : "Marcos de Sequência";
                  return [value, label];
                }}
                labelFormatter={(label) => `Ciclo: ${label}`}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                iconType="circle"
                formatter={(value) => {
                  const label = value === "dailyGoals" ? "Metas" : "Marcos";
                  return <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>;
                }}
              />
              <Area
                type="step"
                dataKey="dailyGoals"
                stroke="hsl(var(--rank-gold))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorGoals)"
                animationDuration={1500}
              />
              <Area
                type="step"
                dataKey="streakMilestones"
                stroke="hsl(var(--status-warning))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMilestones)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}