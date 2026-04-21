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

// ───────────── timeout via AbortError: 3 tentativas + error_message por entrega ─────────────

/** Build an AbortError that mirrors what `AbortSignal.timeout(...)` throws in some runtimes. */
function makeAbortError(message = "The signal has been aborted"): Error {
  const e = new Error(message);
  e.name = "AbortError";
  return e;
}

Deno.test("timeout/AbortError: persistente → exatamente 3 fetches, 2 sleeps, 3 deliveries", async () => {
  const h = makeHarness(() => { throw makeAbortError(); }, { withDeadLetter: true });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.fetches, MAX_ATTEMPTS);
  assertEquals(h.sleeps.length, MAX_ATTEMPTS - 1);
  assertEquals(h.sleeps, [250, 500]); // backoff determinístico com rand=0
  assertEquals(h.deliveries.length, MAX_ATTEMPTS);
  assertEquals(r.attempts, MAX_ATTEMPTS);
  assertEquals(r.succeeded, false);
  assertEquals(r.status, 0);
});

Deno.test("timeout/AbortError: cada uma das 3 entregas registra error_message='AbortError: ...'", async () => {
  const h = makeHarness(() => { throw makeAbortError("The signal has been aborted"); });
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.deliveries.length, 3);
  for (let i = 0; i < h.deliveries.length; i += 1) {
    const d = h.deliveries[i];
    assertEquals(d.attempt, i + 1, `attempt # da entrega ${i}`);
    assertEquals(d.status, 0, `status da entrega ${i}`);
    assertEquals(d.succeeded, false, `succeeded da entrega ${i}`);
    assertEquals(
      d.error_message,
      "AbortError: The signal has been aborted",
      `error_message exato da entrega ${i}`,
    );
    assertEquals(d.subscription_id, SUB.id);
    assertEquals(d.event, "x");
  }
});

Deno.test("timeout/AbortError: dead-letter capturado com last_error e attempts=3", async () => {
  const h = makeHarness(() => { throw makeAbortError("aborted by timeout"); }, { withDeadLetter: true });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, false);
  assertEquals(h.deadLetters.length, 1);
  const dlq = h.deadLetters[0];
  assertEquals(dlq.attempts, MAX_ATTEMPTS);
  assertEquals(dlq.last_status, 0);
  assertEquals(dlq.last_error, "AbortError: aborted by timeout");
  assertEquals(dlq.subscription_id, SUB.id);
  assertEquals(dlq.event, "x");
  assertEquals(dlq.payload, PAYLOAD);
});

Deno.test("timeout/AbortError: error_message muda por tentativa quando o erro varia", async () => {
  // Cada attempt lança AbortError com mensagem distinta. Cada delivery deve refletir o seu próprio
  // erro, e r.error preserva apenas o ÚLTIMO.
  const expected = [
    "AbortError: timeout after 8000ms (try 1)",
    "AbortError: timeout after 8000ms (try 2)",
    "AbortError: timeout after 8000ms (try 3)",
  ];
  const h = makeHarness((attempt) => {
    const e = new Error(`timeout after 8000ms (try ${attempt})`);
    e.name = "AbortError";
    throw e;
  });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.attempts, 3);
  assertEquals(h.deliveries.length, 3);
  assertEquals(h.deliveries[0].error_message, expected[0]);
  assertEquals(h.deliveries[1].error_message, expected[1]);
  assertEquals(h.deliveries[2].error_message, expected[2]);
  assertEquals(r.error, expected[2]);
});

Deno.test("timeout/AbortError: recovery após 2 timeouts → 3ª tentativa 200, error_message null só na última", async () => {
  const h = makeHarness((n) => {
    if (n < 3) throw makeAbortError(`timeout #${n}`);
    return new Response("ok", { status: 200 });
  });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, true);
  assertEquals(r.attempts, 3);
  assertEquals(r.status, 200);
  assertEquals(r.error, null);

  assertEquals(h.deliveries.length, 3);
  assertEquals(h.deliveries[0].error_message, "AbortError: timeout #1");
  assertEquals(h.deliveries[0].succeeded, false);
  assertEquals(h.deliveries[1].error_message, "AbortError: timeout #2");
  assertEquals(h.deliveries[1].succeeded, false);
  assertEquals(h.deliveries[2].error_message, null);
  assertEquals(h.deliveries[2].succeeded, true);
  assertEquals(h.deliveries[2].status, 200);
});

Deno.test("timeout/TimeoutError variant: todas as 3 entregas registram 'TimeoutError: ...'", async () => {
  // Em runtimes recentes, AbortSignal.timeout() lança DOMException com name='TimeoutError'.
  const h = makeHarness(() => {
    const e = new Error("signal timed out after 8000ms");
    e.name = "TimeoutError";
    throw e;
  });
  await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(h.deliveries.length, 3);
  for (const d of h.deliveries) {
    assertEquals(d.status, 0);
    assertEquals(d.succeeded, false);
    assertEquals(d.error_message, "TimeoutError: signal timed out after 8000ms");
  }
});

// ───────────── persistência por tentativa + ausência de sleep na última ─────────────

Deno.test("persist: falha persistente 500 grava 3 linhas com attempt=1,2,3 em ordem cronológica", async () => {
  const h = makeHarness(() => new Response("err", { status: 500 }));
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.deliveries.length, MAX_ATTEMPTS);
  for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
    const d = h.deliveries[i];
    assertEquals(d.attempt, i + 1, `attempt da entrega #${i}`);
    assertEquals(d.status, 500, `status da entrega #${i}`);
    assertEquals(d.succeeded, false, `succeeded da entrega #${i}`);
    assertEquals(d.subscription_id, SUB.id);
    assertEquals(d.event, "x");
  }
});

Deno.test("persist: status varia por tentativa (502 → 503 → 200) é refletido linha-a-linha", async () => {
  const responses = [
    new Response("bad gateway", { status: 502 }),
    new Response("unavailable", { status: 503 }),
    new Response("ok", { status: 200 }),
  ];
  const h = makeHarness((n) => responses[n - 1]);
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, true);
  assertEquals(h.deliveries.length, 3);
  assertEquals(h.deliveries[0].attempt, 1);
  assertEquals(h.deliveries[0].status, 502);
  assertEquals(h.deliveries[0].succeeded, false);
  assertEquals(h.deliveries[1].attempt, 2);
  assertEquals(h.deliveries[1].status, 503);
  assertEquals(h.deliveries[1].succeeded, false);
  assertEquals(h.deliveries[2].attempt, 3);
  assertEquals(h.deliveries[2].status, 200);
  assertEquals(h.deliveries[2].succeeded, true);
});

Deno.test("persist: mistura HTTP + erro de rede preserva status=0 só onde há throw", async () => {
  const h = makeHarness((n) => {
    if (n === 1) return new Response("err", { status: 500 });
    if (n === 2) throw new Error("ENETDOWN");
    return new Response("ok", { status: 200 });
  });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, true);
  assertEquals(h.deliveries.length, 3);

  assertEquals(h.deliveries[0].status, 500);
  assertEquals(h.deliveries[0].error_message, null);
  assertEquals(h.deliveries[0].succeeded, false);

  assertEquals(h.deliveries[1].status, 0);
  assert(h.deliveries[1].error_message?.includes("ENETDOWN"));
  assertEquals(h.deliveries[1].succeeded, false);

  assertEquals(h.deliveries[2].status, 200);
  assertEquals(h.deliveries[2].error_message, null);
  assertEquals(h.deliveries[2].succeeded, true);
});

Deno.test("invariante: sleeps === fetches - 1 === deliveries - 1 em todos os caminhos", async () => {
  const scenarios: Array<{
    label: string;
    fetchImpl: (n: number) => Response;
    expectedFetches: number;
  }> = [
    {
      label: "sucesso na 1ª",
      fetchImpl: () => new Response("ok", { status: 200 }),
      expectedFetches: 1,
    },
    {
      label: "sucesso na 2ª",
      fetchImpl: (n) => n === 1 ? new Response("x", { status: 500 }) : new Response("ok", { status: 200 }),
      expectedFetches: 2,
    },
    {
      label: "sucesso na 3ª",
      fetchImpl: (n) => n < 3 ? new Response("x", { status: 500 }) : new Response("ok", { status: 200 }),
      expectedFetches: 3,
    },
    {
      label: "falha persistente",
      fetchImpl: () => new Response("x", { status: 500 }),
      expectedFetches: 3,
    },
  ];

  for (const sc of scenarios) {
    const h = makeHarness(sc.fetchImpl);
    await dispatchOne(SUB, PAYLOAD, h.deps);
    assertEquals(h.fetches, sc.expectedFetches, `[${sc.label}] fetches`);
    assertEquals(h.deliveries.length, sc.expectedFetches, `[${sc.label}] deliveries == fetches`);
    assertEquals(h.sleeps.length, sc.expectedFetches - 1, `[${sc.label}] sleeps == fetches-1 (sem sleep após a última)`);
    assertEquals(h.sleeps.length, h.deliveries.length - 1, `[${sc.label}] sleeps == deliveries-1`);
  }
});

Deno.test("ordem: insert precede sleep — sequência exata em falha persistente", async () => {
  const events: string[] = [];
  const h = makeHarness(() => new Response("err", { status: 500 }));
  const origInsert = h.deps.insertDelivery;
  const origSleep = h.deps.sleep;
  h.deps.insertDelivery = async (row) => {
    events.push(`insert:${row.attempt}`);
    await origInsert(row);
  };
  h.deps.sleep = async (ms) => {
    const idx = events.filter((e) => e.startsWith("sleep:")).length + 1;
    events.push(`sleep:${idx}`);
    await origSleep(ms);
  };

  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(events, ["insert:1", "sleep:1", "insert:2", "sleep:2", "insert:3"]);
  assert(!events[events.length - 1].startsWith("sleep:"), "última operação não pode ser um sleep");
});

Deno.test("ordem: sucesso na 2ª — sequência é exatamente insert:1, sleep:1, insert:2", async () => {
  const events: string[] = [];
  const h = makeHarness((n) => n === 1 ? new Response("x", { status: 500 }) : new Response("ok", { status: 200 }));
  const origInsert = h.deps.insertDelivery;
  const origSleep = h.deps.sleep;
  h.deps.insertDelivery = async (row) => {
    events.push(`insert:${row.attempt}`);
    await origInsert(row);
  };
  h.deps.sleep = async (ms) => {
    const idx = events.filter((e) => e.startsWith("sleep:")).length + 1;
    events.push(`sleep:${idx}`);
    await origSleep(ms);
  };

  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(events, ["insert:1", "sleep:1", "insert:2"]);
  assert(!events[events.length - 1].startsWith("sleep:"), "última operação não pode ser um sleep");
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

// ───────────── fan-out: 1 evento → N subscriptions ─────────────

interface FanoutHarness {
  deps: DispatchDeps;
  fetchesByUrl: Record<string, number>;
  capturedInits: Array<{ url: string; init: RequestInit }>;
  deliveries: DeliveryRow[];
  updates: Array<{ id: string; status: number }>;
  deadLetters: DeadLetterEntry[];
  sleepsByUrl: Record<string, number[]>;
}

function makeFanoutHarness(
  routes: Record<string, (attemptForThisUrl: number) => Response>,
  opts: { withDeadLetter?: boolean } = {},
): FanoutHarness {
  const fetchesByUrl: Record<string, number> = {};
  const capturedInits: Array<{ url: string; init: RequestInit }> = [];
  const deliveries: DeliveryRow[] = [];
  const updates: Array<{ id: string; status: number }> = [];
  const deadLetters: DeadLetterEntry[] = [];
  const sleepsByUrl: Record<string, number[]> = {};
  let currentUrl: string | null = null;

  const deps: DispatchDeps = {
    fetchFn: ((input: Parameters<typeof fetch>[0], init?: RequestInit) => {
      const url = typeof input === "string" ? input : (input as URL | Request).toString();
      currentUrl = url;
      capturedInits.push({ url, init: init ?? {} });
      fetchesByUrl[url] = (fetchesByUrl[url] ?? 0) + 1;
      const handler = routes[url];
      if (!handler) return Promise.reject(new Error(`no route for ${url}`));
      return Promise.resolve(handler(fetchesByUrl[url]));
    }) as typeof fetch,
    sleep: (ms: number) => {
      if (currentUrl) {
        sleepsByUrl[currentUrl] = sleepsByUrl[currentUrl] ?? [];
        sleepsByUrl[currentUrl].push(ms);
      }
      return Promise.resolve();
    },
    insertDelivery: (row) => { deliveries.push(row); return Promise.resolve(); },
    updateSubscription: (id, status) => { updates.push({ id, status }); return Promise.resolve(); },
    onDeadLetter: opts.withDeadLetter ? (entry) => { deadLetters.push(entry); return Promise.resolve(); } : undefined,
    rand: () => 0,
    now: () => 0,
    log: () => {},
  };

  return { deps, fetchesByUrl, capturedInits, deliveries, updates, deadLetters, sleepsByUrl };
}

const SUB_A: Subscription = { id: "sub-A", url: "https://a.test/hook", events: ["x"], secret: null };
const SUB_B: Subscription = { id: "sub-B", url: "https://b.test/hook", events: ["x"], secret: null };
const SUB_C: Subscription = { id: "sub-C", url: "https://c.test/hook", events: ["x"], secret: "shh" };

Deno.test("fan-out: 3 subs todas 2xx → 1 POST por sub e last_status=200 individual", async () => {
  const h = makeFanoutHarness({
    [SUB_A.url]: () => new Response("ok", { status: 200 }),
    [SUB_B.url]: () => new Response("ok", { status: 201 }),
    [SUB_C.url]: () => new Response(null, { status: 204 }),
  });
  const subs = [SUB_A, SUB_B, SUB_C];
  const results = await Promise.all(subs.map((s) => dispatchOne(s, PAYLOAD, h.deps)));

  assertEquals(h.fetchesByUrl[SUB_A.url], 1);
  assertEquals(h.fetchesByUrl[SUB_B.url], 1);
  assertEquals(h.fetchesByUrl[SUB_C.url], 1);
  assertEquals(h.deliveries.length, 3);

  const byId = Object.fromEntries(h.updates.map((u) => [u.id, u.status]));
  assertEquals(byId["sub-A"], 200);
  assertEquals(byId["sub-B"], 201);
  assertEquals(byId["sub-C"], 204);

  for (const r of results) assert(r.succeeded);
});

Deno.test("fan-out: sucesso e falha são independentes por subscription", async () => {
  const h = makeFanoutHarness({
    [SUB_A.url]: () => new Response("ok", { status: 200 }),
    [SUB_B.url]: () => new Response("err", { status: 500 }),
    [SUB_C.url]: () => new Response("ok", { status: 200 }),
  }, { withDeadLetter: true });

  const results = await Promise.all([SUB_A, SUB_B, SUB_C].map((s) => dispatchOne(s, PAYLOAD, h.deps)));

  // A e C: 1 POST. B: 3 POSTs (3 retries).
  assertEquals(h.fetchesByUrl[SUB_A.url], 1);
  assertEquals(h.fetchesByUrl[SUB_B.url], MAX_ATTEMPTS);
  assertEquals(h.fetchesByUrl[SUB_C.url], 1);

  // last_status individual
  const byId = Object.fromEntries(h.updates.map((u) => [u.id, u.status]));
  assertEquals(byId["sub-A"], 200);
  assertEquals(byId["sub-B"], 500);
  assertEquals(byId["sub-C"], 200);

  // só B vai para dead letter
  assertEquals(h.deadLetters.length, 1);
  assertEquals(h.deadLetters[0].subscription_id, "sub-B");

  // resultados preservam succeeded por id
  const resById = Object.fromEntries(results.map((r) => [r.id, r.succeeded]));
  assertEquals(resById["sub-A"], true);
  assertEquals(resById["sub-B"], false);
  assertEquals(resById["sub-C"], true);
});

Deno.test("fan-out: cada POST carrega header X-Winloss-Event correto e payload sanitizado", async () => {
  const h = makeFanoutHarness({
    [SUB_A.url]: () => new Response("ok", { status: 200 }),
    [SUB_B.url]: () => new Response("ok", { status: 200 }),
    [SUB_C.url]: () => new Response("ok", { status: 200 }),
  });
  const payload = { event: "x", deal_id: "d-99", __replay_of: "should-not-leak" };
  await Promise.all([SUB_A, SUB_B, SUB_C].map((s) => dispatchOne(s, payload, h.deps)));

  assertEquals(h.capturedInits.length, 3);
  for (const { url, init } of h.capturedInits) {
    assertEquals(init.method, "POST");
    const headers = init.headers as Record<string, string>;
    assertEquals(headers["X-Winloss-Event"], "x");
    assertEquals(headers["Content-Type"], "application/json");
    const body = String(init.body);
    assert(body.includes('"deal_id":"d-99"'), `body for ${url} missing deal_id`);
    assert(!body.includes("__replay_of"), `body for ${url} leaked __replay_of`);
  }
  // Apenas SUB_C tem secret → header de assinatura
  const cInit = h.capturedInits.find((c) => c.url === SUB_C.url)!;
  assertEquals((cInit.init.headers as Record<string, string>)["X-Winloss-Signature"], "shh");
  const aInit = h.capturedInits.find((c) => c.url === SUB_A.url)!;
  assertEquals((aInit.init.headers as Record<string, string>)["X-Winloss-Signature"], undefined);
});

Deno.test("fan-out: retries de uma sub não acoplam às outras (sleeps isolados)", async () => {
  const h = makeFanoutHarness({
    [SUB_A.url]: () => new Response("ok", { status: 200 }),
    [SUB_B.url]: () => new Response("err", { status: 503 }),
    [SUB_C.url]: () => new Response("ok", { status: 200 }),
  });
  await Promise.all([SUB_A, SUB_B, SUB_C].map((s) => dispatchOne(s, PAYLOAD, h.deps)));

  // Total de fetches = 1 (A) + 3 (B) + 1 (C) = 5 → prova que B fez seus retries sem A/C "esperarem"
  assertEquals(h.fetchesByUrl[SUB_A.url], 1);
  assertEquals(h.fetchesByUrl[SUB_B.url], MAX_ATTEMPTS);
  assertEquals(h.fetchesByUrl[SUB_C.url], 1);

  // Total de sleeps no fan-out inteiro = MAX_ATTEMPTS - 1 (apenas os backoffs entre tentativas de B)
  const totalSleeps = Object.values(h.sleepsByUrl).reduce((a, arr) => a + arr.length, 0);
  assertEquals(totalSleeps, MAX_ATTEMPTS - 1);

  // Cada sub atualiza last_status exatamente uma vez
  assertEquals(h.updates.filter((u) => u.id === "sub-A").length, 1);
  assertEquals(h.updates.filter((u) => u.id === "sub-B").length, 1);
  assertEquals(h.updates.filter((u) => u.id === "sub-C").length, 1);
});

// ───────────── resiliência: insertDelivery falhando ─────────────

Deno.test("insertDelivery falha em todas: dispatcher executa as 3 tentativas mesmo assim", async () => {
  const h = makeHarness(() => new Response("err", { status: 500 }), { insertThrows: true });
  const result = await dispatchOne(SUB, PAYLOAD, h.deps);

  // Loop completo apesar de todos os inserts falharem
  assertEquals(h.fetches, MAX_ATTEMPTS);
  assertEquals(h.sleeps.length, MAX_ATTEMPTS - 1);
  assertEquals(h.sleeps, [250, 500]);
  // Nada persistido (todos rejeitaram)
  assertEquals(h.deliveries.length, 0);
  // Resultado final coerente
  assertEquals(result.succeeded, false);
  assertEquals(result.attempts, 3);
  assertEquals(result.status, 500);
});

Deno.test("insertDelivery falha em todas + sucesso na 3ª: dispatcher retorna succeeded", async () => {
  const responses = [
    () => new Response("err", { status: 500 }),
    () => new Response("err", { status: 500 }),
    () => new Response("ok", { status: 200 }),
  ];
  const h = makeHarness((attempt) => responses[attempt - 1](), { insertThrows: true });
  const result = await dispatchOne(SUB, PAYLOAD, h.deps);

  // Loop não foi interrompido pela falha de insert → chegou até a 3ª e ganhou
  assertEquals(h.fetches, 3);
  assertEquals(h.sleeps.length, 2);
  assertEquals(h.deliveries.length, 0);
  assertEquals(result.succeeded, true);
  assertEquals(result.status, 200);
  assertEquals(result.error, null);
});

Deno.test("insertDelivery falha + falha terminal: dead-letter ainda é chamado", async () => {
  const h = makeHarness(() => new Response("err", { status: 500 }), {
    insertThrows: true,
    withDeadLetter: true,
  });
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.deadLetters.length, 1);
  assertEquals(h.deadLetters[0].attempts, 3);
  assertEquals(h.deadLetters[0].last_status, 500);
});

Deno.test("insertDelivery falha em todas + erro de rede: dispatchOne resolve sem lançar", async () => {
  const h = makeHarness(() => { throw new Error("ENETDOWN"); }, { insertThrows: true });
  // Não deve lançar — try/catch interno absorve o erro de log
  const result = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.fetches, MAX_ATTEMPTS);
  assertEquals(h.sleeps.length, MAX_ATTEMPTS - 1);
  assertEquals(result.succeeded, false);
  assertEquals(result.status, 0);
  assert(result.error !== null);
  assert(result.error!.includes("ENETDOWN"));
});

