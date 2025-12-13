import { useState } from "react";
import { useDealTimeline, DealTimelineEvent } from "@/hooks/useDealTimeline";
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

interface DealTimelineProps {
  deal: Deal;
}

function TimelineEventItem({ event }: { event: DealTimelineEvent }) {
  const isActivity = event.type === "activity";
  const isStageChange = event.type === "stage_change";
  const isTask = event.type === "task_completed";
  
  const getEventStyle = () => {
    if (isActivity) return "bg-gradient-to-br from-primary/30 to-primary/10 text-primary border border-primary/30";
    if (isStageChange) return "bg-gradient-to-br from-status-warning/30 to-status-warning/10 text-status-warning border border-status-warning/30";
    return "bg-gradient-to-br from-status-success/30 to-status-success/10 text-status-success border border-status-success/30";
  };

  const getEventIcon = () => {
    if (isActivity) return ACTIVITY_ICONS[event.activity_type || "other"];
    if (isStageChange) return <ArrowRight className="h-3 w-3" />;
    return TASK_TYPE_ICONS[event.task_type || "other"];
  };
  
  return (
    <div className="relative pl-6 pb-4 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-[9px] top-5 bottom-0 w-px bg-gradient-to-b from-border to-transparent last:hidden" />
      
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-0 top-1 w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm",
        getEventStyle()
      )}>
        {getEventIcon()}
      </div>
      
      {/* Content */}
      <div className="ml-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isActivity && (
            <>
              <span className="font-display font-medium text-sm">
                {ACTIVITY_LABELS[event.activity_type || "other"]}
              </span>
              {event.outcome && (
                <span className={cn("text-xs font-medium", OUTCOME_COLORS[event.outcome] || "text-muted-foreground")}>
                  • {OUTCOME_LABELS[event.outcome] || event.outcome}
                </span>
              )}
            </>
          )}
          
          {isStageChange && (
            <>
              <span className="font-display font-medium text-sm text-status-warning">
                Mudança de Stage
              </span>
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

          {isTask && (
            <>
              <span className="font-display font-medium text-sm text-status-success">
                Tarefa Concluída
              </span>
              <span className="text-xs text-muted-foreground">
                • {TASK_TYPE_LABELS[event.task_type || "other"]}
              </span>
            </>
          )}
        </div>

        {isTask && event.task_title && (
          <p className="text-sm mt-0.5 text-foreground font-medium">
            {event.task_title}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: ptBR })}
          </span>
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
        
        {(event.notes || event.task_description) && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 bg-muted/40 rounded-md p-2 border border-border/30">
            {event.notes || event.task_description}
          </p>
        )}
      </div>
    </div>
  );
}

export function DealTimeline({ deal }: DealTimelineProps) {
  const [open, setOpen] = useState(false);
  const { data: events, isLoading } = useDealTimeline(open ? deal.id : null);

  const hasEvents = events && events.length > 0;

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
      <DialogContent className="max-w-md glass border-border/50 dark:border-glow" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
              <History className="h-4 w-4 gradient-primary" />
            </div>
            Timeline: <span className="gradient-text">{deal.client_name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
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
              {events.map((event) => (
                <TimelineEventItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border/50">
              <History className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm font-display font-medium">Nenhuma interação registrada</p>
              <p className="text-xs mt-1">Atividades e mudanças de stage aparecerão aqui</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
