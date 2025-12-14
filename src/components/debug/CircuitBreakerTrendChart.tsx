import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCircuitBreakerTrends, useCircuitBreakerNames } from "@/hooks/useCircuitBreakerHistory";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar
} from "recharts";
import { TrendingUp, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CircuitBreakerTrendChartProps {
  days?: number;
}

export function CircuitBreakerTrendChart({ days = 7 }: CircuitBreakerTrendChartProps) {
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [selectedCircuit, setSelectedCircuit] = useState<string>("all");
  const { data: circuitNames } = useCircuitBreakerNames(30);
  const { data, isLoading, refetch } = useCircuitBreakerTrends(
    days, 
    selectedCircuit === "all" ? undefined : selectedCircuit
  );

  if (isLoading) {
    return (
      <Card className="border-border/40 bg-card/50">
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground/50" />
          <p className="text-muted-foreground">Carregando tendências...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.trendData.length === 0) {
    return (
      <Card className="border-border/40 bg-card/50">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Nenhum dado de tendência disponível.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Eventos serão exibidos aqui quando circuit breakers gerarem atividade.
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-display">Tendências de Eventos</CardTitle>
              <p className="text-xs text-muted-foreground">Últimos {days} dias</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={selectedCircuit} onValueChange={setSelectedCircuit}>
                <SelectTrigger className="h-7 w-[140px] text-xs">
                  <SelectValue placeholder="Todos circuits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {circuitNames?.map((name) => (
                    <SelectItem key={name} value={name} className="text-xs">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="text-xs">
              {data.totalEvents} eventos
            </Badge>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button
                variant={chartType === "area" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 rounded-none"
                onClick={() => setChartType("area")}
              >
                Área
              </Button>
              <Button
                variant={chartType === "bar" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 rounded-none"
                onClick={() => setChartType("bar")}
              >
                Barras
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={data.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFailures" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--status-error))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--status-error))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--status-success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--status-success))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHalfOpen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--status-warning))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--status-warning))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="failures"
                  name="Falhas"
                  stroke="hsl(var(--destructive))"
                  fill="url(#colorFailures)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="opened"
                  name="Aberturas"
                  stroke="hsl(var(--status-error))"
                  fill="url(#colorOpened)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="closed"
                  name="Fechamentos"
                  stroke="hsl(var(--status-success))"
                  fill="url(#colorClosed)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="halfOpen"
                  name="Semi-Abertos"
                  stroke="hsl(var(--status-warning))"
                  fill="url(#colorHalfOpen)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <BarChart data={data.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="failures"
                  name="Falhas"
                  fill="hsl(var(--destructive))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="opened"
                  name="Aberturas"
                  fill="hsl(var(--status-error))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="closed"
                  name="Fechamentos"
                  fill="hsl(var(--status-success))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="halfOpen"
                  name="Semi-Abertos"
                  fill="hsl(var(--status-warning))"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Circuit breakdown */}
        {data.circuits.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Circuits ativos:</p>
            <div className="flex flex-wrap gap-2">
              {data.circuits.map((circuit) => (
                <Badge key={circuit} variant="secondary" className="text-xs">
                  {circuit}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
