import { Phone, Voicemail, PhoneOff, PhoneMissed, Ban, UserX, CalendarCheck, ThumbsUp, ThumbsDown, Clock, Snowflake } from 'lucide-react';

export const DISPOSITION_OPTIONS = [
  { value: 'connected', label: 'Conectou', icon: Phone, color: 'text-success' },
  { value: 'voicemail', label: 'Caixa postal', icon: Voicemail, color: 'text-info' },
  { value: 'no_answer', label: 'Não atendeu', icon: PhoneMissed, color: 'text-warning' },
  { value: 'busy', label: 'Ocupado', icon: PhoneOff, color: 'text-warning' },
  { value: 'wrong_number', label: 'Número errado', icon: UserX, color: 'text-destructive' },
  { value: 'do_not_call', label: 'Não ligar', icon: Ban, color: 'text-destructive' },
] as const;

export const OUTCOME_OPTIONS = [
  { value: 'meeting_set', label: 'Reunião marcada', icon: CalendarCheck, color: 'text-success' },
  { value: 'interested', label: 'Interessado', icon: ThumbsUp, color: 'text-success' },
  { value: 'not_interested', label: 'Não interessado', icon: ThumbsDown, color: 'text-destructive' },
  { value: 'callback', label: 'Retornar depois', icon: Clock, color: 'text-warning' },
  { value: 'nurture', label: 'Nutrir', icon: Snowflake, color: 'text-info' },
] as const;

export const STRATEGY_OPTIONS = [
  { value: 'hybrid', label: 'Híbrido (recomendado)' },
  { value: 'score', label: 'Score de email' },
  { value: 'recency', label: 'Recência (esfriando)' },
  { value: 'send_time', label: 'Horário ideal' },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  calling: 'Em ligação',
  done: 'Concluído',
  skipped: 'Pulado',
  snoozed: 'Adiado',
};

export const dispositionLabel = (v: string | null) =>
  DISPOSITION_OPTIONS.find((d) => d.value === v)?.label ?? v ?? '—';
export const outcomeLabel = (v: string | null) =>
  OUTCOME_OPTIONS.find((o) => o.value === v)?.label ?? v ?? '—';
