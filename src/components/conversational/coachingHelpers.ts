import {
  Sparkles,
  Search,
  ShieldAlert,
  Trophy,
  MessageCircle,
  Gauge,
  Heart,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export type CoachingCategory =
  | "opening"
  | "discovery"
  | "objection"
  | "closing"
  | "talk_ratio"
  | "pace"
  | "empathy"
  | "other";

export type CoachingSeverity = "info" | "warning" | "critical";

export type CoachingStatus = "pending" | "accepted" | "dismissed" | "practiced";

export interface CoachingAction {
  id: string;
  recording_id: string;
  salesperson_id: string;
  tip: string;
  category: CoachingCategory;
  severity: CoachingSeverity;
  timestamp_sec: number | null;
  quote: string | null;
  status: CoachingStatus;
  manager_note: string | null;
  accepted_at: string | null;
  created_by_ai: boolean;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_LABELS: Record<CoachingCategory, string> = {
  opening: "Abertura",
  discovery: "Descoberta",
  objection: "Objeção",
  closing: "Fechamento",
  talk_ratio: "Tempo de Fala",
  pace: "Ritmo",
  empathy: "Empatia",
  other: "Outro",
};

export const CATEGORY_ICONS: Record<CoachingCategory, LucideIcon> = {
  opening: Sparkles,
  discovery: Search,
  objection: ShieldAlert,
  closing: Trophy,
  talk_ratio: MessageCircle,
  pace: Gauge,
  empathy: Heart,
  other: HelpCircle,
};

export const SEVERITY_LABELS: Record<CoachingSeverity, string> = {
  info: "Sugestão",
  warning: "Oportunidade",
  critical: "Crítico",
};

export const SEVERITY_BADGE: Record<CoachingSeverity, string> = {
  info: "bg-info/15 text-info border-info/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
};

export const STATUS_LABELS: Record<CoachingStatus, string> = {
  pending: "Pendente",
  accepted: "Aceita",
  dismissed: "Dispensada",
  practiced: "Praticada",
};

export const SEVERITY_ORDER: Record<CoachingSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function formatTimestamp(sec: number | null): string {
  if (sec == null || sec < 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function sortBySeverity(actions: CoachingAction[]): CoachingAction[] {
  return [...actions].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99) ||
      (a.timestamp_sec ?? 0) - (b.timestamp_sec ?? 0),
  );
}
