import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Sparkles } from "lucide-react";
import { useGenerateQBR, useQBRReports, type QBRReport } from "@/hooks/revenue/useRevenueIntelligenceHub";

export const QBRGeneratorPanel: FC = () => {
  const { data: reports = [], isLoading } = useQBRReports();
  const generate = useGenerateQBR();
  const [selected, setSelected] = useState<QBRReport | null>(null);

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />Quarterly Business Review
          </CardTitle>
          <Button onClick={() => generate.mutate({})} disabled={generate.isPending}>
            <Sparkles className="h-4 w-4 mr-2" />{generate.isPending ? "Gerando..." : "Gerar QBR"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : reports.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Nenhum QBR gerado ainda. Clique em "Gerar QBR" para criar a narrativa AI do trimestre.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {reports.map((r) => (
                <Badge
                  key={r.id}
                  variant={selected?.id === r.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelected(r)}
                >
                  {r.period_label}
                </Badge>
              ))}
            </div>
            {(selected ?? reports[0]) && (
              <div className="border border-border/40 rounded-lg p-4 bg-card/50 space-y-3">
                <h4 className="font-display text-sm font-semibold">
                  {(selected ?? reports[0]).period_label}
                </h4>
                {(selected ?? reports[0]).ai_narrative && (
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {(selected ?? reports[0]).ai_narrative}
                  </p>
                )}
                {(selected ?? reports[0]).recommendations?.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Recomendações</div>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      {(selected ?? reports[0]).recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
