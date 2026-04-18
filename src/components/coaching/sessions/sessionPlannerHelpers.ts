import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { CoachingSessionStatus } from "@/hooks/coaching/useCoachingSessions";

export const SKILL_LABELS: Record<string, string> = {
  talk: "Talk & Pace",
  questions: "Perguntas",
  objections: "Objeções",
  sentiment: "Sentimento",
  moments: "Momentos",
  opening: "Abertura",
  discovery: "Descoberta",
  closing: "Fechamento",
};

export const STATUS_LABELS: Record<CoachingSessionStatus, string> = {
  scheduled: "Agendada",
  completed: "Concluída",
  canceled: "Cancelada",
};

export const STATUS_ICONS = {
  scheduled: Clock,
  completed: CheckCircle2,
  canceled: XCircle,
} as const;

export const STATUS_BADGE: Record<CoachingSessionStatus, "info" | "success" | "error"> = {
  scheduled: "info",
  completed: "success",
  canceled: "error",
};

export function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diffH = Math.round((d - now) / (1000 * 60 * 60));
  if (Math.abs(diffH) < 24) {
    if (diffH === 0) return "agora";
    return diffH > 0 ? `em ${diffH}h` : `há ${-diffH}h`;
  }
  const diffD = Math.round(diffH / 24);
  return diffD > 0 ? `em ${diffD}d` : `há ${-diffD}d`;
}

export const CalendarIcon = Calendar;
