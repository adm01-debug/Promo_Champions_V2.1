import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useCoachingOpportunities } from "@/hooks/coaching/useCoachingOpportunities";
import { SKILL_COLORS, SKILL_LABELS } from "./coachingOpportunityHelpers";
import type { CoachingSkillFocus } from "@/hooks/coaching/useCoachingOpportunities";

export const CoachingSkillFocusChart: FC = () => {
  const { data, isLoading } = useCoachingOpportunities();

  const chart = useMemo(() => {
    const counts: Record<string, number> = {};
    (data ?? []).forEach((o) => {
      counts[o.skill_focus] = (counts[o.skill_focus] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([k, v]) => ({ skill: k as CoachingSkillFocus, label: SKILL_LABELS[k as CoachingSkillFocus] ?? k, count: v }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribuição por skill</CardTitle>
      </CardHeader>
      <CardContent>
        {chart.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sem dados.</p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chart.map((c) => (
                    <Cell key={c.skill} fill={SKILL_COLORS[c.skill]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
