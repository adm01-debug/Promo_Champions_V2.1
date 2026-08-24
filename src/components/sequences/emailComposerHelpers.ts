export type EmailGoal = "intro" | "follow_up" | "meeting" | "reactivation" | "breakup";
export type EmailTone = "formal" | "casual" | "consultivo" | "direto";
export type EmailLanguage = "pt-BR" | "en";
export type EmailLength = "short" | "medium" | "long";

export const GOAL_OPTIONS: { value: EmailGoal; label: string }[] = [
  { value: "intro", label: "Apresentação (cold)" },
  { value: "follow_up", label: "Follow-up" },
  { value: "meeting", label: "Solicitar reunião" },
  { value: "reactivation", label: "Reativar lead frio" },
  { value: "breakup", label: "Break-up (última tentativa)" },
];

export const TONE_OPTIONS: { value: EmailTone; label: string }[] = [
  { value: "consultivo", label: "Consultivo" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "direto", label: "Direto" },
];

export const LENGTH_OPTIONS: { value: EmailLength; label: string }[] = [
  { value: "short", label: "Curto" },
  { value: "medium", label: "Médio" },
  { value: "long", label: "Longo" },
];

export const EMAIL_VARIABLES: { token: string; label: string }[] = [
  { token: "{{nome}}", label: "Nome" },
  { token: "{{empresa}}", label: "Empresa" },
  { token: "{{cargo}}", label: "Cargo" },
  { token: "{{ultima_interacao}}", label: "Última interação" },
  { token: "{{vendedor.nome}}", label: "Seu nome" },
  { token: "{{data.hoje}}", label: "Data de hoje" },
];

/** Highlight {{var}} occurrences in plain text → returns parts */
export function splitWithVariables(text: string): { text: string; isVar: boolean }[] {
  if (!text) return [];
  const parts: { text: string; isVar: boolean }[] = [];
  const regex = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), isVar: false });
    parts.push({ text: m[0], isVar: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), isVar: false });
  return parts;
}
