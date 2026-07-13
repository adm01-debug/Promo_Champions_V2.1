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
  let lastError: unknown;

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
      return result;
    } catch (err) {
      lastError = err;
      const isLast = attempt === cfg.maxAttempts - 1;
      if (isLast || !isRetryable(err, attempt)) {
        throw new RetryError(
          `retry_exhausted after ${attempt + 1} attempt(s): ${(err as Error)?.message ?? String(err)}`,
          attempt + 1,
          err,
        );
      }
      const retryAfterMs = extractRetryAfterMs(err);
      const delay = retryAfterMs ?? computeDelay(attempt, cfg.baseDelayMs, cfg.maxDelayMs);
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
