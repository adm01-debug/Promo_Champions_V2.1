import { ArrowRight } from "lucide-react";
import { formatHours, stageLabel } from "./velocityHelpers";
import type { StageTransition } from "@/hooks/deal-intelligence/useStageVelocity";

interface Props {
  transitions: StageTransition[];
}

export function StageTransitionsTimeline({ transitions }: Props) {
  if (!transitions.length) {
    return <p className="text-xs text-muted-foreground">Sem transições registradas.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {transitions.map((t, i) => {
        const isOpen = !t.exited_at;
        const hours = isOpen
          ? (Date.now() - new Date(t.entered_at).getTime()) / 3_600_000
          : Number(t.duration_hours || 0);
        return (
          <div key={t.id} className="flex items-center gap-1.5">
            <div
              className={`px-2 py-1 rounded-md border text-[11px] font-medium ${
                isOpen
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/50 bg-muted/30 text-foreground/80"
              }`}
            >
              <div className="leading-tight">{stageLabel(t.to_stage)}</div>
              <div className="text-[10px] text-muted-foreground tabular-nums">
                {formatHours(hours)}
                {isOpen ? " · ativo" : ""}
              </div>
            </div>
            {i < transitions.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}
