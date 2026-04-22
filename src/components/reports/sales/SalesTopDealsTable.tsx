import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, type TopDeal } from "@/hooks/reports/salesReportHelpers";

const statusTone = (status: string): "success" | "warning" | "destructive" | "muted" => {
  const s = status.toLowerCase();
  if (s.includes("conclu")) return "success";
  if (s.includes("cancel")) return "destructive";
  if (s.includes("pend") || s.includes("propos") || s.includes("negoc")) return "warning";
  return "muted";
};

const toneClass: Record<string, string> = {
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
};

export const SalesTopDealsTable: FC<{ data: TopDeal[] }> = ({ data }) => (
  <Card className="p-5">
    <h3 className="text-section-title mb-4">Top 10 negócios do período</h3>
    {data.length === 0 ? (
      <p className="text-sm text-muted-foreground">Nenhum negócio registrado.</p>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d, i) => {
              const tone = statusTone(d.status);
              return (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{d.client}</TableCell>
                  <TableCell>{d.product}</TableCell>
                  <TableCell>{d.salesperson}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(d.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={toneClass[tone]}>
                      {d.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    )}
  </Card>
);
