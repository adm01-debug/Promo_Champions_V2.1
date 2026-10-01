// TRACE — Propagação de contexto W3C Trace Context para chamadas externas.
//
// Deriva um `traceparent` (https://www.w3.org/TR/trace-context/) a partir do
// request-id existente (_shared/request-id.ts): o UUID do request vira o
// trace-id (32 hex), e cada chamada downstream gera um span-id novo (16 hex).
// Assim logs e receivers externos conseguem correlacionar dispatcher → edge →
// integração sem infra de tracing dedicada.
//
// Uso: via `fetchWithTrace` em ./fetch-with-timeout.ts (injetado
// automaticamente), ou `traceparentFor(requestId)` direto.

const HEX32_RE = /^[0-9a-f]{32}$/;

/** Converte um request-id (UUID ou id opaco) em trace-id W3C de 32 hex. */
export function traceIdFromRequestId(requestId: string): string {
  const hex = requestId.toLowerCase().replace(/-/g, "").replace(/[^0-9a-f]/g, "");
  if (HEX32_RE.test(hex)) return hex;
  // Id não-UUID (curto/opaco): preenche à esquerda com zeros mantendo o sufixo.
  return hex.padStart(32, "0").slice(-32);
}

/** Gera um span-id W3C válido (16 hex, não-zero). */
export function newSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Monta o header `traceparent` no formato `00-<traceid>-<spanid>-01`
 * (flag 01 = sampled, para sinalizar ao receiver que o trace é registrável).
 */
export function traceparentFor(requestId: string, spanId: string = newSpanId()): string {
  return `00-${traceIdFromRequestId(requestId)}-${spanId}-01`;
}
