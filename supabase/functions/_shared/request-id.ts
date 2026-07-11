// OBS-03 — X-Request-Id middleware for edge functions.
// Adopts client-provided `X-Request-Id` when it's a valid UUID/short id
// (defense against log-injection); otherwise mints a fresh UUID. Propagates
// it to structured logs and echoes it in the response headers so callers can
// correlate a request across dispatcher → downstream → DB.

const REQ_ID_HEADER = "X-Request-Id";
// Accept UUIDs or short opaque ids (letters, digits, dash/underscore, 8-64 chars).
const SAFE_ID = /^[A-Za-z0-9_-]{8,64}$/;

export function extractOrMintRequestId(req: Request): string {
  const incoming = req.headers.get(REQ_ID_HEADER);
  if (incoming && SAFE_ID.test(incoming)) return incoming;
  return crypto.randomUUID();
}

export function withRequestIdHeader(headers: HeadersInit | undefined, requestId: string): Headers {
  const h = new Headers(headers ?? {});
  h.set(REQ_ID_HEADER, requestId);
  return h;
}

/** Wrap a Response so it always carries the X-Request-Id header. */
export function attachRequestId(res: Response, requestId: string): Response {
  const headers = withRequestIdHeader(res.headers, requestId);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

/** Structured JSON log entry with request correlation. Never logs headers/body. */
export function logWithRequestId(
  level: "info" | "warn" | "error",
  fnName: string,
  requestId: string,
  message: string,
  extra: Record<string, unknown> = {},
): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    fn: fnName,
    requestId,
    message,
    ...extra,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export interface RequestIdContext {
  requestId: string;
  log: (level: "info" | "warn" | "error", message: string, extra?: Record<string, unknown>) => void;
}

/**
 * withRequestId — wraps a handler so every response carries X-Request-Id,
 * and structured logs include the id. Handles thrown errors with a JSON envelope.
 */
export function withRequestId(
  fnName: string,
  handler: (req: Request, ctx: RequestIdContext) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const requestId = extractOrMintRequestId(req);
    const ctx: RequestIdContext = {
      requestId,
      log: (level, message, extra) => logWithRequestId(level, fnName, requestId, message, extra),
    };
    const started = Date.now();
    try {
      const res = await handler(req, ctx);
      ctx.log("info", "request_completed", { status: res.status, duration_ms: Date.now() - started });
      return attachRequestId(res, requestId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.log("error", "request_failed", { duration_ms: Date.now() - started, error: message });
      const body = JSON.stringify({ requestId, error: message });
      return new Response(body, {
        status: 500,
        headers: { "Content-Type": "application/json", [REQ_ID_HEADER]: requestId },
      });
    }
  };
}
