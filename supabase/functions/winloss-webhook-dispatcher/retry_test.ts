import { assertEquals, assert, assertGreaterOrEqual, assertLessOrEqual } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { backoffDelay, dispatchOne, MAX_ATTEMPTS, type DeadLetterEntry, type DeliveryRow, type DispatchDeps, type Subscription } from "./retry.ts";

const SUB: Subscription = { id: "sub-1", url: "https://example.test/hook", events: ["x"], secret: null };
const PAYLOAD = { event: "x", deal_id: "d1" };

interface Harness {
  deps: DispatchDeps;
  fetches: number;
  sleeps: number[];
  deliveries: DeliveryRow[];
  updates: Array<{ id: string; status: number }>;
  deadLetters: DeadLetterEntry[];
}

function makeHarness(
  fetchImpl: (attempt: number) => Promise<Response> | Response,
  opts: { rand?: () => number; insertThrows?: boolean; deadLetterThrows?: boolean; withDeadLetter?: boolean } = {},
): Harness {
  let attempt = 0;
  const sleeps: number[] = [];
  const deliveries: DeliveryRow[] = [];
  const updates: Array<{ id: string; status: number }> = [];
  const deadLetters: DeadLetterEntry[] = [];

  const deps: DispatchDeps = {
    fetchFn: ((..._args: Parameters<typeof fetch>) => {
      attempt += 1;
      return Promise.resolve(fetchImpl(attempt));
    }) as typeof fetch,
    sleep: (ms: number) => { sleeps.push(ms); return Promise.resolve(); },
    insertDelivery: (row) => {
      if (opts.insertThrows) return Promise.reject(new Error("log failed"));
      deliveries.push(row);
      return Promise.resolve();
    },
    updateSubscription: (id, status) => { updates.push({ id, status }); return Promise.resolve(); },
    onDeadLetter: opts.withDeadLetter
      ? (entry) => {
          if (opts.deadLetterThrows) return Promise.reject(new Error("dlq insert failed"));
          deadLetters.push(entry);
          return Promise.resolve();
        }
      : undefined,
    rand: opts.rand ?? (() => 0),
    now: () => 0,
    log: () => {},
  };

  return {
    deps,
    get fetches() { return attempt; },
    sleeps,
    deliveries,
    updates,
    deadLetters,
  } as Harness;
}

// ───────────── backoffDelay ─────────────

Deno.test("backoffDelay: attempt 1 returns 250ms with rand=0", () => {
  assertEquals(backoffDelay(1, () => 0), 250);
});

Deno.test("backoffDelay: jitter is bounded [0, 249]", () => {
  assertEquals(backoffDelay(1, () => 0.999), 250 + 249);
});

Deno.test("backoffDelay: exponential progression 250 → 500 → 1000", () => {
  assertEquals(backoffDelay(1, () => 0), 250);
  assertEquals(backoffDelay(2, () => 0), 500);
  assertEquals(backoffDelay(3, () => 0), 1000);
});

Deno.test("backoffDelay: ranges include jitter", () => {
  for (let a = 1; a <= 3; a += 1) {
    const lo = backoffDelay(a, () => 0);
    const hi = backoffDelay(a, () => 0.999);
    assertGreaterOrEqual(hi, lo);
    assertLessOrEqual(hi - lo, 250);
  }
});

Deno.test("backoffDelay: caps at 8000ms base", () => {
  // 2^19 * 250 would be huge; expect cap.
  const v = backoffDelay(20, () => 0);
  assertEquals(v, 8000);
});

// ───────────── dispatchOne ─────────────

Deno.test("dispatchOne: success on 1st attempt → no sleeps, 1 delivery", async () => {
  const h = makeHarness(() => new Response("ok", { status: 200 }));
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(h.fetches, 1);
  assertEquals(h.sleeps.length, 0);
  assertEquals(h.deliveries.length, 1);
  assertEquals(r.attempts, 1);
  assertEquals(r.succeeded, true);
  assertEquals(r.status, 200);
  assertEquals(h.updates, [{ id: "sub-1", status: 200 }]);
});

Deno.test("dispatchOne: persistent 500 → 3 attempts, 2 sleeps, 3 deliveries", async () => {
  const h = makeHarness(() => new Response("err", { status: 500 }));
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(h.fetches, MAX_ATTEMPTS);
  assertEquals(h.sleeps.length, MAX_ATTEMPTS - 1);
  assertEquals(h.deliveries.length, 3);
  assertEquals(r.attempts, 3);
  assertEquals(r.succeeded, false);
  assertEquals(r.status, 500);
  // Backoff order: 250 then 500 (rand=0)
  assertEquals(h.sleeps, [250, 500]);
  // Every delivery row records the failure
  for (const d of h.deliveries) {
    assertEquals(d.status, 500);
    assertEquals(d.succeeded, false);
  }
});

Deno.test("dispatchOne: persistent network error → 3 attempts, error preserved", async () => {
  const h = makeHarness(() => { throw new Error("ECONNREFUSED"); });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(h.fetches, 3);
  assertEquals(h.sleeps.length, 2);
  assertEquals(r.attempts, 3);
  assertEquals(r.succeeded, false);
  assertEquals(r.status, 0);
  assert(r.error?.includes("ECONNREFUSED"));
  assertEquals(h.deliveries.length, 3);
  for (const d of h.deliveries) {
    assertEquals(d.status, 0);
    assert(d.error_message?.includes("ECONNREFUSED"));
  }
});

Deno.test("dispatchOne: AbortError (timeout) treated as failure with retries", async () => {
  const h = makeHarness(() => {
    const e = new Error("signal timed out");
    e.name = "TimeoutError";
    throw e;
  });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(r.attempts, 3);
  assertEquals(r.succeeded, false);
  assert(r.error?.includes("TimeoutError"));
});

Deno.test("dispatchOne: recovery on 3rd attempt → succeeded, 2 sleeps, 3 deliveries", async () => {
  const h = makeHarness((n) => n < 3 ? new Response("x", { status: 500 }) : new Response("ok", { status: 200 }));
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(h.fetches, 3);
  assertEquals(h.sleeps, [250, 500]);
  assertEquals(r.succeeded, true);
  assertEquals(r.attempts, 3);
  assertEquals(r.status, 200);
  assertEquals(r.error, null);
  assertEquals(h.deliveries[2].succeeded, true);
  assertEquals(h.updates[0].status, 200);
});

Deno.test("dispatchOne: recovery on 2nd attempt stops loop early", async () => {
  const h = makeHarness((n) => n === 1 ? new Response("x", { status: 502 }) : new Response("ok", { status: 201 }));
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(h.fetches, 2);
  assertEquals(h.sleeps, [250]);
  assertEquals(r.succeeded, true);
  assertEquals(r.attempts, 2);
  assertEquals(r.status, 201);
});

Deno.test("dispatchOne: insertDelivery failure does NOT break retry loop", async () => {
  const h = makeHarness(() => new Response("err", { status: 503 }), { insertThrows: true });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(h.fetches, 3);
  assertEquals(h.sleeps.length, 2);
  assertEquals(r.attempts, 3);
  assertEquals(r.succeeded, false);
  // Deliveries array stayed empty because insert threw, but that's fine.
  assertEquals(h.deliveries.length, 0);
});

Deno.test("dispatchOne: updateSubscription called once with final status", async () => {
  const h = makeHarness(() => new Response("err", { status: 500 }));
  await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(h.updates.length, 1);
  assertEquals(h.updates[0], { id: "sub-1", status: 500 });
});

Deno.test("dispatchOne: jitter applied to sleeps when rand > 0", async () => {
  const h = makeHarness(() => new Response("err", { status: 500 }), { rand: () => 0.5 });
  await dispatchOne(SUB, PAYLOAD, h.deps);
  // 250 + floor(0.5*250)=125 → 375; 500 + 125 → 625
  assertEquals(h.sleeps, [375, 625]);
});

// ───────────── dead-letter ─────────────

Deno.test("dispatchOne: onDeadLetter chamado após 3 falhas", async () => {
  const h = makeHarness(() => new Response("err", { status: 503 }), { withDeadLetter: true });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(r.succeeded, false);
  assertEquals(h.deadLetters.length, 1);
  const e = h.deadLetters[0];
  assertEquals(e.subscription_id, "sub-1");
  assertEquals(e.event, "x");
  assertEquals(e.last_status, 503);
  assertEquals(e.attempts, 3);
  assertEquals(e.payload, PAYLOAD);
});

Deno.test("dispatchOne: onDeadLetter NÃO chamado em sucesso (1ª, 2ª, 3ª)", async () => {
  for (const succeedAt of [1, 2, 3]) {
    const h = makeHarness(
      (n) => n < succeedAt ? new Response("x", { status: 500 }) : new Response("ok", { status: 200 }),
      { withDeadLetter: true },
    );
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);
    assertEquals(r.succeeded, true);
    assertEquals(h.deadLetters.length, 0, `succeedAt=${succeedAt} não deveria gerar DLQ`);
  }
});

Deno.test("dispatchOne: erro em onDeadLetter é absorvido (não propaga)", async () => {
  const h = makeHarness(() => new Response("err", { status: 500 }), {
    withDeadLetter: true,
    deadLetterThrows: true,
  });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(r.succeeded, false);
  assertEquals(r.attempts, 3);
  assertEquals(h.deadLetters.length, 0);
});

Deno.test("dispatchOne: payload com __replay_of/__target_subscription_id NÃO vai no body externo", async () => {
  let capturedBody = "";
  const h = makeHarness(() => new Response("ok", { status: 200 }));
  const origFetch = h.deps.fetchFn;
  h.deps.fetchFn = ((input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    capturedBody = String((init as { body?: unknown })?.body ?? "");
    return origFetch(input, init);
  }) as typeof fetch;
  await dispatchOne(SUB, { event: "x", deal: 1, __replay_of: "abc", __target_subscription_id: "sub-1" }, h.deps);
  assert(!capturedBody.includes("__replay_of"));
  assert(!capturedBody.includes("__target_subscription_id"));
  assert(capturedBody.includes('"deal":1'));
});
