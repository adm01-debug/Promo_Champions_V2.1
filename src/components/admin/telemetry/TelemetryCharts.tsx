import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

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

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(45, 93%, 47%)",
  "hsl(142, 76%, 36%)",
  "hsl(262, 83%, 58%)",
  "hsl(199, 89%, 48%)",
];

export function TelemetryCharts({ rows, timeFilter }: TelemetryChartsProps) {
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

  const timelineData = useMemo(() => {
    if (rows.length === 0) return [];
    const bucketMs = timeFilter === "1h" ? 5 * 60000 : timeFilter === "6h" ? 30 * 60000 : timeFilter === "24h" ? 60 * 60000 : 6 * 60 * 60000;
    const buckets = new Map<number, { count: number; avgMs: number; total: number }>();

    rows.forEach((r) => {
      const t = Math.floor(new Date(r.created_at).getTime() / bucketMs) * bucketMs;
      const prev = buckets.get(t) || { count: 0, avgMs: 0, total: 0 };
      buckets.set(t, { count: prev.count + 1, avgMs: 0, total: prev.total + r.duration_ms });
    });

    return [...buckets.entries()]
      .map(([t, v]) => ({
        time: new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        queries: v.count,
        avgMs: Math.round(v.total / v.count),
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [rows, timeFilter]);

  const topTablesData = useMemo(() => {
    const map = new Map<string, { count: number; totalMs: number }>();
    rows.forEach((r) => {
      const key = r.rpc_name || r.table_name || "unknown";
      const prev = map.get(key) || { count: 0, totalMs: 0 };
      map.set(key, { count: prev.count + 1, totalMs: prev.totalMs + r.duration_ms });
    });
    return [...map.entries()]
      .map(([name, v]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, queries: v.count, avgMs: Math.round(v.totalMs / v.count) }))
      .sort((a, b) => b.queries - a.queries)
      .slice(0, 6);
  }, [rows]);

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Timeline */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Queries ao Longo do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line type="monotone" dataKey="queries" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Queries" />
              <Line type="monotone" dataKey="avgMs" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Avg ms" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Severity Pie */}
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
              <Pie data={severityData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Tables Bar */}
      {topTablesData.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Top Tabelas por Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topTablesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="queries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Queries" />
                <Bar dataKey="avgMs" fill="hsl(45, 93%, 47%)" radius={[4, 4, 0, 0]} name="Avg ms" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
