import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Clock } from "lucide-react";

interface TelemetryRow {
  id: string;
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  severity: string;
  created_at: string;
}

interface TelemetryChartsProps {
  rows: TelemetryRow[];
  timeFilter: string;
}

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

function formatBucketTime(ts: number, timeFilter: string): string {
  const d = new Date(ts);
  if (timeFilter === "7d") {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function TelemetryCharts({ rows, timeFilter }: TelemetryChartsProps) {
  const bucketMs = useMemo(() => {
    return timeFilter === "1h" ? 5 * 60000
      : timeFilter === "6h" ? 30 * 60000
      : timeFilter === "24h" ? 60 * 60000
      : 6 * 60 * 60000;
  }, [timeFilter]);

  // 1. Stacked severity timeline (AreaChart)
  const severityTimelineData = useMemo(() => {
    if (rows.length === 0) return [];
    const buckets = new Map<number, { muitoLentas: number; lentas: number; erros: number }>();

    rows.forEach((r) => {
      const t = Math.floor(new Date(r.created_at).getTime() / bucketMs) * bucketMs;
      const prev = buckets.get(t) || { muitoLentas: 0, lentas: 0, erros: 0 };
      if (r.severity === "very_slow") prev.muitoLentas++;
      else if (r.severity === "slow") prev.lentas++;
      else if (r.severity === "error") prev.erros++;
      buckets.set(t, prev);
    });

    return [...buckets.entries()]
      .map(([t, v]) => ({
        time: formatBucketTime(t, timeFilter),
        ts: t,
        ...v,
      }))
      .sort((a, b) => a.ts - b.ts);
  }, [rows, timeFilter, bucketMs]);

  // 2. Duration avg/max timeline (AreaChart)
  const durationTimelineData = useMemo(() => {
    if (rows.length === 0) return [];
    const buckets = new Map<number, { totalMs: number; maxMs: number; count: number }>();

    rows.forEach((r) => {
      const t = Math.floor(new Date(r.created_at).getTime() / bucketMs) * bucketMs;
      const prev = buckets.get(t) || { totalMs: 0, maxMs: 0, count: 0 };
      buckets.set(t, {
        totalMs: prev.totalMs + r.duration_ms,
        maxMs: Math.max(prev.maxMs, r.duration_ms),
        count: prev.count + 1,
      });
    });

    return [...buckets.entries()]
      .map(([t, v]) => ({
        time: formatBucketTime(t, timeFilter),
        ts: t,
        mediaMs: Math.round(v.totalMs / v.count),
        maxMs: v.maxMs,
      }))
      .sort((a, b) => a.ts - b.ts);
  }, [rows, timeFilter, bucketMs]);

  // 3. Severity pie
  const severityData = useMemo(() => {
    const counts = { normal: 0, slow: 0, very_slow: 0, error: 0 };
    rows.forEach((r) => {
      if (r.severity in counts) counts[r.severity as keyof typeof counts]++;
    });
    return [
      { name: "Normal", value: counts.normal, fill: "hsl(142, 76%, 36%)" },
      { name: "Lenta", value: counts.slow, fill: "hsl(45, 93%, 47%)" },
      { name: "Muito Lenta", value: counts.very_slow, fill: "hsl(var(--destructive))" },
      { name: "Erro", value: counts.error, fill: "hsl(0, 84%, 60%)" },
    ].filter((d) => d.value > 0);
  }, [rows]);

  // 4. Top tables horizontal bar
  const topTablesData = useMemo(() => {
    const map = new Map<string, { count: number; totalMs: number }>();
    rows.forEach((r) => {
      const key = r.rpc_name || r.table_name || "unknown";
      const prev = map.get(key) || { count: 0, totalMs: 0 };
      map.set(key, { count: prev.count + 1, totalMs: prev.totalMs + r.duration_ms });
    });
    return [...map.entries()]
      .map(([name, v]) => ({
        name: name.length > 20 ? name.slice(0, 20) + "…" : name,
        alertas: v.count,
        avgMs: Math.round(v.totalMs / v.count),
      }))
      .sort((a, b) => b.alertas - a.alertas)
      .slice(0, 8);
  }, [rows]);

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Stacked Severity Timeline */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Alertas ao Longo do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={severityTimelineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "hsl(var(--foreground))" }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="muitoLentas" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} name="Muito Lentas" />
              <Area type="monotone" dataKey="lentas" stackId="1" stroke="hsl(45, 93%, 47%)" fill="hsl(45, 93%, 47%)" fillOpacity={0.5} name="Lentas" />
              <Area type="monotone" dataKey="erros" stackId="1" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.4} name="Erros" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Severity Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Por Severidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Duration Avg/Max Timeline */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Duração Média / Máxima (ms)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={durationTimelineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "hsl(var(--foreground))" }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="maxMs" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} name="Máxima (ms)" />
              <Area type="monotone" dataKey="mediaMs" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Média (ms)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. Top Tables - Horizontal BarChart */}
      {topTablesData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Top Tabelas por Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topTablesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} className="fill-muted-foreground" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="alertas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Alertas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
