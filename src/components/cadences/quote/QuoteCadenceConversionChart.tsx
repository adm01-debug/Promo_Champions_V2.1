import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useQuoteCadenceConversion } from "@/hooks/cadences/useQuoteCadenceConversion";
import type { RechartsTooltipProps } from "@/types/recharts";

type Range = 30 | 60 | 90;

function ChartTooltip({ active, payload, label }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-popover/95 backdrop-blur px-3 py-2 shadow-lg text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function QuoteCadenceConversionChart() {
  const [range, setRange] = useState<Range>(30);
  const { data, isLoading } = useQuoteCadenceConversion(range);

  return (
    <Card className="glass border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <TrendingUp className="h-4 w-4 text-primary" />
          Conversão pós-cadência
        </CardTitle>
        <ToggleGroup
          type="single"
          size="sm"
          value={String(range)}
          onValueChange={(v) => v && setRange(Number(v) as Range)}
          aria-label="Período do gráfico de conversão"
        >
          <ToggleGroupItem value="30" aria-label="Últimos 30 dias">30d</ToggleGroupItem>
          <ToggleGroupItem value="60" aria-label="Últimos 60 dias">60d</ToggleGroupItem>
          <ToggleGroupItem value="90" aria-label="Últimos 90 dias">90d</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data ?? []} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-enrolled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-approved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="enrolled"
                name="Enviados"
                stroke="hsl(var(--primary))"
                fill="url(#grad-enrolled)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="approved"
                name="Aprovados"
                stroke="hsl(var(--accent))"
                fill="url(#grad-approved)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
