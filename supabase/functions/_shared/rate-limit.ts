// _shared/rate-limit.ts
// Sliding-window in-memory rate limiter per edge-function isolate.
// Design goals:
//  - Zero DB dependency on the hot path (fail-open, sub-ms overhead).
//  - Per-IP + per-function bucket, so different functions don't share quotas.
//  - Bypass for authenticated calls (JWT-carrying requests) — public/anon only.
//  - Standard headers on responses (X-RateLimit-*, Retry-After).
//  - Best-effort audit log to public.rate_limit_logs when a request is blocked.
//
// NOTE: Because edge isolates can be scaled horizontally, this is a per-instance
// limiter — the effective global limit is (instances × limit). For basic abuse
// protection on public endpoints (log-web-vitals, receive-quote-sync webhook)
// this is sufficient and avoids adding a DB round-trip on every hit.

import { corsHeaders } from "./cors.ts";

export interface RateLimitConfig {
  /** Bucket name (typically the edge function name). */
  name: string;
  /** Max requests per window per client key. */
  limit: number;
  /** Sliding window size in seconds. */
  windowSeconds: number;
  /** If true, skip limiting when the caller presents an Authorization: Bearer token. */
  bypassAuthenticated?: boolean;
}

interface Bucket {
  timestamps: number[];
}

// Per-isolate storage. Keyed by `${name}:${clientKey}`.
const buckets = new Map<string, Bucket>();

// Periodic sweep to prevent unbounded growth. Runs at most once per minute.
let lastSweep = 0;
function sweep(nowMs: number) {
  if (nowMs - lastSweep < 60_000) return;
  lastSweep = nowMs;
  const cutoff = nowMs - 10 * 60_000; // drop anything untouched >10min
  for (const [k, b] of buckets) {
    if (b.timestamps.length === 0 || b.timestamps[b.timestamps.length - 1] < cutoff) {
      buckets.delete(k);
    }
  }
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  clientKey: string;
}

export function checkRateLimit(req: Request, cfg: RateLimitConfig): RateLimitResult {
  const nowMs = Date.now();
  sweep(nowMs);

  // Bypass authenticated (JWT-bearing) callers.
  if (cfg.bypassAuthenticated !== false) {
    const auth = req.headers.get("authorization");
    if (auth && /^Bearer\s+ey/i.test(auth)) {
      return {
        allowed: true,
        limit: cfg.limit,
        remaining: cfg.limit,
        resetSeconds: 0,
        clientKey: "authenticated",
      };
    }
  }

  const ip = getClientIp(req);
  const key = `${cfg.name}:${ip}`;
  const windowMs = cfg.windowSeconds * 1000;
  const cutoff = nowMs - windowMs;

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }
  // Drop old timestamps.
  while (bucket.timestamps.length && bucket.timestamps[0] < cutoff) {
    bucket.timestamps.shift();
  }

  const count = bucket.timestamps.length;
  if (count >= cfg.limit) {
    const oldest = bucket.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - nowMs) / 1000));
    return { allowed: false, limit: cfg.limit, remaining: 0, resetSeconds, clientKey: ip };
  }

  bucket.timestamps.push(nowMs);
  return {
    allowed: true,
    limit: cfg.limit,
    remaining: cfg.limit - count - 1,
    resetSeconds: cfg.windowSeconds,
    clientKey: ip,
  };
}

export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  const h: Record<string, string> = {
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset": String(r.resetSeconds),
  };
  if (!r.allowed) h["Retry-After"] = String(r.resetSeconds);
  return h;
}

/**
 * Convenience: enforce a limit and return a 429 Response when exceeded.
 * Returns `null` when the request should proceed.
 */
export function enforceRateLimit(req: Request, cfg: RateLimitConfig): Response | null {
  const r = checkRateLimit(req, cfg);
  if (r.allowed) return null;

  // Best-effort audit log — never blocks the response.
  const supaUrl = Deno.env.get("SUPABASE_URL");
  const supaKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (supaUrl && supaKey) {
    // deno-lint-ignore no-explicit-any
    (globalThis as any).queueMicrotask?.(() => {
      fetch(`${supaUrl}/rest/v1/rate_limit_logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supaKey,
          "Authorization": `Bearer ${supaKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          endpoint: cfg.name,
          identifier: r.clientKey,
          limit_value: cfg.limit,
          window_seconds: cfg.windowSeconds,
          blocked: true,
          user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
        }),
      }).catch(() => {/* fail-open */});
    });
  }

  return new Response(
    JSON.stringify({
      error: "rate_limit_exceeded",
      message: `Too many requests. Retry after ${r.resetSeconds}s.`,
      limit: r.limit,
      window_seconds: cfg.windowSeconds,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        ...rateLimitHeaders(r),
      },
    },
  );
}
