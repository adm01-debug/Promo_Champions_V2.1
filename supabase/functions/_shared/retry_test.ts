import { assertEquals, assertRejects } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { RetryError, withRetry } from "./retry.ts";

Deno.test("withRetry: success on first attempt", async () => {
  let calls = 0;
  const result = await withRetry(async () => {
    calls++;
    return "ok";
  }, { maxAttempts: 3, baseDelayMs: 1 });
  assertEquals(result, "ok");
  assertEquals(calls, 1);
});

Deno.test("withRetry: retries then succeeds", async () => {
  let calls = 0;
  const result = await withRetry(async () => {
    calls++;
    if (calls < 3) throw new Response("boom", { status: 503 });
    return "ok";
  }, { maxAttempts: 5, baseDelayMs: 1, maxDelayMs: 5 });
  assertEquals(result, "ok");
  assertEquals(calls, 3);
});

Deno.test("withRetry: non-retryable 4xx fails fast", async () => {
  let calls = 0;
  await assertRejects(
    () =>
      withRetry(async () => {
        calls++;
        throw new Response("bad", { status: 400 });
      }, {
        maxAttempts: 5,
        baseDelayMs: 1,
        isRetryable: (err) => err instanceof Response && err.status >= 500,
      }),
    RetryError,
  );
  assertEquals(calls, 1);
});

Deno.test("withRetry: exhausts attempts", async () => {
  let calls = 0;
  await assertRejects(
    () =>
      withRetry(async () => {
        calls++;
        throw new Response("nope", { status: 500 });
      }, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 2 }),
    RetryError,
  );
  assertEquals(calls, 3);
});

Deno.test("withRetry: honors external abort", async () => {
  const ctrl = new AbortController();
  ctrl.abort();
  await assertRejects(
    () => withRetry(async () => "never", { signal: ctrl.signal, maxAttempts: 3, baseDelayMs: 1 }),
    DOMException,
  );
});
