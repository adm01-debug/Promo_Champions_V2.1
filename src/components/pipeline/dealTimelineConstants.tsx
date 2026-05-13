import React from "react";
import {
  Phone, Mail, Calendar, Linkedin, MessageCircle, MoreHorizontal, ArrowRight,
  CheckCircle2, PhoneCall, Users, Reply, FileText, Trophy, XCircle, Bot, Filter, Activity,
} from "lucide-react";
import type { TimelineEventType } from "@/hooks/useDealTimeline";

export const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  meeting: <Calendar className="h-3.5 w-3.5" />,
  linkedin: <Linkedin className="h-3.5 w-3.5" />,
  whatsapp: <MessageCircle className="h-3.5 w-3.5" />,
  other: <MoreHorizontal className="h-3.5 w-3.5" />,
};

export const ACTIVITY_LABELS: Record<string, string> = {
  call: "Ligação", email: "Email", meeting: "Reunião",
  linkedin: "LinkedIn", whatsapp: "WhatsApp", other: "Outro",
};

export const OUTCOME_LABELS: Record<string, string> = {
  connected: "Conectou", no_answer: "Não atendeu", scheduled: "Agendou",
  voicemail: "Caixa postal", busy: "Ocupado", callback: "Retornar",
  not_interested: "Sem interesse", qualified: "Qualificado",
};

export const OUTCOME_COLORS: Record<string, string> = {
  connected: "text-status-success", scheduled: "text-status-info", qualified: "text-status-purple",
  no_answer: "text-muted-foreground", voicemail: "text-muted-foreground", busy: "text-muted-foreground",
  callback: "text-status-warning", not_interested: "text-status-error",
};

export const STAGE_LABELS: Record<string, string> = {
  pending: "Lead", lead: "Lead", qualified: "Qualificado",
  proposal: "Proposta", negotiation: "Negociação", won: "Ganho", lost: "Perdido", closed: "Arquivado", completed: "Finalizado",
};

export const TASK_TYPE_ICONS: Record<string, React.ReactNode> = {
  call: <PhoneCall className="h-3.5 w-3.5" />, 
  meeting: <Users className="h-3.5 w-3.5" />,
  follow_up: <Reply className="h-3.5 w-3.5" />, 
  email: <Mail className="h-3.5 w-3.5" />,
  proposal: <FileText className="h-3.5 w-3.5" />, 
  linkedin: <Linkedin className="h-3.5 w-3.5" />,
  whatsapp: <MessageCircle className="h-3.5 w-3.5" />,
  other: <CheckCircle2 className="h-3.5 w-3.5" />,
};

export const TASK_TYPE_LABELS: Record<string, string> = {
  call: "Ligação", meeting: "Reunião", follow_up: "Follow-up",
  email: "Email", proposal: "Proposta", linkedin: "LinkedIn", whatsapp: "WhatsApp", other: "Outro",
};

export const FILTER_TABS: { value: TimelineEventType | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "Todos", icon: <Filter className="h-3 w-3" /> },
  { value: "activity", label: "Atividades", icon: <Activity className="h-3 w-3" /> },
  { value: "stage_change", label: "Stages", icon: <ArrowRight className="h-3 w-3" /> },
  { value: "task_completed", label: "Tarefas", icon: <CheckCircle2 className="h-3 w-3" /> },
  { value: "outcome", label: "Resultado", icon: <Trophy className="h-3 w-3" /> },
  { value: "chat", label: "IA", icon: <Bot className="h-3 w-3" /> },
];
