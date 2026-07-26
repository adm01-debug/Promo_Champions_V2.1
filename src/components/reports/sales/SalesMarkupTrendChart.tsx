import { FC, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Info } from "lucide-react";
import type { MarkupPoint } from "@/hooks/reports/salesReportHelpers";
import type { RechartsTooltipProps } from "@/types/recharts";
import { formatMarkupPct } from "@/lib/markupHelpers";

interface Props {
  data: MarkupPoint[];
}

const CustomTooltip: FC<RechartsTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as unknown as MarkupPoint;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm text-primary">{formatMarkupPct(point.value)}</p>
      <p className="text-[11px] text-muted-foreground">
        {point.sample} venda{point.sample === 1 ? "" : "s"} com custo
      </p>
    </div>
  );
};

export const SalesMarkupTrendChart: FC<Props> = ({ data }) => {
  const hasData = useMemo(() => data.some((d) => d.value !== null), [data]);

  return (
    <Card className="p-5" data-report-chart="markup-trend">
      <h3 className="text-section-title mb-4">Evolução do markup médio</h3>
      <div className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                width={56}
                tickFormatter={(v) => `${Number(v).toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Limiares de rentabilidade: 20% (crítico) e 40% (excelente) */}
              <ReferenceLine y={20} stroke="hsl(var(--destructive))" strokeDasharray="4 4" opacity={0.6} />
              <ReferenceLine y={40} stroke="hsl(var(--success))" strokeDasharray="4 4" opacity={0.6} />
              <Line
                type="monotone"
                dataKey="value"
                connectNulls
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ fill: "hsl(var(--primary))", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Info className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma venda ganha com custo conhecido no período.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
