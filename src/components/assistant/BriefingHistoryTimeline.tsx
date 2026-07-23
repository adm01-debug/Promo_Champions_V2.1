import { FC, useState } from "react";
import ReactMarkdown from "react-markdown";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { useBriefingHistory, BriefingHistoryEntry } from "@/hooks/assistant/useBriefingHistory";
import { cn } from "@/lib/utils";

interface Props {
  salespersonId: string | null;
}

function labelForDate(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isToday(d)) return "Hoje";
    if (isYesterday(d)) return "Ontem";
    return format(d, "EEE, dd 'de' MMM", { locale: ptBR });
  } catch {
    return iso;
  }
}

const Item: FC<{ entry: BriefingHistoryEntry }> = ({ entry }) => {
  const [open, setOpen] = useState(false);
  const preview = (entry.content ?? "").replace(/[#*_`>]/g, "").slice(0, 90);

  return (
    <div className="border rounded-lg overflow-hidden bg-muted/20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/40 transition-colors text-left"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground">{labelForDate(entry.briefing_date)}</div>
          {!open && (
            <div className="text-[11px] text-muted-foreground truncate">
              {preview || "Briefing gerado"}
            </div>
          )}
        </div>
      </button>
      {open && (
        <div className={cn("px-4 py-3 bg-background/60 border-t", "prose prose-sm dark:prose-invert max-w-none text-sm max-h-72 overflow-y-auto")}>
          <ReactMarkdown>{entry.content || "_Sem conteúdo_"}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export const BriefingHistoryTimeline: FC<Props> = ({ salespersonId }) => {
  const { data, isLoading, error } = useBriefingHistory(salespersonId);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Briefings anteriores
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : error ? (
        <p className="text-xs text-destructive">Não foi possível carregar o histórico.</p>
      ) : !data || data.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Seus briefings diários vão aparecer aqui a partir de amanhã.
        </p>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {data.map((entry) => (
            <Item key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </Card>
  );
};
