import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const mockData = [
  { name: "Jan", value: 45000, meta: 50000 },
  { name: "Fev", value: 52000, meta: 50000 },
  { name: "Mar", value: 48000, meta: 55000 },
  { name: "Abr", value: 61000, meta: 55000 },
  { name: "Mai", value: 55000, meta: 60000 },
  { name: "Jun", value: 67000, meta: 60000 },
  { name: "Jul", value: 72000, meta: 65000 },
];

type TimeRange = "7d" | "30d" | "90d";

const timeRangeLabels: Record<TimeRange, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
};

export const SalesChart = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução de Vendas
          </CardTitle>
          {/* Inline time range filters */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200",
                  timeRange === range
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {timeRangeLabels[range]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '10px 14px',
              }}
              formatter={(value: number, name: string) => [
                `R$ ${value.toLocaleString('pt-BR')}`, 
                name === 'value' ? 'Vendas' : 'Meta'
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            {/* Meta reference line (dashed) */}
            <Area
              type="monotone"
              dataKey="meta"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              fill="none"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorValue)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-0.5 bg-primary rounded-full" />
            Vendas
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-0.5 border-t border-dashed border-muted-foreground" />
            Meta
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
