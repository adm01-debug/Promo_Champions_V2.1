import { ShieldCheck, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useObjectionAnalysis,
  useCallObjections,
  useAnalyzeObjectionHandling,
} from "@/hooks/conversational/useObjectionAnalysis";
import { ObjectionTypeDonut } from "./ObjectionTypeDonut";
import { ObjectionResolutionBar } from "./ObjectionResolutionBar";
import { ObjectionsList } from "./ObjectionsList";
import { healthBadgeVariant, healthLabel } from "./objectionHelpers";

interface Props {
  recordingId: string;
}

export function ObjectionHandlingCard({ recordingId }: Props) {
  const { data: analysis, isLoading } = useObjectionAnalysis(recordingId);
  const { data: objections } = useCallObjections(recordingId);
  const analyze = useAnalyzeObjectionHandling();

  return (
    <Card variant="modern">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Tratamento de objeções</CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => analyze.mutate(recordingId)}
            disabled={analyze.isPending}
            className="h-7 gap-1 text-xs"
          >
            <RefreshCw className={`h-3 w-3 ${analyze.isPending ? "animate-spin" : ""}`} />
            Recalcular
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !analysis ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Análise não disponível. Clique em "Recalcular" para gerar.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold tabular-nums">
                  {Math.round(analysis.handling_score)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/100</span>
                </p>
                <p className="text-xs text-muted-foreground">Handling score</p>
              </div>
              <Badge variant={healthBadgeVariant(analysis.health)}>{healthLabel(analysis.health)}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Total" value={analysis.total_objections} />
              <Stat label="Resp. média" value={`${analysis.avg_response_time_seconds.toFixed(1)}s`} />
              <Stat
                label="Taxa resolvida"
                value={
                  analysis.total_objections
                    ? `${Math.round((analysis.resolved_count / analysis.total_objections) * 100)}%`
                    : "—"
                }
              />
            </div>

            <ObjectionResolutionBar
              resolved={analysis.resolved_count}
              partial={analysis.partially_resolved_count}
              unresolved={analysis.unresolved_count}
            />

            {(objections?.length ?? 0) > 0 && (
              <>
                <ObjectionTypeDonut objections={objections ?? []} />
                <ObjectionsList objections={objections ?? []} />
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-muted/40 p-2">
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
