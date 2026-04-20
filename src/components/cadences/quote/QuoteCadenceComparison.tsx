import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { useQuoteCadenceComparison } from "@/hooks/cadences/useQuoteCadenceComparison";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function QuoteCadenceComparison() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuoteCadenceComparison();

  return (
    <Card className="glass border-border/50">
      <CardContent className="p-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-expanded={open}
          aria-controls="cadence-comparison-content"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-sm">Comparativo de cadências</span>
            {data && <Badge variant="secondary" className="text-[10px]">{data.length}</Badge>}
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {open && (
          <div id="cadence-comparison-content" className="mt-4">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded" />
                ))}
              </div>
            ) : !data || data.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Sem dados de comparação ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cadência</TableHead>
                      <TableHead className="text-right">Enrolados</TableHead>
                      <TableHead className="text-right">Ativos</TableHead>
                      <TableHead className="text-right">Aprovados</TableHead>
                      <TableHead className="text-right">Conversão</TableHead>
                      <TableHead className="text-right">Dias médios</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((r) => (
                      <TableRow key={r.cadence_id}>
                        <TableCell className="font-medium">{r.cadence_name}</TableCell>
                        <TableCell className="text-right">{r.total_enrolled}</TableCell>
                        <TableCell className="text-right">{r.active}</TableCell>
                        <TableCell className="text-right">{r.approved}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={r.conversion_rate >= 30 ? "default" : "secondary"}>
                            {r.conversion_rate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{r.avg_days_to_complete}d</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
