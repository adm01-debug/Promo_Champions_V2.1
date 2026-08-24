import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EmbeddedReportPayload } from "./embedHelpers";

interface Props {
  payload: EmbeddedReportPayload;
}

export const EmbeddedReportView = memo(function EmbeddedReportView({ payload }: Props) {
  const { viz_type, columns, rows } = payload;

  const chartData = useMemo(() => {
    if (viz_type !== "bar" || columns.length < 2) return [];
    const [labelKey, valueKey] = columns;
    return rows.slice(0, 30).map((r) => ({
      name: String(r[labelKey] ?? ""),
      value: Number(r[valueKey] ?? 0),
    }));
  }, [viz_type, columns, rows]);

  if (rows.length === 0) {
    return (
      <Card className="p-12 text-center border-border/40">
        <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
      </Card>
    );
  }

  if (viz_type === "kpi" && columns.length > 0) {
    const key = columns[0];
    const total = rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
    return (
      <Card className="p-8 border-border/40 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{key}</p>
        <p className="text-5xl font-display font-bold mt-2">{total.toLocaleString("pt-BR")}</p>
        <p className="text-xs text-muted-foreground mt-2">{rows.length} registros</p>
      </Card>
    );
  }

  if (viz_type === "bar" && chartData.length > 0) {
    return (
      <Card className="p-4 border-border/40">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 overflow-hidden">
      <div className="overflow-x-auto max-h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c} className="text-xs whitespace-nowrap">{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={c} className="text-xs whitespace-nowrap">
                    {r[c] === null || r[c] === undefined ? "—" : String(r[c])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
});
