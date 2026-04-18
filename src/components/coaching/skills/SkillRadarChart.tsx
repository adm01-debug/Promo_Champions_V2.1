import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useSkillSummary } from "@/hooks/coaching/useSkillGapAnalyzer";
import { SKILL_LABELS, type SkillKey } from "./skillGapHelpers";

export const SkillRadarChart: FC = () => {
  const { data, isLoading } = useSkillSummary();

  if (isLoading) return <Skeleton className="h-[360px]" />;

  const chartData = (data?.skill_avgs ?? []).map((s) => ({
    skill: SKILL_LABELS[s.skill as SkillKey] ?? s.skill,
    score: Math.round(s.avg),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Skills da Equipe</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            Sem dados ainda. Rode "Reavaliar agora".
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={chartData} outerRadius={110}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <Radar
                name="Score médio"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
