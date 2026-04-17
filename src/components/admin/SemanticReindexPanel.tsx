import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Sparkles, Database } from "lucide-react";
import { useSemanticCoverage } from "@/hooks/semantic/useSemanticCoverage";
import { useReindexBatch } from "@/hooks/semantic/useReindexBatch";
import { ENTITY_META, type SemanticEntityType } from "@/components/semantic/semanticSearchHelpers";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const KNOWN: SemanticEntityType[] = ["client", "lead", "deal", "activity", "call_recording"];

function metaFor(t: string) {
  return (ENTITY_META as Record<string, typeof ENTITY_META[SemanticEntityType] | undefined>)[t];
}

export function SemanticReindexPanel() {
  const { data, isLoading, refetch, isFetching } = useSemanticCoverage();
  const reindex = useReindexBatch();
  const [activeType, setActiveType] = useState<string | null>(null);

  const handleReindexOne = (t: SemanticEntityType) => {
    setActiveType(t);
    reindex.mutate({ entity_types: [t], only_missing: true, batch_size: 200 }, {
      onSettled: () => setActiveType(null),
    });
  };

  const handleReindexAll = () => {
    reindex.mutate({ entity_types: KNOWN, only_missing: true, batch_size: 100 });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Busca Semântica — Cobertura do Índice
            </CardTitle>
            <CardDescription>
              Acompanhe quais entidades estão indexadas e dispare reindexação para os registros faltantes.
            </CardDescription>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button
              size="sm" onClick={handleReindexAll}
              disabled={reindex.isPending}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              Reindexar tudo
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Sem dados de cobertura.</p>
        ) : (
          <div className="space-y-3">
            {data.map((row) => {
              const meta = metaFor(row.entity_type);
              const Icon = meta?.icon;
              const pct = Number(row.coverage_pct ?? 0);
              const isBusy = reindex.isPending && activeType === row.entity_type;
              return (
                <div key={row.entity_type} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                  <div className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${meta?.color ?? "bg-muted text-muted-foreground"}`}>
                    {Icon ? <Icon className="h-4 w-4" /> : <Database className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{meta?.label ?? row.entity_type}</span>
                      <Badge variant={pct >= 90 ? "default" : pct >= 50 ? "secondary" : "outline"} className="text-[10px]">
                        {pct.toFixed(1)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {row.indexed_rows} / {row.total_rows}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    {row.last_indexed && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Última indexação: {formatDistanceToNow(new Date(row.last_indexed), { addSuffix: true, locale: ptBR })}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => handleReindexOne(row.entity_type as SemanticEntityType)}
                    disabled={reindex.isPending}
                    className="gap-1.5 shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isBusy ? "animate-spin" : ""}`} />
                    Reindexar
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
