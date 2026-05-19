import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievementsByPerson } from "@/hooks/gamification/useAchievementsByPerson";
import { Users, Trophy } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

export function AchievementComparisonChart() {
  const { data, isLoading } = useAchievementsByPerson();

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Conquistas por Vendedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Conquistas por Vendedor
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

  const chartData = data.slice(0, 10).map((sp) => ({
    ...sp,
    shortName: sp.name.split(" ")[0].toUpperCase(),
  }));

  return (
    <Card variant="glass" className="bg-background/20 backdrop-blur-xl border-white/10 shadow-2xl transition-all duration-500 hover:bg-background/30 group">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          <Users className="h-4 w-4 animate-pulse" />
          Conquistas por Vendedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 900 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 900 }}
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
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                formatter={(value: any, name: any) => {
                  const label = name === "dailyGoals" ? "Metas" : "Marcos";
                  return [value, label];
                }}
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
              <Bar dataKey="dailyGoals" stackId="a" fill="hsl(var(--rank-gold))" radius={[0, 0, 0, 0]} animationDuration={1500}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fillOpacity={0.8} />
                ))}
              </Bar>
              <Bar dataKey="streakMilestones" stackId="a" fill="hsl(var(--status-warning))" radius={[8, 8, 0, 0]} animationDuration={1500}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}