import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Check, CircleSlash, Sparkles, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCriticalMoments,
  useDetectCriticalMoments,
  useUpdateCriticalMoment,
} from "@/hooks/conversational/useCriticalMoments";
import { CriticalMomentBadge } from "./CriticalMomentBadge";
import { formatTs, SEVERITY_TONE } from "./criticalMomentsHelpers";

interface Props {
  recordingId: string;
  onSeek?: (sec: number) => void;
}

export const CriticalMomentsList = ({ recordingId, onSeek }: Props) => {
  const { data: moments, isLoading } = useCriticalMoments(recordingId);
  const detect = useDetectCriticalMoments();
  const update = useUpdateCriticalMoment();

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Momentos críticos
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => detect.mutate(recordingId)}
          disabled={detect.isPending}
          className="h-7 gap-1.5 text-xs"
        >
          <Sparkles className="h-3 w-3" />
          {detect.isPending ? "Detectando..." : moments?.length ? "Redetectar" : "Detectar"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !moments?.length ? (
          <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
            Sem momentos críticos detectados ainda. Clique em "Detectar".
          </div>
        ) : (
          moments.map((m) => {
            const tone = SEVERITY_TONE[m.severity];
            const dimmed = m.status === "dismissed" || m.status === "actioned";
            return (
              <div
                key={m.id}
                className={cn(
                  "rounded-lg border p-3 transition-opacity",
                  tone.border,
                  tone.bg,
                  dimmed && "opacity-60",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <CriticalMomentBadge type={m.moment_type} severity={m.severity} />
                      <button
                        type="button"
                        onClick={() => onSeek?.(m.timestamp_sec)}
                        className="inline-flex items-center gap-1 rounded-md bg-background/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/90 hover:bg-background"
                      >
                        <Play className="h-2.5 w-2.5" />
                        {formatTs(m.timestamp_sec)}
                      </button>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {m.status === "new" ? "novo" : m.status}
                      </span>
                    </div>
                    {m.quote && (
                      <p className="text-xs italic text-foreground/90 line-clamp-2">
                        "{m.quote}"
                      </p>
                    )}
                    {m.context && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{m.context}</p>
                    )}
                    {m.suggested_action && (
                      <p className="text-[11px] font-medium text-foreground/90">
                        💡 {m.suggested_action}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {m.status !== "actioned" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        title="Marcar como tratado"
                        onClick={() => update.mutate({ id: m.id, status: "actioned" })}
                      >
                        <Check className="h-3.5 w-3.5 text-status-success" />
                      </Button>
                    )}
                    {m.status !== "dismissed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        title="Descartar"
                        onClick={() => update.mutate({ id: m.id, status: "dismissed" })}
                      >
                        <CircleSlash className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
