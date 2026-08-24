export type ObjectionType = "price" | "timing" | "authority" | "need" | "competition" | "trust" | "other";
export type ResponseQuality = "acknowledged" | "reframed" | "resolved" | "deflected" | "ignored";
export type ResolutionStatus = "resolved" | "partial" | "unresolved";
export type ObjectionHealth = "poor" | "fair" | "good" | "excellent";

export interface ObjectionAnalysis {
  id: string;
  recording_id: string;
  total_objections: number;
  resolved_count: number;
  partially_resolved_count: number;
  unresolved_count: number;
  avg_response_time_seconds: number;
  handling_score: number;
  health: ObjectionHealth;
  factors: Record<string, unknown>;
  calculated_at: string;
}

export interface CallObjection {
  id: string;
  recording_id: string;
  client_turn_index: number;
  objection_text: string;
  objection_type: ObjectionType;
  seller_response_text: string | null;
  response_quality: ResponseQuality;
  resolution_status: ResolutionStatus;
  start_estimate: number;
  factors: Record<string, unknown>;
  created_at: string;
}

export interface ObjectionLibraryEntry {
  id: string;
  objection_type: ObjectionType;
  pattern_text: string;
  frequency_count: number;
  best_response_text: string | null;
  best_response_recording_id: string | null;
  last_seen_at: string;
  updated_at: string;
}

export function objectionTypeLabel(t: ObjectionType): string {
  return {
    price: "Preço",
    timing: "Timing",
    authority: "Autoridade",
    need: "Necessidade",
    competition: "Concorrência",
    trust: "Confiança",
    other: "Outras",
  }[t];
}

export function objectionTypeHsl(t: ObjectionType): string {
  return {
    price: "hsl(var(--destructive))",
    timing: "hsl(var(--warning))",
    authority: "hsl(var(--info))",
    need: "hsl(var(--primary))",
    competition: "hsl(var(--accent))",
    trust: "hsl(var(--success, var(--primary)))",
    other: "hsl(var(--muted-foreground))",
  }[t];
}

export function qualityLabel(q: ResponseQuality): string {
  return {
    resolved: "Resolvida",
    reframed: "Reframe",
    acknowledged: "Reconhecida",
    deflected: "Desviou",
    ignored: "Ignorada",
  }[q];
}

export function statusLabel(s: ResolutionStatus): string {
  return { resolved: "Resolvida", partial: "Parcial", unresolved: "Não resolvida" }[s];
}

export function statusBadgeVariant(s: ResolutionStatus): "destructive" | "warning" | "high" {
  if (s === "resolved") return "high";
  if (s === "partial") return "warning";
  return "destructive";
}

export function healthLabel(h: ObjectionHealth): string {
  return { poor: "Crítico", fair: "Regular", good: "Bom", excellent: "Excelente" }[h];
}

export function healthBadgeVariant(h: ObjectionHealth): "destructive" | "warning" | "info" | "high" {
  if (h === "excellent") return "high";
  if (h === "good") return "info";
  if (h === "fair") return "warning";
  return "destructive";
}

export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
