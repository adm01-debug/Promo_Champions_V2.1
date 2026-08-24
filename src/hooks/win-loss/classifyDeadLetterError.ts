/**
 * Classify a dead-letter into a coarse error group from `last_status` + `last_error`.
 * Returns a stable key (used for grouping/filter) and a human label.
 */

export interface ErrorGroup {
  key: string;
  label: string;
}

export function classifyDeadLetterError(input: {
  last_status: number | null | undefined;
  last_error: string | null | undefined;
}): ErrorGroup {
  const status = input.last_status ?? 0;
  const err = (input.last_error ?? "").toLowerCase();

  // Network / fetch-level failures (status 0 or no response)
  if (!status || status === 0) {
    if (err.includes("timeout") || err.includes("timed out") || err.includes("deadline")) {
      return { key: "network:timeout", label: "Timeout" };
    }
    if (err.includes("dns") || err.includes("enotfound") || err.includes("getaddrinfo")) {
      return { key: "network:dns", label: "DNS / host inacessível" };
    }
    if (err.includes("ssl") || err.includes("tls") || err.includes("certificate")) {
      return { key: "network:tls", label: "Erro TLS/SSL" };
    }
    if (err.includes("econnrefused") || err.includes("connection refused")) {
      return { key: "network:refused", label: "Conexão recusada" };
    }
    if (err.includes("econnreset") || err.includes("socket hang up")) {
      return { key: "network:reset", label: "Conexão interrompida" };
    }
    if (err.includes("abort")) {
      return { key: "network:abort", label: "Requisição abortada" };
    }
    return { key: "network:other", label: "Erro de rede" };
  }

  // HTTP status families
  if (status === 401) return { key: "http:401", label: "401 não autorizado" };
  if (status === 403) return { key: "http:403", label: "403 proibido" };
  if (status === 404) return { key: "http:404", label: "404 não encontrado" };
  if (status === 408) return { key: "http:408", label: "408 timeout" };
  if (status === 409) return { key: "http:409", label: "409 conflito" };
  if (status === 410) return { key: "http:410", label: "410 removido" };
  if (status === 413) return { key: "http:413", label: "413 payload grande" };
  if (status === 422) return { key: "http:422", label: "422 inválido" };
  if (status === 429) return { key: "http:429", label: "429 rate limit" };
  if (status >= 400 && status < 500) {
    return { key: `http:4xx`, label: `4xx (${status})` };
  }

  if (status === 500) return { key: "http:500", label: "500 erro interno" };
  if (status === 502) return { key: "http:502", label: "502 bad gateway" };
  if (status === 503) return { key: "http:503", label: "503 indisponível" };
  if (status === 504) return { key: "http:504", label: "504 gateway timeout" };
  if (status >= 500 && status < 600) {
    return { key: "http:5xx", label: `5xx (${status})` };
  }

  return { key: `http:${status}`, label: `HTTP ${status}` };
}
