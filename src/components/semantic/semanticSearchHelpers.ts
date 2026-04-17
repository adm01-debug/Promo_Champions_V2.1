import {
  Users, UserPlus, Briefcase, Activity, Phone,
  StickyNote, Mail, MessageCircle, FileText, CheckSquare, BookOpen,
  type LucideIcon,
} from "lucide-react";

export type SemanticEntityType =
  | "client" | "lead" | "deal" | "activity" | "call_recording"
  | "note" | "email_message" | "whatsapp_message" | "proposal" | "task" | "playbook";

export interface SemanticResult {
  id: string;
  entity_type: SemanticEntityType;
  entity_id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface SemanticSearchResponse {
  query: string;
  results: SemanticResult[];
  count: number;
  answer: string | null;
  cached?: boolean;
}

export const ENTITY_META: Record<SemanticEntityType, { label: string; icon: LucideIcon; color: string; route: (id: string) => string }> = {
  client: { label: "Cliente", icon: Users, color: "bg-blue-500/15 text-blue-500", route: (id) => `/clientes?id=${id}` },
  lead: { label: "Lead", icon: UserPlus, color: "bg-amber-500/15 text-amber-500", route: (id) => `/follow-up?id=${id}` },
  deal: { label: "Deal", icon: Briefcase, color: "bg-emerald-500/15 text-emerald-500", route: (id) => `/vendas?id=${id}` },
  activity: { label: "Atividade", icon: Activity, color: "bg-purple-500/15 text-purple-500", route: () => `/agenda` },
  call_recording: { label: "Call", icon: Phone, color: "bg-rose-500/15 text-rose-500", route: (id) => `/conversational?id=${id}` },
  note: { label: "Nota", icon: StickyNote, color: "bg-yellow-500/15 text-yellow-600", route: () => `/clientes` },
  email_message: { label: "E-mail", icon: Mail, color: "bg-sky-500/15 text-sky-500", route: () => `/multichannel` },
  whatsapp_message: { label: "WhatsApp", icon: MessageCircle, color: "bg-green-500/15 text-green-500", route: () => `/multichannel` },
  proposal: { label: "Proposta", icon: FileText, color: "bg-indigo-500/15 text-indigo-500", route: (id) => `/vendas?id=${id}` },
  task: { label: "Tarefa", icon: CheckSquare, color: "bg-fuchsia-500/15 text-fuchsia-500", route: () => `/agenda` },
  playbook: { label: "Playbook", icon: BookOpen, color: "bg-orange-500/15 text-orange-500", route: () => `/playbooks` },
};

export function formatScore(similarity: number): string {
  return `${Math.round(Math.max(0, Math.min(1, similarity)) * 100)}%`;
}

export function getSnippet(content: string, query: string, max = 180): string {
  const lower = content.toLowerCase();
  const q = query.trim().toLowerCase().split(/\s+/)[0];
  const idx = q ? lower.indexOf(q) : -1;
  if (idx === -1) return content.slice(0, max) + (content.length > max ? "…" : "");
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + max - 40);
  return (start > 0 ? "…" : "") + content.slice(start, end) + (end < content.length ? "…" : "");
}
