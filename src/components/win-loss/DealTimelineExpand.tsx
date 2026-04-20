import { useDealTimeline } from "@/hooks/useDealTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, GitBranch, CheckCircle2, Trophy, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { stageLabel } from "@/components/deal-intelligence/winloss/winLossHelpers";

interface Props {
  saleId: string;
}

const iconFor = (type: string) => {
  switch (type) {
    case "activity":
      return <Activity className="h-3 w-3" />;
    case "stage_change":
      return <GitBranch className="h-3 w-3" />;
    case "task_completed":
      return <CheckCircle2 className="h-3 w-3" />;
    case "outcome":
      return <Trophy className="h-3 w-3" />;
    case "chat":
      return <MessageCircle className="h-3 w-3" />;
    default:
      return <Activity className="h-3 w-3" />;
  }
};

const labelFor = (e: { type: string; activity_type?: string; from_stage?: string; to_stage?: string; task_title?: string; deal_outcome?: string; chat_question?: string }) => {
  switch (e.type) {
    case "activity":
      return `Atividade: ${e.activity_type ?? "—"}`;
    case "stage_change":
      return `Estágio → ${stageLabel(e.to_stage ?? "")}`;
    case "task_completed":
      return `Tarefa: ${e.task_title ?? ""}`;
    case "outcome":
      return `Decisão: ${e.deal_outcome ?? ""}`;
    case "chat":
      return `Pergunta: ${e.chat_question?.slice(0, 60) ?? ""}`;
    default:
      return e.type;
  }
};

export function DealTimelineExpand({ saleId }: Props) {
  const { data: events = [], isLoading } = useDealTimeline(saleId);

  if (isLoading) {
    return (
      <div className="space-y-1.5 mt-2">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-6" />)}
      </div>
    );
  }

  if (!events.length) {
    return <p className="text-[11px] text-muted-foreground mt-2 italic">Sem histórico registrado.</p>;
  }

  return (
    <ol className="mt-3 space-y-1.5 border-l border-border/50 pl-3">
      {events.slice(0, 12).map((e) => (
        <li key={`${e.type}-${e.id}`} className="flex items-start gap-2 text-[11px] relative">
          <span className="absolute -left-[15px] top-0.5 h-2 w-2 rounded-full bg-primary/60 ring-2 ring-background" />
          <span className="text-muted-foreground shrink-0">{iconFor(e.type)}</span>
          <span className="flex-1 min-w-0 truncate">{labelFor(e)}</span>
          <span className="text-muted-foreground shrink-0 tabular-nums text-[10px]">
            {formatDistanceToNow(new Date(e.timestamp), { addSuffix: true, locale: ptBR })}
          </span>
        </li>
      ))}
      {events.length > 12 && (
        <li className="text-[10px] text-muted-foreground italic">+ {events.length - 12} eventos anteriores…</li>
      )}
    </ol>
  );
}
