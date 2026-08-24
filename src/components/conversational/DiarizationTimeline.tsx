import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type DiarizationTurn, formatSeconds, speakerLabel } from "./diarizationHelpers";
import { cn } from "@/lib/utils";

interface Props {
  turns: DiarizationTurn[] | null | undefined;
  totalSeconds: number;
  onSeek?: (sec: number) => void;
}

export function DiarizationTimeline({ turns, totalSeconds, onSeek }: Props) {
  if (!turns || turns.length === 0) {
    return <div className="text-xs text-muted-foreground italic py-2">Sem dados de diarização disponíveis.</div>;
  }
  const total = Math.max(1, totalSeconds || turns.reduce((a, t) => a + t.duration_estimate, 0));

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Neural Voice Timeline</div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter">
               <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Vendedor
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter">
               <div className="h-1.5 w-1.5 rounded-full bg-accent" /> Cliente
            </div>
          </div>
        </div>
        <div className="flex h-10 w-full overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-1 group/timeline">
          {turns.map((t, i) => {
            const w = (t.duration_estimate / total) * 100;
            const cls =
              t.speaker === "seller"
                ? "bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                : t.speaker === "client"
                ? "bg-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]"
                : "bg-muted-foreground/20";
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => onSeek?.(t.start_estimate)}
                    className={cn(
                      "h-full transition-all cursor-pointer first:rounded-l-xl last:rounded-r-xl border-r border-white/5 last:border-none hover:scale-y-110 hover:z-10",
                      cls
                    )}
                    style={{ width: `${w}%`, minWidth: "4px" }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 glass border-white/10">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest">{speakerLabel(t.speaker)}</span>
                    <span className="text-[10px] font-mono tabular-nums opacity-60">{formatSeconds(t.start_estimate)} · {formatSeconds(t.duration_estimate)}</span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed font-medium italic">"{t.text}"</p>
                  <div className="mt-2 text-[8px] font-black uppercase text-primary tracking-tighter">Clique para pular para este momento</div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
