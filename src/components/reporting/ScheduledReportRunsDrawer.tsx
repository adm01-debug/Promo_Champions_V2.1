import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useScheduledReportRuns, getSnapshotSignedUrl } from "@/hooks/reporting/useScheduledReportRuns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { formatRunDuration } from "./scheduledReportHelpers";
import { toast } from "sonner";

interface Props {
  scheduleId: string | null;
  scheduleName?: string;
  onClose: () => void;
}

export const ScheduledReportRunsDrawer = ({ scheduleId, scheduleName, onClose }: Props) => {
  const { data: runs, isLoading } = useScheduledReportRuns(scheduleId);

  const handleDownload = async (path: string) => {
    const url = await getSnapshotSignedUrl(path);
    if (!url) { toast.error("Não foi possível gerar link"); return; }
    window.open(url, "_blank");
  };

  return (
    <Sheet open={!!scheduleId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Histórico — {scheduleName ?? "Agendamento"}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}

          {!isLoading && (runs?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma execução registrada ainda.
            </p>
          )}

          {runs?.map((r) => (
            <div key={r.id} className="border border-border/40 rounded-lg p-3 flex items-start gap-3 bg-card/40">
              <div className="mt-0.5">
                {r.status === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {r.status === "failed" && <AlertCircle className="h-4 w-4 text-destructive" />}
                {r.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === "success" ? "default" : r.status === "failed" ? "destructive" : "secondary"} className="text-xs">
                    {r.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatRunDuration(r)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(r.started_at).toLocaleString("pt-BR")}
                </p>
                {r.rows_count != null && (
                  <p className="text-xs mt-0.5">{r.rows_count} linha(s)</p>
                )}
                {r.error_message && (
                  <p className="text-xs text-destructive mt-1 line-clamp-2">{r.error_message}</p>
                )}
              </div>
              {r.file_path && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDownload(r.file_path!)}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
