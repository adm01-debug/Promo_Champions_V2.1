import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pause, Play, XCircle } from "lucide-react";
import { usePauseCadence, useResumeCadence, useCancelCadence } from "@/hooks/useCadences";
import { cn } from "@/lib/utils";

interface ProspectCadenceControlsProps {
  saleId: string;
  status: string;
  cadenceName?: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Ativa", color: "bg-status-success/15 text-status-success border-status-success/30" },
  paused: { label: "Pausada", color: "bg-status-warning/15 text-status-warning border-status-warning/30" },
  completed: { label: "Concluída", color: "bg-primary/15 text-primary border-primary/30" },
  cancelled: { label: "Cancelada", color: "bg-muted/50 text-muted-foreground border-border/50" },
};

function ProspectCadenceControlsComponent({ saleId, status, cadenceName, className }: ProspectCadenceControlsProps) {
  const pauseCadence = usePauseCadence();
  const resumeCadence = useResumeCadence();
  const cancelCadence = useCancelCadence();

  const config = statusConfig[status] || statusConfig.active;
  const isTerminal = status === "completed" || status === "cancelled";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {cadenceName && (
        <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{cadenceName}</span>
      )}
      <Badge variant="outline" className={cn("text-[10px] shrink-0", config.color)}>
        {config.label}
      </Badge>

      {!isTerminal && (
        <div className="flex items-center gap-1">
          {status === "active" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-status-warning/10 hover:text-status-warning"
              onClick={() => pauseCadence.mutate(saleId)}
              disabled={pauseCadence.isPending}
              title="Pausar cadência"
              aria-label="Pausar cadência"
            >
              <Pause className="h-3.5 w-3.5" />
            </Button>
          ) : status === "paused" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-status-success/10 hover:text-status-success"
              onClick={() => resumeCadence.mutate(saleId)}
              disabled={resumeCadence.isPending}
              title="Retomar cadência"
              aria-label="Retomar cadência"
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => cancelCadence.mutate(saleId)}
            disabled={cancelCadence.isPending}
            title="Cancelar cadência"
            aria-label="Cancelar cadência"
          >
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export const ProspectCadenceControls = React.memo(ProspectCadenceControlsComponent);
