export const AUTO_PAUSE_REASON_LABEL: Record<string, string> = {
  reply_detected: "Resposta detectada",
  bounce: "E-mail retornou (bounce)",
  unsubscribe: "Descadastro",
  manual_activity: "Atividade manual registrada",
  complaint: "Reclamação de spam",
};

export function autoPauseLabel(reason: string | null | undefined): string {
  if (!reason) return "Auto-pausado";
  return AUTO_PAUSE_REASON_LABEL[reason] ?? "Auto-pausado";
}

export function autoPauseVariant(reason: string | null | undefined): "warning" | "destructive" | "info" {
  if (reason === "bounce" || reason === "complaint" || reason === "unsubscribe") return "destructive";
  if (reason === "reply_detected") return "info";
  return "warning";
}
