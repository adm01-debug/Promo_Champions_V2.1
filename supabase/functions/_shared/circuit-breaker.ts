// REL-02 — Edge Function circuit breaker helper.
// Purpose: wrap dependent calls (external APIs, DB RPCs) so a failing dependency
// does not cascade. Records state transitions to the `circuit_breaker_events`
// table via service_role (fire-and-forget). In-memory registry is per-isolate:
// this is intentional — Deno edge isolates recycle frequently and we prefer a
// low-coordination, low-latency breaker over strict global consistency.

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface EdgeCircuitConfig {
  failureThreshold?: number; // failures before opening
  resetTimeout?: number; // ms in OPEN before probing HALF_OPEN
  halfOpenMaxAttempts?: number; // probes allowed in HALF_OPEN
  timeoutMs?: number; // hard timeout applied to `fn`
  persistEvents?: boolean; // log transitions to DB
}

interface CircuitEntry {
  state: CircuitState;
  failures: number;
  lastFailure: number | null;
  halfOpenAttempts: number;
}

const DEFAULTS: Required<Omit<EdgeCircuitConfig, "persistEvents">> & { persistEvents: boolean } = {
  failureThreshold: 5,
  resetTimeout: 30_000,
  halfOpenMaxAttempts: 3,
  timeoutMs: 10_000,
  persistEvents: true,
};

const registry = new Map<string, CircuitEntry>();

export class CircuitBreakerOpenError extends Error {
  constructor(public circuitName: string) {
    super(`Circuit breaker "${circuitName}" is OPEN.`);
    this.name = "CircuitBreakerOpenError";
  }
}

function getEntry(name: string): CircuitEntry {
  let e = registry.get(name);
  if (!e) {
    e = { state: "CLOSED", failures: 0, lastFailure: null, halfOpenAttempts: 0 };
    registry.set(name, e);
  }
  return e;
}

async function logEvent(
  name: string,
  eventType: "opened" | "closed" | "half_open" | "failure",
  previous: CircuitState | null,
  next: CircuitState | null,
  failureCount: number,
  details: Record<string, unknown> = {},
): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/circuit_breaker_events`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([{
        circuit_name: name,
        event_type: eventType,
        previous_state: previous,
        new_state: next,
        failure_count: failureCount,
        details,
      }]),
    });
  } catch {
    // fire-and-forget
  }
}

function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    fn().then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

export async function withEdgeCircuitBreaker<T>(
  circuitName: string,
  fn: () => Promise<T>,
  config: EdgeCircuitConfig = {},
): Promise<T> {
  const cfg = { ...DEFAULTS, ...config };
  const c = getEntry(circuitName);

  // OPEN — refuse or promote to HALF_OPEN after reset window.
  if (c.state === "OPEN") {
    const elapsed = Date.now() - (c.lastFailure ?? 0);
    if (elapsed >= cfg.resetTimeout) {
      const prev = c.state;
      c.state = "HALF_OPEN";
      c.halfOpenAttempts = 0;
      if (cfg.persistEvents) void logEvent(circuitName, "half_open", prev, "HALF_OPEN", c.failures);
    } else {
      throw new CircuitBreakerOpenError(circuitName);
    }
  }

  if (c.state === "HALF_OPEN" && c.halfOpenAttempts >= cfg.halfOpenMaxAttempts) {
    throw new CircuitBreakerOpenError(circuitName);
  }
  if (c.state === "HALF_OPEN") c.halfOpenAttempts += 1;

  try {
    const result = await withTimeout(fn, cfg.timeoutMs);
    if (c.state === "HALF_OPEN") {
      const prev = c.state;
      c.state = "CLOSED";
      c.failures = 0;
      c.lastFailure = null;
      c.halfOpenAttempts = 0;
      if (cfg.persistEvents) void logEvent(circuitName, "closed", prev, "CLOSED", 0);
    } else if (c.failures > 0) {
      c.failures = Math.max(0, c.failures - 1);
    }
    return result;
  } catch (err) {
    c.failures += 1;
    c.lastFailure = Date.now();
    const prev = c.state;
    const errDetails = { message: err instanceof Error ? err.message : String(err) };

    if (prev === "HALF_OPEN") {
      c.state = "OPEN";
      if (cfg.persistEvents) void logEvent(circuitName, "opened", prev, "OPEN", c.failures, errDetails);
    } else if (c.failures >= cfg.failureThreshold) {
      c.state = "OPEN";
      if (cfg.persistEvents) void logEvent(circuitName, "opened", prev, "OPEN", c.failures, errDetails);
    } else if (cfg.persistEvents) {
      void logEvent(circuitName, "failure", prev, prev, c.failures, errDetails);
    }
    throw err;
  }
}

export function getEdgeCircuitState(name: string): CircuitEntry | null {
  const e = registry.get(name);
  return e ? { ...e } : null;
}

export function resetEdgeCircuit(name: string): void {
  const e = registry.get(name);
  if (!e) return;
  const prev = e.state;
  e.state = "CLOSED";
  e.failures = 0;
  e.lastFailure = null;
  e.halfOpenAttempts = 0;
  if (prev !== "CLOSED") void logEvent(name, "closed", prev, "CLOSED", 0, { reason: "manual_reset" });
}
