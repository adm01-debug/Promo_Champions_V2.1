import { FC } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatBRL, type TopProduct } from "@/hooks/reports/salesReportHelpers";
import type { RechartsTooltipProps } from "@/types/recharts";

const TT: FC<RechartsTooltipProps> = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium">{label}</p>
      <p className="text-sm text-primary">{formatBRL(Number(payload[0].value))}</p>
    </div>
  ) : null;

export const SalesTopProductsChart: FC<{ data: TopProduct[] }> = ({ data }) => (
  <Card className="p-5" data-report-chart="top-products">
    <h3 className="text-section-title mb-4">Top 5 produtos</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => formatBRL(Number(v))} width={70} />
          <Tooltip content={<TT />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);
