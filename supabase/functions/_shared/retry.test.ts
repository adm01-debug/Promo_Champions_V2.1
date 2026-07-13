// Deno tests para withRetry — foco em retry_exhausted, non_retryable, success_after_retry,
// Retry-After honoring e propagação de AbortSignal.
//
// Executar: deno test supabase/functions/_shared/retry.test.ts --allow-env
import {
  assert,
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { RetryError, withRetry } from "./retry.ts";

Deno.test("withRetry — sucesso na primeira tentativa não retorna RetryError", async () => {
  let calls = 0;
  const result = await withRetry(async () => {
    calls++;
    return "ok";
  }, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 2 });
  assertEquals(result, "ok");
  assertEquals(calls, 1);
});

Deno.test("withRetry — success_after_retry após 5xx transient", async () => {
  let calls = 0;
  const result = await withRetry(async () => {
    calls++;
    if (calls < 3) {
      return Promise.reject(new Response("boom", { status: 503 }));
    }
    return "ok";
  }, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 2 });
  assertEquals(result, "ok");
  assertEquals(calls, 3);
});

Deno.test("withRetry — retry_exhausted lança RetryError com attempts=maxAttempts", async () => {
  let calls = 0;
  const err = await assertRejects(
    () =>
      withRetry(async () => {
        calls++;
        return Promise.reject(new Response("nope", { status: 500 }));
      }, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 2 }),
    RetryError,
  );
  assertEquals(calls, 3);
  assertEquals(err.attempts, 3);
  assert(err.message.startsWith("retry_exhausted"));
});

Deno.test("withRetry — non_retryable (4xx) não faz retry", async () => {
  let calls = 0;
  await assertRejects(
    () =>
      withRetry(async () => {
        calls++;
        return Promise.reject(new Response("bad", { status: 400 }));
      }, {
        maxAttempts: 5,
        baseDelayMs: 1,
        maxDelayMs: 2,
        isRetryable: (e) => e instanceof Response && (e.status === 429 || e.status >= 500),
      }),
    RetryError,
  );
  assertEquals(calls, 1);
});

Deno.test("withRetry — honra Retry-After (segundos) em 429", async () => {
  let calls = 0;
  const delays: number[] = [];
  const start = Date.now();
  const result = await withRetry(async () => {
    calls++;
    if (calls === 1) {
      const r = new Response("slow down", {
        status: 429,
        headers: { "retry-after": "0" }, // 0s para manter o teste rápido
      });
      return Promise.reject(r);
    }
    return "ok";
  }, {
    maxAttempts: 3,
    baseDelayMs: 5000, // seria alto sem Retry-After override
    maxDelayMs: 10000,
    onRetry: (_e, _a, d) => delays.push(d),
  });
  assertEquals(result, "ok");
  assertEquals(calls, 2);
  assertEquals(delays.length, 1);
  assertEquals(delays[0], 0); // Retry-After: 0 sobrescreveu backoff
  assert(Date.now() - start < 1000, "não deve esperar 5s de backoff");
});

Deno.test("withRetry — AbortSignal externo interrompe antes de próxima tentativa", async () => {
  const ctrl = new AbortController();
  let calls = 0;
  const promise = withRetry(async () => {
    calls++;
    if (calls === 1) {
      // Aborta ANTES da segunda tentativa (durante o sleep)
      queueMicrotask(() => ctrl.abort());
      return Promise.reject(new Response("retry me", { status: 500 }));
    }
    return "should_not_reach";
  }, { maxAttempts: 3, baseDelayMs: 50, maxDelayMs: 100, signal: ctrl.signal });

  await assertRejects(() => promise, DOMException);
  assertEquals(calls, 1);
});
