import { FC } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { ChartPoint } from "@/hooks/reports/salesReportHelpers";
import type { RechartsTooltipProps } from "@/types/recharts";
import { formatBRL } from "@/hooks/reports/salesReportHelpers";

const CustomTooltip: FC<RechartsTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm text-primary">{formatBRL(Number(payload[0].value))}</p>
    </div>
  );
};

export const SalesRevenueChart: FC<{ data: ChartPoint[] }> = ({ data }) => (
  <Card className="p-5" data-report-chart="revenue">
    <h3 className="text-section-title mb-4">Receita ao longo do período</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => formatBRL(Number(v))} width={70} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ fill: "hsl(var(--primary))", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
);
