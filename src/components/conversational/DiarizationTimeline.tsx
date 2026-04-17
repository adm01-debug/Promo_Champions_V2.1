import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type DiarizationTurn, formatSeconds, speakerLabel } from "./diarizationHelpers";

interface Props {
  turns: DiarizationTurn[] | null | undefined;
  totalSeconds: number;
}

export function DiarizationTimeline({ turns, totalSeconds }: Props) {
  if (!turns || turns.length === 0) {
    return <div className="text-xs text-muted-foreground">Sem dados de diarização.</div>;
  }
  const total = Math.max(1, totalSeconds || turns.reduce((a, t) => a + t.duration_estimate, 0));

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="text-xs font-medium text-foreground">Timeline de fala</div>
        <div className="flex h-6 w-full overflow-hidden rounded-md bg-muted">
          {turns.map((t, i) => {
            const w = (t.duration_estimate / total) * 100;
            const cls =
              t.speaker === "seller"
                ? "bg-primary hover:bg-primary/80"
                : t.speaker === "client"
                ? "bg-accent hover:bg-accent/80"
                : "bg-muted-foreground/40";
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className={`h-full transition-colors cursor-pointer ${cls}`}
                    style={{ width: `${w}%`, minWidth: "2px" }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="text-xs font-semibold">
                    {speakerLabel(t.speaker)} · {formatSeconds(t.duration_estimate)}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-3 mt-1">{t.text}</div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
