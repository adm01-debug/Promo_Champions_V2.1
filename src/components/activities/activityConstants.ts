import { ActivityType, ActivityOutcome } from "@/hooks/activities/useActivities";
import { Phone, Mail, Users, Linkedin, MessageCircle, MoreHorizontal, FileText } from "lucide-react";

export const activityIcons: Record<ActivityType, typeof Phone> = {
  call: Phone, email: Mail, meeting: Users, linkedin: Linkedin, whatsapp: MessageCircle, note: FileText, other: MoreHorizontal,
};

export const activityLabels: Record<ActivityType, string> = {
  call: "Ligação", email: "E-mail", meeting: "Reunião", linkedin: "LinkedIn", whatsapp: "WhatsApp", note: "Nota", other: "Outro",
};

export const outcomeLabels: Record<ActivityOutcome, { label: string; color: string }> = {
  connected: { label: "Conectou", color: "bg-status-success/10 text-status-success border-status-success/20" },
  no_answer: { label: "Não Atendeu", color: "bg-status-error/10 text-status-error border-status-error/20" },
  scheduled: { label: "Agendou", color: "bg-status-info/10 text-status-info border-status-info/20" },
  voicemail: { label: "Caixa Postal", color: "bg-status-warning/10 text-status-warning border-status-warning/20" },
  busy: { label: "Ocupado", color: "bg-rank-gold/10 text-rank-gold border-rank-gold/20" },
  callback: { label: "Retornar", color: "bg-status-purple/10 text-status-purple border-status-purple/20" },
  not_interested: { label: "Sem Interesse", color: "bg-muted text-muted-foreground border-border" },
  qualified: { label: "Qualificado", color: "bg-primary/10 text-primary border-primary/20" },
  bad_timing: { label: "Momento Ruim", color: "bg-amber-100 text-amber-700 border-amber-200" },
  wrong_person: { label: "Pessoa Errada", color: "bg-red-100 text-red-700 border-red-200" },
  unsubscribed: { label: "Descadastrou", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

export const activityTypeOptions = [
  { label: "Ligação", value: "call" }, { label: "E-mail", value: "email" },
  { label: "Reunião", value: "meeting" }, { label: "LinkedIn", value: "linkedin" },
  { label: "WhatsApp", value: "whatsapp" }, { label: "Nota", value: "note" }, { label: "Outro", value: "other" },
];

export const outcomeOptions = [
  { label: "Conectou", value: "connected" }, { label: "Não Atendeu", value: "no_answer" },
  { label: "Agendou", value: "scheduled" }, { label: "Caixa Postal", value: "voicemail" },
  { label: "Ocupado", value: "busy" }, { label: "Retornar", value: "callback" },
  { label: "Sem Interesse", value: "not_interested" }, { label: "Qualificado", value: "qualified" },
  { label: "Momento Ruim", value: "bad_timing" }, { label: "Pessoa Errada", value: "wrong_person" },
  { label: "Descadastrou", value: "unsubscribed" },
];
