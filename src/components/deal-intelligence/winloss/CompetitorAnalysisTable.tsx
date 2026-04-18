import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useWinLossPatterns } from "@/hooks/deal-intelligence/useWinLoss";
import { fmtBRL, fmtPct } from "./winLossHelpers";
import { Skeleton } from "@/components/ui/skeleton";

export function CompetitorAnalysisTable() {
  const { data, isLoading } = useWinLossPatterns("competitor");
  const rows = (data ?? []).slice(0, 10);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Swords className="h-4 w-4 text-amber-500" />
          Análise de Concorrentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum concorrente identificado nas análises.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concorrente</TableHead>
                <TableHead className="text-right">Encontros</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.label}</TableCell>
                  <TableCell className="text-right">{r.frequency}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={r.win_rate >= 50 ? "text-emerald-600 border-emerald-500/30" : "text-rose-600 border-rose-500/30"}>
                      {fmtPct(r.win_rate)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmtBRL(r.avg_amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
