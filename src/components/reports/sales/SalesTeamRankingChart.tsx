import { FC } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatBRL, type TeamRanking } from "@/hooks/reports/salesReportHelpers";
import type { RechartsTooltipProps } from "@/types/recharts";

const TT: FC<RechartsTooltipProps> = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium">{label}</p>
      <p className="text-sm text-primary">{formatBRL(Number(payload[0].value))}</p>
    </div>
  ) : null;

export const SalesTeamRankingChart: FC<{ data: TeamRanking[] }> = ({ data }) => (
  <Card className="p-5" data-report-chart="team">
    <h3 className="text-section-title mb-4">Ranking de vendedores</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => formatBRL(Number(v))} />
          <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={110} />
          <Tooltip content={<TT />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
          <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);
