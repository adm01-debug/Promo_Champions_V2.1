import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyCriticalMomentsFeed } from "@/hooks/conversational/useCriticalMoments";
import { CriticalMomentBadge } from "./CriticalMomentBadge";
import { formatTs } from "./criticalMomentsHelpers";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  onOpenRecording?: (recordingId: string, ts: number) => void;
  limit?: number;
}

export const CriticalMomentsFeed = ({ onOpenRecording, limit = 20 }: Props) => {
  const { data, isLoading } = useMyCriticalMomentsFeed(limit);

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Feed ao vivo · Momentos críticos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : !data?.length ? (
          <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
            Sem alertas no momento. Tudo sob controle ✨
          </div>
        ) : (
          data.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border bg-background/40 p-2.5 transition-colors hover:bg-background/70"
            >
              <div className="flex flex-wrap items-center gap-2">
                <CriticalMomentBadge type={m.moment_type} severity={m.severity} compact />
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              {m.call_recordings?.title && (
                <p className="mt-1 text-[11px] font-medium text-foreground/80 line-clamp-1">
                  {m.call_recordings.title}
                </p>
              )}
              {m.quote && (
                <p className="mt-0.5 text-[11px] italic text-muted-foreground line-clamp-2">
                  "{m.quote}"
                </p>
              )}
              <div className="mt-1.5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">
                  @ {formatTs(m.timestamp_sec)}
                </span>
                {onOpenRecording && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 gap-1 px-2 text-[11px]"
                    onClick={() => onOpenRecording(m.recording_id, m.timestamp_sec)}
                  >
                    Ver na call <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
