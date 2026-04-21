// Retry/backoff logic extracted for testability.
// Pure functions + dependency injection (no direct Supabase / fetch / setTimeout).

export const MAX_ATTEMPTS = 3;
export const TIMEOUT_MS = 8000;

/**
 * Normalize unknown errors into a consistent shape for structured logs.
 * Stack is truncated to 4000 chars to keep log lines manageable.
 */
export function describeError(e: unknown): { error_name: string; error: string; error_stack: string | null } {
  if (e instanceof Error) {
    return {
      error_name: e.name || "Error",
      error: e.message || String(e),
      error_stack: e.stack ? e.stack.slice(0, 4000) : null,
    };
  }
  return { error_name: "UnknownError", error: String(e), error_stack: null };
}

export interface Subscription {
  id: string;
  url: string;
  events: string[];
  secret: string | null;
}

export interface DeliveryRow {
  subscription_id: string;
  event: string;
  payload: Record<string, unknown>;
  attempt: number;
  status: number;
  error_message: string | null;
  duration_ms: number;
  succeeded: boolean;
}

export interface DeadLetterEntry {
  subscription_id: string;
  event: string;
  payload: Record<string, unknown>;
  last_status: number;
  last_error: string | null;
  attempts: number;
  total_latency_ms: number;
}

export interface DispatchResult {
  id: string;
  status: number;
  attempts: number;
  succeeded: boolean;
  error: string | null;
  total_latency_ms: number;
}

export type LogLevel = "info" | "warn" | "error";
export type LogFn = (level: LogLevel, data: Record<string, unknown>) => void;

export interface DispatchDeps {
  fetchFn: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  insertDelivery: (row: DeliveryRow) => Promise<void>;
  updateSubscription: (id: string, status: number) => Promise<void>;
  /** Called once after all retries are exhausted without success. Best-effort. */
  onDeadLetter?: (entry: DeadLetterEntry) => Promise<void>;
  now?: () => number;
  rand?: () => number;
  log?: LogFn;
}

/**
 * Exponential backoff with jitter.
 * attempt=1 → 250ms base, attempt=2 → 500ms, attempt=3 → 1000ms (capped at 8000ms).
 * Adds 0–249ms of jitter on top.
 */
export function backoffDelay(attempt: number, rand: () => number = Math.random): number {
  const base = Math.min(8000, 2 ** (attempt - 1) * 250);
  const jitter = Math.floor(rand() * 250);
  return base + jitter;
}

/**
 * Strip internal control fields before serializing payload to external endpoint.
 * These are used for replay routing and should never leak to webhook receivers.
 */
function sanitizeOutboundPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const clone: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (k.startsWith("__")) continue;
    clone[k] = v;
  }
  return clone;
}

export async function dispatchOne(
  sub: Subscription,
  payload: Record<string, unknown>,
  deps: DispatchDeps,
): Promise<DispatchResult> {
  const { fetchFn, sleep, insertDelivery, updateSubscription, onDeadLetter, now = Date.now, rand = Math.random, log } = deps;
  const outbound = sanitizeOutboundPayload(payload);
  const body = JSON.stringify({ ...outbound, dispatched_at: new Date().toISOString() });
  const event = String(payload.event ?? "unknown");
  const dispatchStart = now();

  let finalStatus = 0;
  let finalAttempt = 0;
  let succeeded = false;
  let lastError: string | null = null;

  log?.("info", {
    msg: "subscription_dispatch_start",
    event,
    subscriptionId: sub.id,
    url: sub.url,
    max_attempts: MAX_ATTEMPTS,
    timeout_ms: TIMEOUT_MS,
  });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    finalAttempt = attempt;
    const start = now();
    let status = 0;
    let errorMessage: string | null = null;
    let errorName: string | null = null;
    let errorStack: string | null = null;

    try {
      const res = await fetchFn(sub.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Winloss-Event": event,
          ...(sub.secret ? { "X-Winloss-Signature": sub.secret } : {}),
        },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      status = res.status;
      try { await res.text(); } catch { /* noop */ }
    } catch (e) {
      const d = describeError(e);
      errorName = d.error_name;
      errorMessage = `${d.error_name}: ${d.error}`;
      errorStack = d.error_stack;
      lastError = errorMessage;
    }

    const latency = now() - start;
    const ok = status >= 200 && status < 300;
    succeeded = ok;
    finalStatus = status;
    if (ok) lastError = null;

    log?.(ok ? "info" : "warn", {
      msg: "delivery_attempt",
      event,
      subscriptionId: sub.id,
      url: sub.url,
      attempt,
      max_attempts: MAX_ATTEMPTS,
      status,
      latency_ms: latency,
      outcome: ok ? "success" : (errorName ? "network_error" : "http_error"),
      error_name: errorName,
      error: errorMessage,
    });

    try {
      await insertDelivery({
        subscription_id: sub.id,
        event,
        payload,
        attempt,
        status,
        error_message: errorMessage,
        duration_ms: latency,
        succeeded: ok,
      });
    } catch (logErr) {
      log?.("error", {
        msg: "delivery_log_insert_failed",
        event,
        subscriptionId: sub.id,
        attempt,
        error: logErr instanceof Error ? logErr.message : String(logErr),
      });
    }

    if (ok) break;
    if (attempt < MAX_ATTEMPTS) {
      const wait = backoffDelay(attempt, rand);
      log?.("info", {
        msg: "backoff_scheduled",
        event,
        subscriptionId: sub.id,
        attempt,
        next_attempt: attempt + 1,
        wait_ms: wait,
      });
      await sleep(wait);
    }
  }

  try {
    await updateSubscription(sub.id, finalStatus);
  } catch (e) {
    log?.("error", {
      msg: "update_subscription_failed",
      event,
      subscriptionId: sub.id,
      error: e instanceof Error ? e.message : String(e),
    });
  }

  const totalLatency = now() - dispatchStart;

  // Dead-letter on terminal failure
  if (!succeeded && onDeadLetter) {
    try {
      await onDeadLetter({
        subscription_id: sub.id,
        event,
        payload,
        last_status: finalStatus,
        last_error: lastError,
        attempts: finalAttempt,
        total_latency_ms: totalLatency,
      });
      log?.("warn", {
        msg: "dead_letter_recorded",
        event,
        subscriptionId: sub.id,
        last_status: finalStatus,
        attempts: finalAttempt,
      });
    } catch (e) {
      log?.("error", {
        msg: "dead_letter_insert_failed",
        event,
        subscriptionId: sub.id,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  log?.(succeeded ? "info" : "warn", {
    msg: "subscription_dispatch_complete",
    event,
    subscriptionId: sub.id,
    url: sub.url,
    succeeded,
    final_status: finalStatus,
    attempts: finalAttempt,
    total_latency_ms: totalLatency,
    error: lastError,
  });

  return {
    id: sub.id,
    status: finalStatus,
    attempts: finalAttempt,
    succeeded,
    error: lastError,
    total_latency_ms: totalLatency,
  };
}
