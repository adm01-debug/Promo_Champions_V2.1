import {
  AlertTriangle,
  DollarSign,
  Handshake,
  HeartCrack,
  PhoneOff,
  Shield,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";

export type MomentType =
  | "objection"
  | "buying_signal"
  | "price_mention"
  | "discount_request"
  | "churn_signal"
  | "competitor"
  | "commitment"
  | "next_step";

export type MomentSeverity = "low" | "medium" | "high" | "critical";

export type MomentStatus = "new" | "acknowledged" | "actioned" | "dismissed";

export interface CriticalMoment {
  id: string;
  recording_id: string;
  owner_id: string;
  salesperson_id: string;
  moment_type: MomentType;
  severity: MomentSeverity;
  timestamp_sec: number;
  quote: string | null;
  context: string | null;
  suggested_action: string | null;
  status: MomentStatus;
  created_at: string;
  updated_at: string;
}

export const MOMENT_LABELS: Record<MomentType, string> = {
  objection: "Objeção",
  buying_signal: "Sinal de compra",
  price_mention: "Menção a preço",
  discount_request: "Pedido de desconto",
  churn_signal: "Risco de churn",
  competitor: "Concorrente",
  commitment: "Compromisso",
  next_step: "Próximo passo",
};

export const MOMENT_ICONS: Record<MomentType, LucideIcon> = {
  objection: Shield,
  buying_signal: Sparkles,
  price_mention: DollarSign,
  discount_request: Tag,
  churn_signal: HeartCrack,
  competitor: PhoneOff,
  commitment: Handshake,
  next_step: AlertTriangle,
};

export const SEVERITY_LABELS: Record<MomentSeverity, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

export const SEVERITY_TONE: Record<
  MomentSeverity,
  { dot: string; bg: string; text: string; border: string }
> = {
  low: {
    dot: "bg-muted-foreground",
    bg: "bg-muted/40",
    text: "text-muted-foreground",
    border: "border-border",
  },
  medium: {
    dot: "bg-status-info",
    bg: "bg-status-info/10",
    text: "text-status-info",
    border: "border-status-info/30",
  },
  high: {
    dot: "bg-status-warning",
    bg: "bg-status-warning/10",
    text: "text-status-warning",
    border: "border-status-warning/40",
  },
  critical: {
    dot: "bg-destructive",
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/50",
  },
};

const SEVERITY_ORDER: Record<MomentSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function sortMoments(items: CriticalMoment[]): CriticalMoment[] {
  return [...items].sort((a, b) => {
    const s = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (s !== 0) return s;
    return a.timestamp_sec - b.timestamp_sec;
  });
}

export function formatTs(sec: number): string {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function severityHexColor(sev: MomentSeverity): string {
  switch (sev) {
    case "critical":
      return "hsl(var(--destructive))";
    case "high":
      return "hsl(var(--status-warning))";
    case "medium":
      return "hsl(var(--status-info))";
    default:
      return "hsl(var(--muted-foreground))";
  }
}
