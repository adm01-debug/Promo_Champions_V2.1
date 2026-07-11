// OBS-04 — Envelope HTTP padronizado para edge functions.
//
// Todas as respostas de edge functions DEVEM usar `jsonResponse` (sucesso) ou
// `errorEnvelope` (falha) para garantir:
//   - Header `X-Request-Id` presente em 100% das respostas.
//   - Corpo JSON com `request_id` correlacionável a logs estruturados.
//   - Envelope de erro padronizado `{ ok:false, error:{ code, message, details? }, request_id }`.
//
// Combina com `withRequestId` de `./request-id.ts`: o middleware injeta o id no
// header; estes helpers duplicam no body para consumidores que só olham o JSON.

import { corsHeaders } from "./cors.ts";

const REQ_ID_HEADER = "X-Request-Id";

export interface EnvelopeOptions {
  status?: number;
  requestId: string;
  extraHeaders?: HeadersInit;
}

export function jsonResponse<T>(data: T, opts: EnvelopeOptions): Response {
  const body = JSON.stringify({ ok: true, data, request_id: opts.requestId });
  return new Response(body, {
    status: opts.status ?? 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      [REQ_ID_HEADER]: opts.requestId,
      ...(opts.extraHeaders as Record<string, string> | undefined),
    },
  });
}

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "INTERNAL_ERROR";

const DEFAULT_STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  INTERNAL_ERROR: 500,
};

export function errorEnvelope(
  code: ErrorCode,
  message: string,
  opts: EnvelopeOptions & { details?: unknown },
): Response {
  const body = JSON.stringify({
    ok: false,
    error: { code, message, ...(opts.details !== undefined ? { details: opts.details } : {}) },
    request_id: opts.requestId,
  });
  return new Response(body, {
    status: opts.status ?? DEFAULT_STATUS[code],
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      [REQ_ID_HEADER]: opts.requestId,
    },
  });
}
