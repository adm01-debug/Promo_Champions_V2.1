/**
 * fetch() wrapper that aborts after `timeoutMs` milliseconds.
 * Prevents edge functions from hanging indefinitely on unresponsive external APIs.
 *
 * Default: 30 seconds — enough for most REST APIs.
 * For AI/audio APIs that may stream large responses, pass a higher value (e.g. 60_000).
 */
import { traceparentFor, traceIdFromRequestId } from "./trace.ts";
import { logWithRequestId } from "./request-id.ts";

export async function fetchWithTimeout(
  url: string | URL | Request,
  init?: RequestInit,
  timeoutMs = 30_000,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new DOMException("Request timed out", "TimeoutError")), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export interface FetchWithTraceOptions {
  /** Timeout em ms (default 30s). */
  timeoutMs?: number;
  /** request-id do handler (ctx.requestId) — origem do trace-id W3C. */
  requestId: string;
  /** Nome da edge function (para o log estruturado `external_call`). */
  fnName: string;
  /** Operação lógica (ex.: "slack_post", "resend_email") — tag do log. */
  operation?: string;
  /** 'info' (default) loga `external_call`; 'silent' desativa o log da chamada. */
  log?: "info" | "silent";
}

/**
 * fetch() com timeout + propagação de trace context W3C.
 *
 * Injeta `traceparent` (derivado do request-id) e `X-Request-Id` nos headers da
 * chamada — nunca sobrescreve um `traceparent` já setado pelo caller — e loga
 * `external_call` com o trace_id para correlação com o receiver.
 */
export async function fetchWithTrace(
  url: string | URL | Request,
  init: RequestInit | undefined,
  opts: FetchWithTraceOptions,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const traceparent = headers.get("traceparent") ?? traceparentFor(opts.requestId);
  headers.set("traceparent", traceparent);
  headers.set("X-Request-Id", opts.requestId);

  const traceId = traceparent.split("-")[1] ?? traceIdFromRequestId(opts.requestId);
  if (opts.log !== "silent") {
    let host = "unknown";
    try {
      host = typeof url === "string" || url instanceof URL ? new URL(url).host : new URL(url.url).host;
    } catch { /* url não-parseável — fetch vai falhar e propagar o erro real */ }
    logWithRequestId("info", opts.fnName, opts.requestId, "external_call", {
      operation: opts.operation ?? "fetch",
      host,
      trace_id: traceId,
      span_id: traceparent.split("-")[2] ?? null,
    });
  }

  return fetchWithTimeout(url, { ...init, headers }, opts.timeoutMs ?? 30_000);
}
