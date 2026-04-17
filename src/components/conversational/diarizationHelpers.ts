export interface DiarizationTurn {
  speaker: "seller" | "client" | "unknown";
  text: string;
  word_count: number;
  start_estimate: number;
  duration_estimate: number;
}

export function formatSeconds(s: number): string {
  if (!s || s < 0) return "0s";
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function speakerLabel(speaker: DiarizationTurn["speaker"]): string {
  if (speaker === "seller") return "Vendedor";
  if (speaker === "client") return "Cliente";
  return "Desconhecido";
}
