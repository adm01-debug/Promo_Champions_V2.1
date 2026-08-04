/**
 * Helpers puros do usePersonalAssistant. Isolados para permitir testes
 * determinísticos sem depender de fetch/streaming.
 */

export type AssistantMode = "briefing" | "chat" | "proactive_nudge";

export interface AssistantChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

/**
 * Extrai deltas de texto de uma linha SSE do padrão OpenAI/Lovable AI Gateway.
 * Retorna '' se a linha não é um chunk de conteúdo.
 */
export function parseSSELine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return "";
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") return "";
  try {
    const parsed = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };
    return parsed.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}

/**
 * Percorre um chunk textual de SSE, quebra em linhas e concatena os deltas.
 * Retorna o texto e um buffer residual (linha incompleta que ainda não terminou em \n).
 */
export function drainSSEChunk(chunk: string, buffer: string): { text: string; buffer: string } {
  const combined = buffer + chunk;
  const parts = combined.split("\n");
  const residual = parts.pop() ?? "";
  let text = "";
  for (const line of parts) {
    text += parseSSELine(line);
  }
  return { text, buffer: residual };
}

export function makeMessageId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getAssistantErrorMessage(status: number, responseBody: string): string {
  if (status === 401) return "Sua sessão expirou. Entre novamente para usar o assistente.";
  if (status === 402) return "O limite de uso da IA foi atingido. Tente novamente mais tarde.";
  if (status === 429) return "O assistente recebeu muitas solicitações. Aguarde um instante e tente novamente.";

  const normalized = responseBody.toLowerCase();
  if (status === 403 && normalized.includes("lovable ai is disabled")) {
    return "A IA está desabilitada neste workspace. Solicite a ativação a um administrador.";
  }

  return "O assistente está temporariamente indisponível. Tente novamente em instantes.";
}
