import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReportExecutionResult } from "@/hooks/reporting/useReportExecution";
import { AlertCircle, Database } from "lucide-react";

interface Props {
  result?: ReportExecutionResult;
  isLoading?: boolean;
  error?: Error | null;
  vizType: string;
  columns: string[];
}

const COLORS = ["hsl(24,100%,55%)", "hsl(280,80%,60%)", "hsl(340,80%,55%)", "hsl(142,76%,45%)", "hsl(200,80%,55%)", "hsl(48,100%,55%)"];

export const ReportPreview = memo(({ result, isLoading, error, vizType, columns }: Props) => {
  const rows = result?.rows ?? [];

  const chartData = useMemo(() => {
    if (rows.length === 0 || columns.length < 2) return [];
    const [xKey, yKey] = columns;
    return rows.slice(0, 50).map((r) => ({
      name: String(r[xKey] ?? "—").slice(0, 24),
      value: Number(r[yKey] ?? 0),
    }));
  }, [rows, columns]);

  if (isLoading) {
    return (
      <Card className="p-6 glass border-border/40">
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 glass border-destructive/40">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm font-medium">Erro ao executar relatório</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{error.message}</p>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card className="p-12 glass border-border/40 text-center">
        <Database className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Nenhum dado para os filtros atuais</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 glass border-border/40 space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {result?.total ?? rows.length} linha(s) · {result?.duration_ms}ms
        </Badge>
        <Badge variant="secondary" className="text-xs">{vizType}</Badge>
      </div>

      {vizType === "table" && (
        <div className="overflow-auto max-h-[420px] rounded-md border border-border/40">
          <Table>
            <TableHeader>
              <TableRow>{columns.map((c) => <TableHead key={c} className="text-xs">{c}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 200).map((r, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c} className="text-xs">{String(r[c] ?? "—").slice(0, 80)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {vizType === "bar" && (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {vizType === "line" && (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {vizType === "pie" && (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}

      {vizType === "kpi" && (
        <div className="text-center py-8">
          <p className="text-page-title font-display text-primary">{rows.length}</p>
          <p className="text-xs text-muted-foreground mt-1">registros</p>
        </div>
      )}
    </Card>
  );
});
ReportPreview.displayName = "ReportPreview";
