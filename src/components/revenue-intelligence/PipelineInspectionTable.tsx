import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InspectionDeal } from "@/hooks/revenue/useRevenueIntelligenceHub";

interface Props {
  data: InspectionDeal[];
  flagCounts: Record<string, number>;
  onRunInspection: () => void;
  isRunning: boolean;
  onSelectSale?: (saleId: string) => void;
}

const flagLabels: Record<string, string> = {
  stale_stage: "Estágio parado",
  no_recent_activity: "Sem atividade",
  no_decision_maker: "Sem decisor",
  single_threaded: "Single-threaded",
};

const flagSeverity: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

export const PipelineInspectionTable: FC<Props> = ({ data, flagCounts, onRunInspection, isRunning, onSelectSale }) => {
  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Inspeção de Pipeline</CardTitle>
          <Button onClick={onRunInspection} disabled={isRunning} size="sm" variant="outline">
            <Search className="h-4 w-4 mr-2" />{isRunning ? "Inspecionando..." : "Rodar inspeção"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(flagCounts).map(([f, c]) => (
            <Badge key={f} variant="outline" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />{flagLabels[f] ?? f}: {c}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma inspeção registrada. Clique em "Rodar inspeção" para auditar o pipeline.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estágio</TableHead>
                  <TableHead>Dias parado</TableHead>
                  <TableHead>Última atividade</TableHead>
                  <TableHead>Sinais de risco</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((d) => (
                  <TableRow 
                    key={d.id}
                    className={onSelectSale ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => onSelectSale?.(d.sale_id)}
                  >
                    <TableCell><Badge variant="outline">{d.stage}</Badge></TableCell>
                    <TableCell className={d.days_in_stage > 14 ? "text-destructive font-medium" : ""}>
                      {d.days_in_stage}d
                    </TableCell>
                    <TableCell>{d.days_since_activity != null ? `${d.days_since_activity}d` : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {d.risk_flags.map((f, i) => (
                          <Badge key={i} className={`text-xs ${flagSeverity[f.severity] ?? ""}`} variant="outline">
                            {flagLabels[f.flag] ?? f.flag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
