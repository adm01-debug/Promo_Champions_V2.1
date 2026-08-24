import { FC } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { StatusSlice } from "@/hooks/reports/salesReportHelpers";
import type { RechartsTooltipProps } from "@/types/recharts";

const COLORS = [
  "hsl(var(--success))",
  "hsl(var(--primary))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
];

const TT: FC<RechartsTooltipProps> = ({ active, payload }) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium">{payload[0].name}</p>
      <p className="text-sm text-primary">{payload[0].value} vendas</p>
    </div>
  ) : null;

export const SalesStatusDonut: FC<{ data: StatusSlice[] }> = ({ data }) => (
  <Card className="p-5" data-report-chart="status">
    <h3 className="text-section-title mb-4">Distribuição por status</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<TT />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </Card>
);
