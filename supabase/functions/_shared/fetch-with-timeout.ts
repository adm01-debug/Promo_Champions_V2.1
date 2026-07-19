/**
 * fetch() wrapper that aborts after `timeoutMs` milliseconds.
 * Prevents edge functions from hanging indefinitely on unresponsive external APIs.
 *
 * Default: 30 seconds — enough for most REST APIs.
 * For AI/audio APIs that may stream large responses, pass a higher value (e.g. 60_000).
 */
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
