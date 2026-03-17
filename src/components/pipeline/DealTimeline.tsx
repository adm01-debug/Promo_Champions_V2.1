import { useState, useMemo } from "react";
import { useDealTimeline, DealTimelineEvent, TimelineEventType } from "@/hooks/useDealTimeline";
import { Deal } from "@/hooks/usePipeline";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  History,
  Phone,
  Mail,
  Calendar,
  Linkedin,
  MessageCircle,
  MoreHorizontal,
  ArrowRight,
  Clock,
  CheckCircle2,
  User,
  FileText,
  PhoneCall,
  Users,
  Reply,
  Trophy,
  XCircle,
  Bot,
  Filter,
  Activity,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  meeting: <Calendar className="h-3.5 w-3.5" />,
  linkedin: <Linkedin className="h-3.5 w-3.5" />,
  whatsapp: <MessageCircle className="h-3.5 w-3.5" />,
  other: <MoreHorizontal className="h-3.5 w-3.5" />,
};

const ACTIVITY_LABELS: Record<string, string> = {
  call: "Ligação",
  email: "Email",
  meeting: "Reunião",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  other: "Outro",
};

const OUTCOME_LABELS: Record<string, string> = {
  connected: "Conectou",
  no_answer: "Não atendeu",
  scheduled: "Agendou",
  voicemail: "Caixa postal",
  busy: "Ocupado",
  callback: "Retornar",
  not_interested: "Sem interesse",
  qualified: "Qualificado",
};

const OUTCOME_COLORS: Record<string, string> = {
  connected: "text-status-success",
  scheduled: "text-status-info",
  qualified: "text-status-purple",
  no_answer: "text-muted-foreground",
  voicemail: "text-muted-foreground",
  busy: "text-muted-foreground",
  callback: "text-status-warning",
  not_interested: "text-status-error",
};

const STAGE_LABELS: Record<string, string> = {
  pending: "Lead",
  lead: "Lead",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação",
  completed: "Fechado",
  lost: "Perdido",
};

const TASK_TYPE_ICONS: Record<string, React.ReactNode> = {
  call: <PhoneCall className="h-3.5 w-3.5" />,
  meeting: <Users className="h-3.5 w-3.5" />,
  follow_up: <Reply className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  proposal: <FileText className="h-3.5 w-3.5" />,
  other: <CheckCircle2 className="h-3.5 w-3.5" />,
};

const TASK_TYPE_LABELS: Record<string, string> = {
  call: "Ligação",
  meeting: "Reunião",
  follow_up: "Follow-up",
  email: "Email",
  proposal: "Proposta",
  other: "Outro",
};

const FILTER_TABS: { value: TimelineEventType | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "Todos", icon: <Filter className="h-3 w-3" /> },
  { value: "activity", label: "Atividades", icon: <Activity className="h-3 w-3" /> },
  { value: "stage_change", label: "Stages", icon: <ArrowRight className="h-3 w-3" /> },
  { value: "task_completed", label: "Tarefas", icon: <CheckCircle2 className="h-3 w-3" /> },
  { value: "outcome", label: "Resultado", icon: <Trophy className="h-3 w-3" /> },
  { value: "chat", label: "IA", icon: <Bot className="h-3 w-3" /> },
];

interface DealTimelineProps {
  deal: Deal;
}

function TimelineSummary({ events }: { events: DealTimelineEvent[] }) {
  const stats = useMemo(() => {
    const activities = events.filter(e => e.type === "activity");
    const totalMinutes = activities.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
    return {
      total: events.length,
      activities: activities.length,
      stageChanges: events.filter(e => e.type === "stage_change").length,
      tasks: events.filter(e => e.type === "task_completed").length,
      totalTime: totalMinutes > 60 ? `${Math.round(totalMinutes / 60)}h` : `${totalMinutes}min`,
    };
  }, [events]);

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      <div className="text-center p-2 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-lg font-bold text-primary">{stats.activities}</p>
        <p className="text-[10px] text-muted-foreground">Atividades</p>
      </div>
      <div className="text-center p-2 rounded-lg bg-status-warning/10 border border-status-warning/20">
        <p className="text-lg font-bold text-status-warning">{stats.stageChanges}</p>
        <p className="text-[10px] text-muted-foreground">Stages</p>
      </div>
      <div className="text-center p-2 rounded-lg bg-status-success/10 border border-status-success/20">
        <p className="text-lg font-bold text-status-success">{stats.tasks}</p>
        <p className="text-[10px] text-muted-foreground">Tarefas</p>
      </div>
      <div className="text-center p-2 rounded-lg bg-accent/10 border border-accent/20">
        <div className="flex items-center justify-center gap-1">
          <Timer className="h-3 w-3 text-accent-foreground" />
          <p className="text-sm font-bold text-accent-foreground">{stats.totalTime}</p>
        </div>
        <p className="text-[10px] text-muted-foreground">Tempo Total</p>
      </div>
    </div>
  );
}

function TimelineEventItem({ event }: { event: DealTimelineEvent }) {
  const getEventStyle = () => {
    switch (event.type) {
      case "activity":
        return "bg-gradient-to-br from-primary/30 to-primary/10 text-primary border border-primary/30";
      case "stage_change":
        return "bg-gradient-to-br from-status-warning/30 to-status-warning/10 text-status-warning border border-status-warning/30";
      case "task_completed":
        return "bg-gradient-to-br from-status-success/30 to-status-success/10 text-status-success border border-status-success/30";
      case "outcome":
        return event.deal_outcome === "won"
          ? "bg-gradient-to-br from-status-success/30 to-status-success/10 text-status-success border border-status-success/30"
          : "bg-gradient-to-br from-status-error/30 to-status-error/10 text-status-error border border-status-error/30";
      case "chat":
        return "bg-gradient-to-br from-purple-500/30 to-purple-500/10 text-purple-500 border border-purple-500/30";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  const getEventIcon = () => {
    switch (event.type) {
      case "activity":
        return ACTIVITY_ICONS[event.activity_type || "other"];
      case "stage_change":
        return <ArrowRight className="h-3 w-3" />;
      case "task_completed":
        return TASK_TYPE_ICONS[event.task_type || "other"];
      case "outcome":
        return event.deal_outcome === "won" ? <Trophy className="h-3 w-3" /> : <XCircle className="h-3 w-3" />;
      case "chat":
        return <Bot className="h-3 w-3" />;
      default:
        return <MoreHorizontal className="h-3 w-3" />;
    }
  };

  return (
    <div className="relative pl-6 pb-4 last:pb-0">
      <div className="absolute left-[9px] top-5 bottom-0 w-px bg-gradient-to-b from-border to-transparent last:hidden" />
      <div className={cn("absolute left-0 top-1 w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm", getEventStyle())}>
        {getEventIcon()}
      </div>

      <div className="ml-2">
        <div className="flex items-center gap-2 flex-wrap">
          {event.type === "activity" && (
            <>
              <span className="font-display font-medium text-sm">
                {ACTIVITY_LABELS[event.activity_type || "other"]}
              </span>
              {event.outcome && (
                <span className={cn("text-xs font-medium", OUTCOME_COLORS[event.outcome] || "text-muted-foreground")}>
                  • {OUTCOME_LABELS[event.outcome] || event.outcome}
                </span>
              )}
              {event.duration_minutes && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-0.5">
                  <Timer className="h-2.5 w-2.5" />
                  {event.duration_minutes}min
                </Badge>
              )}
            </>
          )}

          {event.type === "stage_change" && (
            <>
              <span className="font-display font-medium text-sm text-status-warning">Mudança de Stage</span>
              <div className="flex items-center gap-1 text-xs">
                {event.from_stage && (
                  <>
                    <span className="text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30">
                      {STAGE_LABELS[event.from_stage] || event.from_stage}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </>
                )}
                <span className="text-foreground font-medium px-1.5 py-0.5 rounded bg-primary/10">
                  {STAGE_LABELS[event.to_stage || ""] || event.to_stage}
                </span>
              </div>
            </>
          )}

          {event.type === "task_completed" && (
            <>
              <span className="font-display font-medium text-sm text-status-success">Tarefa Concluída</span>
              <span className="text-xs text-muted-foreground">• {TASK_TYPE_LABELS[event.task_type || "other"]}</span>
            </>
          )}

          {event.type === "outcome" && (
            <span className={cn("font-display font-medium text-sm", event.deal_outcome === "won" ? "text-status-success" : "text-status-error")}>
              {event.deal_outcome === "won" ? "🏆 Deal Ganho" : "❌ Deal Perdido"}
            </span>
          )}

          {event.type === "chat" && (
            <span className="font-display font-medium text-sm text-purple-500">Análise IA</span>
          )}
        </div>

        {event.type === "task_completed" && event.task_title && (
          <p className="text-sm mt-0.5 text-foreground font-medium">{event.task_title}</p>
        )}

        {event.type === "outcome" && event.deal_reason && (
          <p className="text-sm mt-0.5 text-foreground">
            <span className="font-medium">Motivo:</span> {event.deal_reason}
          </p>
        )}

        {event.type === "chat" && event.chat_question && (
          <p className="text-sm mt-0.5 text-foreground italic">"{event.chat_question}"</p>
        )}

        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: ptBR })}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{format(new Date(event.timestamp), "dd/MM HH:mm", { locale: ptBR })}</span>
          {event.duration_in_stage !== undefined && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="font-medium">{event.duration_in_stage}h no stage</span>
            </>
          )}
        </div>

        {event.contact_name && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="font-medium">{event.contact_name}</span>
          </div>
        )}

        {(event.notes || event.task_description || event.chat_response) && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3 bg-muted/40 rounded-md p-2 border border-border/30">
            {event.notes || event.task_description || event.chat_response}
          </p>
        )}
      </div>
    </div>
  );
}

export function DealTimeline({ deal }: DealTimelineProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<TimelineEventType | "all">("all");
  const { data: events, isLoading } = useDealTimeline(open ? deal.id : null);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (filter === "all") return events;
    return events.filter(e => e.type === filter);
  }, [events, filter]);

  const hasEvents = filteredEvents.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <History className="h-3 w-3" />
          Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg glass border-border/50 dark:border-glow" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
              <History className="h-4 w-4 gradient-primary" />
            </div>
            Timeline: <span className="gradient-text">{deal.client_name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Summary Stats */}
        {events && events.length > 0 && <TimelineSummary events={events} />}

        {/* Filter Tabs */}
        <div className="flex gap-1 flex-wrap mb-2">
          {FILTER_TABS.map(tab => {
            const count = tab.value === "all"
              ? (events?.length || 0)
              : (events?.filter(e => e.type === tab.value).length || 0);
            if (tab.value !== "all" && count === 0) return null;
            return (
              <Button
                key={tab.value}
                variant={filter === tab.value ? "default" : "outline"}
                size="sm"
                className="h-6 text-[10px] gap-1 px-2"
                onClick={() => setFilter(tab.value)}
              >
                {tab.icon}
                {tab.label}
                <Badge variant="secondary" className="h-4 px-1 text-[9px] ml-0.5">{count}</Badge>
              </Button>
            );
          })}
        </div>

        <ScrollArea className="max-h-[450px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasEvents ? (
            <div className="py-2">
              {filteredEvents.map((event) => (
                <TimelineEventItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border/50">
              <History className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm font-display font-medium">
                {filter === "all" ? "Nenhuma interação registrada" : "Nenhum evento deste tipo"}
              </p>
              <p className="text-xs mt-1">
                {filter === "all"
                  ? "Atividades e mudanças de stage aparecerão aqui"
                  : "Tente outro filtro para ver mais eventos"}
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
