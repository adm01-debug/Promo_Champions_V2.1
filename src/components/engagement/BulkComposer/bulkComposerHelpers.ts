export const TONE_OPTIONS = [
  { value: "consultivo", label: "Consultivo" },
  { value: "direto", label: "Direto" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "pt-BR", label: "Português (BR)" },
  { value: "en", label: "English" },
] as const;

export const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  generating: "Gerando…",
  ready: "Pronto para revisão",
  sending: "Enviando",
  completed: "Concluído",
  failed: "Falhou",
};

export const STATUS_TONE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  generating: "secondary",
  ready: "default",
  sending: "secondary",
  completed: "default",
  failed: "destructive",
};

export function truncate(text: string, max = 180): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function isValidEmail(value?: string | null): boolean {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
