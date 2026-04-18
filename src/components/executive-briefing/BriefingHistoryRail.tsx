import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { History } from "lucide-react";
import { formatShortDate, scoreTone, type ExecutiveBriefing } from "./briefingHelpers";

interface Props {
  history: ExecutiveBriefing[] | undefined;
  isLoading: boolean;
  selectedId?: string;
  onSelect: (b: ExecutiveBriefing) => void;
}

export function BriefingHistoryRail({ history, isLoading, selectedId, onSelect }: Props) {
  return (
    <Card className="p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground font-sora">Histórico (14d)</h3>
      </div>
      <ScrollArea className="h-[480px] pr-2">
        <div className="space-y-2">
          {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          {!isLoading && (history?.length ?? 0) === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">Nenhum briefing ainda.</p>
          )}
          {history?.map((b) => {
            const tone = scoreTone(b.pulse_score);
            const active = b.id === selectedId;
            return (
              <button
                key={b.id}
                onClick={() => onSelect(b)}
                className={`w-full text-left p-3 rounded-lg border transition-all hover:border-primary/40 hover:bg-accent/5 ${active ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{formatShortDate(b.briefing_date)}</span>
                  <span className={`text-xs font-bold ${tone.color}`}>{b.pulse_score}</span>
                </div>
                <p className="text-xs text-foreground line-clamp-2">{b.headline}</p>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
