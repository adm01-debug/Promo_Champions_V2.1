// REL-03 — Retry helper com backoff exponencial + jitter.
// Uso em edge functions que chamam dependências externas (AI Gateway, webhooks, APIs).
//
// Design:
// - Exponential backoff: delay = baseMs * 2^attempt
// - Full jitter (AWS): random(0, delay) — evita retry storms sincronizados
// - Respeita Retry-After (segundos ou HTTP-date) quando fornecido
// - `isRetryable` classifica erros: por padrão 5xx e 429 são retriáveis; 4xx (exceto 429) não
// - Timeout hard por tentativa via AbortSignal.timeout
// - Não retry após signal externo abortado

export interface RetryConfig {
  maxAttempts?: number; // default 3
  baseDelayMs?: number; // default 250
  maxDelayMs?: number; // default 8000
  timeoutMs?: number; // default 10000 por tentativa
  isRetryable?: (err: unknown, attempt: number) => boolean;
  onRetry?: (err: unknown, attempt: number, delayMs: number) => void;
  signal?: AbortSignal;
  // Telemetria persistente em `edge_retry_events` (fire-and-forget via service_role).
  telemetry?: {
    functionName: string;
    operation: string;
    requestId?: string | null;
  };
}

interface SupabaseInsertClient {
  from(table: string): {
    insert(row: Record<string, unknown>): Promise<{ error: unknown }> | { error: unknown };
  };
}

let telemetryClient: SupabaseInsertClient | null = null;
function getTelemetryClient(): SupabaseInsertClient | null {
  if (telemetryClient) return telemetryClient;
  try {
    const url = (globalThis as { Deno?: { env: { get(k: string): string | undefined } } }).Deno?.env.get("SUPABASE_URL");
    const key = (globalThis as { Deno?: { env: { get(k: string): string | undefined } } }).Deno?.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return null;
    // Dynamic import via npm specifier (Deno-only). No-op no ambiente de testes puros.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any;
    if (!g.__retryTelemetryInit) {
      g.__retryTelemetryInit = import("npm:@supabase/supabase-js@2.49.4")
        .then((mod) => {
          telemetryClient = mod.createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
          }) as unknown as SupabaseInsertClient;
        })
        .catch(() => { /* swallow: telemetria é best-effort */ });
    }
  } catch { /* swallow */ }
  return telemetryClient;
}

async function emitRetryEvent(row: {
  function_name: string;
  operation: string;
  attempt: number;
  total_attempts?: number | null;
  outcome: "retry" | "success_after_retry" | "exhausted" | "non_retryable";
  status_code?: number | null;
  error_name?: string | null;
  error_message?: string | null;
  delay_ms?: number | null;
  request_id?: string | null;
}) {
  const client = getTelemetryClient();
  if (!client) return;
  try {
    await client.from("edge_retry_events").insert(row);
  } catch { /* swallow: best-effort */ }
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: unknown,
  ) {
    super(message);
    this.name = "RetryError";
  }
}

const DEFAULTS: Required<Omit<RetryConfig, "isRetryable" | "onRetry" | "signal">> = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 8000,
  timeoutMs: 10000,
};

function defaultIsRetryable(err: unknown): boolean {
  if (err instanceof Response) {
    return err.status === 429 || err.status >= 500;
  }
  if (err && typeof err === "object" && "status" in err) {
    const s = Number((err as { status: unknown }).status);
    if (Number.isFinite(s)) return s === 429 || s >= 500;
  }
  // AbortError (timeout), TypeError (fetch failed), network — retry
  const name = (err as { name?: string })?.name ?? "";
  if (name === "AbortError" || name === "TypeError") return true;
  return true; // conservador: retry por padrão em erros desconhecidos
}

function parseRetryAfter(headerValue: string | null): number | null {
  if (!headerValue) return null;
  const asSeconds = Number(headerValue);
  if (Number.isFinite(asSeconds) && asSeconds >= 0) return asSeconds * 1000;
  const asDate = Date.parse(headerValue);
  if (!Number.isNaN(asDate)) return Math.max(0, asDate - Date.now());
  return null;
}

function extractRetryAfterMs(err: unknown): number | null {
  if (err instanceof Response) return parseRetryAfter(err.headers.get("retry-after"));
  return null;
}

function computeDelay(attempt: number, base: number, max: number): number {
  const expo = Math.min(max, base * Math.pow(2, attempt));
  // Full jitter (AWS Architecture Blog): uniform(0, expo)
  return Math.floor(Math.random() * expo);
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const t = setTimeout(() => resolve(), ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

/**
 * Executa `fn` com retry exponencial + full jitter.
 * @throws RetryError após esgotar tentativas ou erro classificado como não-retriável.
 */
export async function withRetry<T>(
  fn: (attempt: number, signal: AbortSignal) => Promise<T>,
  config: RetryConfig = {},
): Promise<T> {
  const cfg = { ...DEFAULTS, ...config };
  const isRetryable = config.isRetryable ?? defaultIsRetryable;
  const tel = config.telemetry;
  let lastError: unknown;

  const errMeta = (err: unknown) => {
    const status = err instanceof Response
      ? err.status
      : (err && typeof err === "object" && "status" in err && Number.isFinite(Number((err as { status: unknown }).status))
        ? Number((err as { status: number }).status)
        : null);
    return {
      status_code: status,
      error_name: (err as { name?: string })?.name ?? null,
      error_message: ((err as Error)?.message ?? String(err))?.slice(0, 500) ?? null,
    };
  };

  for (let attempt = 0; attempt < cfg.maxAttempts; attempt++) {
    if (config.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    const perAttemptCtrl = new AbortController();
    const timeoutId = setTimeout(() => perAttemptCtrl.abort(), cfg.timeoutMs);
    const onExternalAbort = () => perAttemptCtrl.abort();
    config.signal?.addEventListener("abort", onExternalAbort, { once: true });

    try {
      const result = await fn(attempt, perAttemptCtrl.signal);
      if (tel && attempt > 0) {
        void emitRetryEvent({
          function_name: tel.functionName,
          operation: tel.operation,
          attempt: attempt + 1,
          total_attempts: attempt + 1,
          outcome: "success_after_retry",
          request_id: tel.requestId ?? null,
        });
      }
      return result;
    } catch (err) {
      lastError = err;
      const isLast = attempt === cfg.maxAttempts - 1;
      const retryable = isRetryable(err, attempt);
      if (isLast || !retryable) {
        if (tel) {
          const meta = errMeta(err);
          void emitRetryEvent({
            function_name: tel.functionName,
            operation: tel.operation,
            attempt: attempt + 1,
            total_attempts: attempt + 1,
            outcome: retryable ? "exhausted" : "non_retryable",
            request_id: tel.requestId ?? null,
            ...meta,
          });
        }
        throw new RetryError(
          `retry_exhausted after ${attempt + 1} attempt(s): ${(err as Error)?.message ?? String(err)}`,
          attempt + 1,
          err,
        );
      }
      const retryAfterMs = extractRetryAfterMs(err);
      const delay = retryAfterMs ?? computeDelay(attempt, cfg.baseDelayMs, cfg.maxDelayMs);
      if (tel) {
        const meta = errMeta(err);
        void emitRetryEvent({
          function_name: tel.functionName,
          operation: tel.operation,
          attempt: attempt + 1,
          outcome: "retry",
          delay_ms: delay,
          request_id: tel.requestId ?? null,
          ...meta,
        });
      }
      config.onRetry?.(err, attempt + 1, delay);
      await sleep(delay, config.signal);
    } finally {
      clearTimeout(timeoutId);
      config.signal?.removeEventListener("abort", onExternalAbort);
    }
  }

  throw new RetryError(
    `retry_exhausted after ${cfg.maxAttempts} attempt(s)`,
    cfg.maxAttempts,
    lastError,
  );
}
