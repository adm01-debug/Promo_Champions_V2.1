// Retry/backoff logic extracted for testability.
// Pure functions + dependency injection (no direct Supabase / fetch / setTimeout).

export const MAX_ATTEMPTS = 3;
export const TIMEOUT_MS = 8000;

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

export interface DispatchResult {
  id: string;
  status: number;
  attempts: number;
  succeeded: boolean;
  error: string | null;
}

export interface DispatchDeps {
  fetchFn: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  insertDelivery: (row: DeliveryRow) => Promise<void>;
  updateSubscription: (id: string, status: number) => Promise<void>;
  now?: () => number;
  rand?: () => number;
  log?: (level: "info" | "warn" | "error", data: Record<string, unknown>) => void;
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

export async function dispatchOne(
  sub: Subscription,
  payload: Record<string, unknown>,
  deps: DispatchDeps,
): Promise<DispatchResult> {
  const { fetchFn, sleep, insertDelivery, updateSubscription, now = Date.now, rand = Math.random, log } = deps;
  const body = JSON.stringify({ ...payload, dispatched_at: new Date().toISOString() });
  const event = String(payload.event ?? "unknown");

  let finalStatus = 0;
  let finalAttempt = 0;
  let succeeded = false;
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    finalAttempt = attempt;
    const start = now();
    let status = 0;
    let errorMessage: string | null = null;

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
      errorMessage = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      lastError = errorMessage;
    }

    const duration = now() - start;
    const ok = status >= 200 && status < 300;
    succeeded = ok;
    finalStatus = status;
    if (ok) lastError = null;

    log?.(ok ? "info" : "warn", {
      msg: "delivery_attempt",
      subscription_id: sub.id,
      url: sub.url,
      event,
      attempt,
      status,
      duration_ms: duration,
      error: errorMessage,
    });

    // Best-effort delivery log — must not break retry loop.
    try {
      await insertDelivery({
        subscription_id: sub.id,
        event,
        payload,
        attempt,
        status,
        error_message: errorMessage,
        duration_ms: duration,
        succeeded: ok,
      });
    } catch (logErr) {
      log?.("error", { msg: "delivery_log_insert_failed", subscription_id: sub.id, error: String(logErr) });
    }

    if (ok) break;
    if (attempt < MAX_ATTEMPTS) {
      const wait = backoffDelay(attempt, rand);
      log?.("info", { msg: "backoff", subscription_id: sub.id, attempt, wait_ms: wait });
      await sleep(wait);
    }
  }

  try {
    await updateSubscription(sub.id, finalStatus);
  } catch (e) {
    log?.("error", { msg: "update_subscription_failed", subscription_id: sub.id, error: String(e) });
  }

  return { id: sub.id, status: finalStatus, attempts: finalAttempt, succeeded, error: lastError };
}
