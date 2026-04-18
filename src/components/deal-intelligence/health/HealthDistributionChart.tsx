import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { HealthTier } from "@/hooks/deal-intelligence/useDealHealth";
import { tierLabel } from "../dealHealthHelpers";
import { Activity } from "lucide-react";

interface Props {
  rows: Array<{ tier: HealthTier }>;
}

const TIER_HSL: Record<HealthTier, string> = {
  healthy: "hsl(var(--status-success))",
  watch: "hsl(var(--info))",
  at_risk: "hsl(var(--status-warning))",
  critical: "hsl(var(--destructive))",
};

export const HealthDistributionChart: FC<Props> = ({ rows }) => {
  const data = useMemo(() => {
    const counts: Record<HealthTier, number> = { healthy: 0, watch: 0, at_risk: 0, critical: 0 };
    rows.forEach((r) => { counts[r.tier] = (counts[r.tier] || 0) + 1; });
    return (Object.keys(counts) as HealthTier[]).map((t) => ({
      name: tierLabel(t),
      value: counts[t],
      tier: t,
    }));
  }, [rows]);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <Card variant="elevated" className="glass border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Distribuição de Saúde
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
            Sem deals com score calculado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={224}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((d) => (
                  <Cell key={d.tier} fill={TIER_HSL[d.tier]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
