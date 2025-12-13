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
  CheckCircle,
  XCircle,
  User,
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
  connected: "text-emerald-400",
  scheduled: "text-blue-400",
  qualified: "text-purple-400",
  no_answer: "text-muted-foreground",
  voicemail: "text-muted-foreground",
  busy: "text-muted-foreground",
  callback: "text-amber-400",
  not_interested: "text-red-400",
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

interface DealTimelineProps {
  deal: Deal;
}

function TimelineEventItem({ event }: { event: DealTimelineEvent }) {
  const isActivity = event.type === "activity";
  
  return (
    <div className="relative pl-6 pb-4 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-[9px] top-5 bottom-0 w-px bg-border last:hidden" />
      
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-0 top-1 w-[18px] h-[18px] rounded-full flex items-center justify-center",
        isActivity ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-400"
      )}>
        {isActivity ? (
          ACTIVITY_ICONS[event.activity_type || "other"]
        ) : (
          <ArrowRight className="h-3 w-3" />
        )}
      </div>
      
      {/* Content */}
      <div className="ml-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isActivity ? (
            <>
              <span className="font-medium text-sm">
                {ACTIVITY_LABELS[event.activity_type || "other"]}
              </span>
              {event.outcome && (
                <span className={cn("text-xs", OUTCOME_COLORS[event.outcome] || "text-muted-foreground")}>
                  • {OUTCOME_LABELS[event.outcome] || event.outcome}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="font-medium text-sm text-amber-400">
                Mudança de Stage
              </span>
              <div className="flex items-center gap-1 text-xs">
                {event.from_stage && (
                  <>
                    <span className="text-muted-foreground">
                      {STAGE_LABELS[event.from_stage] || event.from_stage}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </>
                )}
                <span className="text-foreground font-medium">
                  {STAGE_LABELS[event.to_stage || ""] || event.to_stage}
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: ptBR })}
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span>{format(new Date(event.timestamp), "dd/MM HH:mm", { locale: ptBR })}</span>
          
          {event.duration_in_stage !== undefined && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>{event.duration_in_stage}h no stage</span>
            </>
          )}
        </div>
        
        {event.contact_name && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{event.contact_name}</span>
          </div>
        )}
        
        {event.notes && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 bg-muted/30 rounded p-2">
            {event.notes}
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
          className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <History className="h-3 w-3" />
          Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Timeline: {deal.client_name}
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
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <History className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm font-medium">Nenhuma interação registrada</p>
              <p className="text-xs mt-1">Atividades e mudanças de stage aparecerão aqui</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
