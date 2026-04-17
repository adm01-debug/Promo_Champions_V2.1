import { Mail, MessageCircle, Phone, Linkedin, ListChecks } from "lucide-react";

export const CHANNEL_META = {
  email: { label: "E-mail", icon: Mail, color: "text-blue-500" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "text-green-500" },
  call: { label: "Ligação", icon: Phone, color: "text-orange-500" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "text-sky-500" },
  task: { label: "Tarefa", icon: ListChecks, color: "text-purple-500" },
} as const;

export type ChannelKey = keyof typeof CHANNEL_META;

export function formatDelay(days: number, hours: number): string {
  if (days === 0 && hours === 0) return "Imediato";
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  return `+${parts.join(" ")}`;
}

export function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active": return "default";
    case "completed": return "secondary";
    case "paused": return "outline";
    case "exited":
    case "failed": return "destructive";
    default: return "outline";
  }
}

export const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  paused: "Pausado",
  completed: "Concluído",
  exited: "Saiu",
  failed: "Falhou",
};
