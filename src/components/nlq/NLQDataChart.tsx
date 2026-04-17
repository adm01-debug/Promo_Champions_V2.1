import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { decideChartKind, pickChartKeys, formatBRL, formatNumber, type NLQToolDataset } from "./nlqHelpers";
import type { RechartsTooltipProps } from "@/types/recharts";

interface Props { dataset: NLQToolDataset }

function CustomTooltip({ active, payload, label }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const v = Number(payload[0].value);
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <div className="font-medium">{label}</div>
      <div className="text-muted-foreground">{v >= 1000 ? formatBRL(v) : formatNumber(v)}</div>
    </div>
  );
}

export function NLQDataChart({ dataset }: Props) {
  const kind = decideChartKind(dataset);
  const { xKey, yKey } = useMemo(() => pickChartKeys(dataset), [dataset]);

  if (kind === "none") return null;

  const data = dataset.rows.slice(0, 24);

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {kind === "line" ? (
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={yKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={11} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent) / 0.1)" }} />
            <Bar dataKey={yKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
