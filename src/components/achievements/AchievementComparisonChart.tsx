import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievementsByPerson } from "@/hooks/useAchievementsByPerson";
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
    shortName: sp.name.split(" ")[0],
  }));

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Conquistas por Vendedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="shortName"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
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
              />
              <Legend
                formatter={(value) => {
                  if (value === "dailyGoals") return "Metas Batidas";
                  if (value === "streakMilestones") return "Marcos de Sequência";
                  return value;
                }}
              />
              <Bar dataKey="dailyGoals" stackId="a" fill="hsl(var(--rank-gold))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="streakMilestones" stackId="a" fill="hsl(var(--status-warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
