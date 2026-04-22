import { assertEquals, assert, assertGreaterOrEqual, assertLessOrEqual, assertObjectMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
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

Deno.test("dispatchOne: onDeadLetter recebe entry com todos os campos preenchidos corretamente", async () => {
  const h = makeHarness(() => new Response("boom", { status: 502 }), { withDeadLetter: true });
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.deadLetters.length, 1);
  const e = h.deadLetters[0];
  assertEquals(e.subscription_id, SUB.id);
  assertEquals(e.event, "x");
  assertEquals(e.payload, PAYLOAD);
  assertEquals(e.attempts, MAX_ATTEMPTS);
  assertEquals(e.last_status, 502);
  // last_error é null para falhas HTTP puras (não há throw); só o status fala
  assertEquals(e.last_error, null);
  // total_latency_ms presente e numérico (com now() mockado para 0 → 0)
  assertEquals(typeof e.total_latency_ms, "number");
});

Deno.test("dispatchOne: onDeadLetter chamado EXATAMENTE 1× ao final (não por tentativa)", async () => {
  let callCount = 0;
  const h = makeHarness(() => new Response("err", { status: 500 }));
  h.deps.onDeadLetter = (entry) => {
    callCount += 1;
    h.deadLetters.push(entry);
    return Promise.resolve();
  };
  await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(callCount, 1, "onDeadLetter deve ser chamado uma única vez após esgotar todos os retries");
  assertEquals(h.deadLetters.length, 1);
});

Deno.test("dispatchOne: erro em onDeadLetter NÃO impede updateSubscription de ter rodado antes", async () => {
  // updateSubscription roda ANTES do onDeadLetter no fluxo. Mesmo que o DLQ exploda, o
  // estado da subscription deve refletir o último status.
  const h = makeHarness(() => new Response("err", { status: 504 }), {
    withDeadLetter: true,
    deadLetterThrows: true,
  });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, false);
  assertEquals(r.status, 504);
  // updateSubscription DEVE ter sido chamado mesmo com o DLQ falhando depois
  assertEquals(h.updates.length, 1);
  assertEquals(h.updates[0], { id: "sub-1", status: 504 });
  // E nada vazou do erro do DLQ para o resultado
  assertEquals(h.deadLetters.length, 0);
});

Deno.test("dispatchOne: erro síncrono (throw) em onDeadLetter também é absorvido", async () => {
  const h = makeHarness(() => new Response("err", { status: 500 }));
  h.deps.onDeadLetter = () => {
    throw new Error("dlq sync explosion");
  };
  // Não deve lançar mesmo com throw síncrono dentro do callback
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(r.succeeded, false);
  assertEquals(r.attempts, MAX_ATTEMPTS);
});

Deno.test("dispatchOne: onDeadLetter NÃO chamado quando deps.onDeadLetter é undefined", async () => {
  // Sem withDeadLetter:true → deps.onDeadLetter === undefined.
  // dispatchOne deve apenas pular o passo de DLQ silenciosamente.
  const h = makeHarness(() => new Response("err", { status: 500 }));
  assertEquals(h.deps.onDeadLetter, undefined);
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(r.succeeded, false);
  assertEquals(r.attempts, MAX_ATTEMPTS);
  assertEquals(h.deadLetters.length, 0);
});

Deno.test("dispatchOne: sem onDeadLetter, NÃO há inserção/log de DLQ e execução não lança", async () => {
  // Captura todos os logs estruturados emitidos pelo dispatcher e verifica que
  // nenhum evento relacionado à DLQ foi registrado quando deps.onDeadLetter é undefined.
  const logs: Array<{ level: string; data: Record<string, unknown> }> = [];
  const deliveries: DeliveryRow[] = [];
  const updates: Array<{ id: string; status: number }> = [];

  const deps: DispatchDeps = {
    fetchFn: (() => Promise.resolve(new Response("err", { status: 500 }))) as typeof fetch,
    sleep: () => Promise.resolve(),
    insertDelivery: (row) => { deliveries.push(row); return Promise.resolve(); },
    updateSubscription: (id, status) => { updates.push({ id, status }); return Promise.resolve(); },
    // onDeadLetter intencionalmente OMITIDO (undefined)
    rand: () => 0,
    now: () => 0,
    log: (level, data) => { logs.push({ level, data }); },
  };

  // Sanity: confirma contrato — onDeadLetter ausente.
  assertEquals(deps.onDeadLetter, undefined);

  // Não deve lançar mesmo com todas as tentativas falhando.
  let threw: unknown = null;
  let result: Awaited<ReturnType<typeof dispatchOne>> | null = null;
  try {
    result = await dispatchOne(SUB, PAYLOAD, deps);
  } catch (e) {
    threw = e;
  }
  assertEquals(threw, null, "dispatchOne não pode lançar quando onDeadLetter está ausente");
  assert(result !== null);
  assertEquals(result!.succeeded, false);
  assertEquals(result!.attempts, MAX_ATTEMPTS);

  // Side-effects normais permanecem: deliveries por tentativa + update final de status.
  assertEquals(deliveries.length, MAX_ATTEMPTS, "deliveries devem continuar sendo registradas");
  assert(updates.length >= 1, "updateSubscription ainda deve ocorrer");

  // Nenhum log estruturado deve mencionar dead letter / DLQ.
  const dlqLogs = logs.filter((l) => {
    const text = JSON.stringify(l.data).toLowerCase();
    return text.includes("dead_letter") || text.includes("deadletter") || text.includes("dlq");
  });
  assertEquals(
    dlqLogs.length,
    0,
    `nenhum log de DLQ deve ser emitido quando onDeadLetter é undefined; encontrados: ${JSON.stringify(dlqLogs)}`,
  );
});

Deno.test("dispatchOne: onDeadLetter recebe payload original deep-equal e SEM mutações entre tentativas", async () => {
  // Payload aninhado e variado para detectar mutações em qualquer nível.
  const ORIGINAL = {
    event: "x",
    deal_id: "d-deep-1",
    nested: { a: 1, b: [1, 2, { c: "leaf" }], d: null as null | string },
    list: ["one", "two", "three"],
    flag: true,
    count: 0,
  };
  const SNAPSHOT_JSON = JSON.stringify(ORIGINAL);

  // Captura o body de cada POST para garantir paridade entre tentativas.
  const sentBodies: string[] = [];
  const h = makeHarness(() => new Response("err", { status: 500 }), { withDeadLetter: true });
  const origFetch = h.deps.fetchFn;
  h.deps.fetchFn = ((input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    sentBodies.push(String((init as { body?: unknown })?.body ?? ""));
    return origFetch(input, init);
  }) as typeof fetch;

  const r = await dispatchOne(SUB, ORIGINAL, h.deps);
  assertEquals(r.succeeded, false);
  assertEquals(r.attempts, MAX_ATTEMPTS);

  // 1) O objeto original NÃO foi mutado por dispatchOne durante o fluxo.
  assertEquals(JSON.stringify(ORIGINAL), SNAPSHOT_JSON, "payload original sofreu mutação durante dispatch");

  // 2) Os 3 bodies enviados são byte-a-byte idênticos entre tentativas
  //    (nenhum campo foi injetado/removido/reordenado entre attempts).
  assertEquals(sentBodies.length, MAX_ATTEMPTS);
  assertEquals(sentBodies[0], sentBodies[1], "body da tentativa 2 difere da 1");
  assertEquals(sentBodies[1], sentBodies[2], "body da tentativa 3 difere da 2");

  // 3) DLQ recebe deep-equality com o original — mesma estrutura e valores.
  assertEquals(h.deadLetters.length, 1);
  const dlqPayload = h.deadLetters[0].payload;
  assertEquals(dlqPayload, ORIGINAL, "DLQ payload deve ser deep-equal ao original");
  assertEquals(JSON.stringify(dlqPayload), SNAPSHOT_JSON, "DLQ payload diverge do snapshot serializado");

  // 4) Estruturas aninhadas preservadas em todos os níveis.
  const dp = dlqPayload as typeof ORIGINAL;
  assertEquals(dp.nested.a, 1);
  assertEquals(dp.nested.b, [1, 2, { c: "leaf" }]);
  assertEquals(dp.nested.d, null);
  assertEquals(dp.list, ["one", "two", "three"]);
  assertEquals(dp.flag, true);
  assertEquals(dp.count, 0);

  // 5) O body enviado ao webhook contém o payload original íntegro como subconjunto.
  //    O dispatcher pode adicionar campos de envelope (ex.: dispatched_at) — isso é OK,
  //    mas nenhum campo do payload original pode estar ausente ou alterado.
  const decoded = JSON.parse(sentBodies[0]) as Record<string, unknown>;
  for (const [key, expected] of Object.entries(ORIGINAL)) {
    assertEquals(decoded[key], expected, `body diverge no campo "${key}"`);
  }
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
  opts: { withDeadLetter?: boolean; rand?: () => number } = {},
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
    rand: opts.rand ?? (() => 0),
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

Deno.test("fan-out: 1 sub falha em todas as 3 tentativas; demais seguem com POST e last_status correto", async () => {
  const h = makeFanoutHarness({
    [SUB_A.url]: () => new Response("ok", { status: 200 }),
    [SUB_B.url]: () => new Response("boom", { status: 500 }),
    [SUB_C.url]: () => new Response("ok", { status: 202 }),
  }, { withDeadLetter: true });

  // Ordem invertida na chamada para reforçar independência da ordem
  const subs = [SUB_C, SUB_B, SUB_A];
  const results = await Promise.all(subs.map((s) => dispatchOne(s, PAYLOAD, h.deps)));

  // Fetch por URL: A=1, C=1; B esgotou MAX_ATTEMPTS
  assertEquals(h.fetchesByUrl[SUB_A.url], 1);
  assertEquals(h.fetchesByUrl[SUB_B.url], MAX_ATTEMPTS);
  assertEquals(h.fetchesByUrl[SUB_C.url], 1);

  // last_status por sub: 1 update cada, valor final correto
  const aUpdates = h.updates.filter((u) => u.id === "sub-A");
  const bUpdates = h.updates.filter((u) => u.id === "sub-B");
  const cUpdates = h.updates.filter((u) => u.id === "sub-C");
  assertEquals(aUpdates.length, 1);
  assertEquals(bUpdates.length, 1);
  assertEquals(cUpdates.length, 1);
  assertEquals(aUpdates[0].status, 200);
  assertEquals(bUpdates[0].status, 500);
  assertEquals(cUpdates[0].status, 202);

  // Deliveries persistidos por sub
  const dA = h.deliveries.filter((d) => d.subscription_id === "sub-A");
  const dB = h.deliveries.filter((d) => d.subscription_id === "sub-B");
  const dC = h.deliveries.filter((d) => d.subscription_id === "sub-C");
  assertEquals(dA.length, 1);
  assertEquals(dC.length, 1);
  assertEquals(dB.length, MAX_ATTEMPTS);
  const bAttempts = dB.map((d) => d.attempt).sort();
  assertEquals(bAttempts, Array.from({ length: MAX_ATTEMPTS }, (_, i) => i + 1));
  for (const d of dB) assertEquals(d.succeeded, false);
  assertEquals(dA[0].succeeded, true);
  assertEquals(dC[0].succeeded, true);

  // DLQ: apenas B
  assertEquals(h.deadLetters.length, 1);
  assertEquals(h.deadLetters[0].subscription_id, "sub-B");
  assertEquals(h.deadLetters[0].attempts, MAX_ATTEMPTS);
  assertEquals(h.deadLetters[0].last_status, 500);
  assert(typeof h.deadLetters[0].total_latency_ms === "number");

  // Resultados finais por id
  const resById = Object.fromEntries(results.map((r) => [r.id, r]));
  assertEquals(resById["sub-A"].succeeded, true);
  assertEquals(resById["sub-A"].status, 200);
  assertEquals(resById["sub-B"].succeeded, false);
  assertEquals(resById["sub-B"].status, 500);
  assertEquals(resById["sub-B"].attempts, MAX_ATTEMPTS);
  assertEquals(resById["sub-C"].succeeded, true);
  assertEquals(resById["sub-C"].status, 202);
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

// ───────────── fan-out: asserções modulares (fetch / headers / body) ─────────────
// Cada bloco abaixo isola UMA dimensão da validação para falhar com mensagem precisa.
// O teste consolidado (POR SUBSCRIPTION, abaixo) cobre todas as dimensões em conjunto.

const FANOUT_PAYLOAD = { event: "x", deal_id: "deal-fan-123", extra: { foo: "bar" } };
const FANOUT_SUBS = [SUB_A, SUB_B, SUB_C];

function makeAllOkFanout() {
  return makeFanoutHarness({
    [SUB_A.url]: () => new Response("ok", { status: 200 }),
    [SUB_B.url]: () => new Response("ok", { status: 200 }),
    [SUB_C.url]: () => new Response("ok", { status: 200 }),
  });
}

Deno.test("fan-out [fetch]: 1 POST por subscription, sem cross-fire entre URLs", async () => {
  const h = makeAllOkFanout();
  await Promise.all(FANOUT_SUBS.map((s) => dispatchOne(s, FANOUT_PAYLOAD, h.deps)));

  assertEquals(h.fetchesByUrl[SUB_A.url], 1, "SUB_A deve ter 1 POST");
  assertEquals(h.fetchesByUrl[SUB_B.url], 1, "SUB_B deve ter 1 POST");
  assertEquals(h.fetchesByUrl[SUB_C.url], 1, "SUB_C deve ter 1 POST");
  assertEquals(Object.keys(h.fetchesByUrl).length, FANOUT_SUBS.length, "nenhuma URL extra deve aparecer");
  assertEquals(h.capturedInits.length, FANOUT_SUBS.length);

  const seenUrls = new Set(h.capturedInits.map((c) => c.url));
  assertEquals(seenUrls, new Set(FANOUT_SUBS.map((s) => s.url)), "cobertura de URLs divergente");
});

Deno.test("fan-out [headers]: method=POST + Content-Type=application/json + X-Winloss-Event por requisição", async () => {
  const h = makeAllOkFanout();
  await Promise.all(FANOUT_SUBS.map((s) => dispatchOne(s, FANOUT_PAYLOAD, h.deps)));

  assertEquals(h.capturedInits.length, FANOUT_SUBS.length);
  for (const { url, init } of h.capturedInits) {
    assertEquals(init.method, "POST", `${url}: method`);
    const headers = init.headers as Record<string, string>;
    assertEquals(headers["Content-Type"], "application/json", `${url}: Content-Type`);
    assertEquals(headers["X-Winloss-Event"], FANOUT_PAYLOAD.event, `${url}: X-Winloss-Event`);
  }
});

Deno.test("fan-out [body]: JSON.parse(body) contém event + deal_id esperados em cada subscription", async () => {
  const h = makeAllOkFanout();
  await Promise.all(FANOUT_SUBS.map((s) => dispatchOne(s, FANOUT_PAYLOAD, h.deps)));

  assertEquals(h.capturedInits.length, FANOUT_SUBS.length);
  for (const { url, init } of h.capturedInits) {
    assert(typeof init.body === "string", `${url}: body deve ser string serializada`);
    const parsed = JSON.parse(init.body as string) as Record<string, unknown>;
    assert(
      parsed !== null && typeof parsed === "object" && !Array.isArray(parsed),
      `${url}: body deve ser objeto JSON`,
    );
    assertEquals(parsed.event, FANOUT_PAYLOAD.event, `${url}: body.event`);
    assertEquals(parsed.deal_id, FANOUT_PAYLOAD.deal_id, `${url}: body.deal_id`);
  }
});

Deno.test("fan-out: asserções consolidadas POR SUBSCRIPTION — fetchCount(URL) + X-Winloss-Event + JSON.parse(body).deal_id, sem substring", async () => {
  // Mistura de cenários: SUB_A 1 sucesso (1 POST), SUB_B falha persistente (MAX_ATTEMPTS POSTs),
  // SUB_C sucede na 2ª tentativa (2 POSTs). Garante que o teste funciona mesmo com retries.
  const h = makeFanoutHarness({
    [SUB_A.url]: () => new Response("ok", { status: 200 }),
    [SUB_B.url]: () => new Response("err", { status: 500 }),
    [SUB_C.url]: (attempt) => attempt === 1
      ? new Response("err", { status: 503 })
      : new Response("ok", { status: 200 }),
  });

  const payload = { event: "winloss.deal.lost", deal_id: "deal-consolidado-7", reason: "price" };
  const subs = [SUB_A, SUB_B, SUB_C];
  await Promise.all(subs.map((s) => dispatchOne(s, payload, h.deps)));

  // Tabela de expectativas POR subscription (URL canônica como chave de identidade).
  const expectedByUrl: Record<string, { subId: string; fetchCount: number }> = {
    [SUB_A.url]: { subId: SUB_A.id, fetchCount: 1 },
    [SUB_B.url]: { subId: SUB_B.id, fetchCount: MAX_ATTEMPTS },
    [SUB_C.url]: { subId: SUB_C.id, fetchCount: 2 },
  };

  // 1) Conjunto de URLs efetivamente chamadas == conjunto esperado (sem URLs estranhas, sem faltas).
  assertEquals(
    new Set(Object.keys(h.fetchesByUrl)),
    new Set(Object.keys(expectedByUrl)),
    "URLs alvo divergem do esperado",
  );

  // 2) Para cada subscription: contagem de fetch por URL bate exatamente.
  for (const [url, exp] of Object.entries(expectedByUrl)) {
    assertEquals(
      h.fetchesByUrl[url],
      exp.fetchCount,
      `${exp.subId}: esperava ${exp.fetchCount} POST(s) em ${url}, recebeu ${h.fetchesByUrl[url]}`,
    );
  }

  // Total de inits capturados == soma das contagens esperadas (não houve POSTs órfãos).
  const expectedTotal = Object.values(expectedByUrl).reduce((acc, e) => acc + e.fetchCount, 0);
  assertEquals(h.capturedInits.length, expectedTotal);

  // 3+4) Para CADA init capturado, validar header X-Winloss-Event e body via JSON.parse.
  // Agrupa por URL para também conferir consistência entre tentativas de uma mesma sub.
  const initsByUrl: Record<string, RequestInit[]> = {};
  for (const { url, init } of h.capturedInits) {
    initsByUrl[url] = initsByUrl[url] ?? [];
    initsByUrl[url].push(init);
  }

  for (const [url, exp] of Object.entries(expectedByUrl)) {
    const inits = initsByUrl[url] ?? [];
    assertEquals(inits.length, exp.fetchCount, `inits agrupados para ${url}`);

    for (let i = 0; i < inits.length; i += 1) {
      const init = inits[i];
      const ctx = `${exp.subId} attempt ${i + 1}`;

      assertEquals(init.method, "POST", `${ctx}: método deve ser POST`);

      const headers = init.headers as Record<string, string>;
      // Header obrigatório, comparado por igualdade exata (NÃO substring).
      assertEquals(
        headers["X-Winloss-Event"],
        payload.event,
        `${ctx}: X-Winloss-Event deve ser exatamente "${payload.event}"`,
      );
      assertEquals(headers["Content-Type"], "application/json", `${ctx}: Content-Type`);

      // Body parseado como JSON real — sem .includes(), sem regex, sem substring.
      const rawBody = init.body;
      assert(typeof rawBody === "string", `${ctx}: body deve ser string serializada`);
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawBody as string) as Record<string, unknown>;
      } catch (e) {
        throw new Error(`${ctx}: body não é JSON válido: ${(e as Error).message}`);
      }
      assert(
        parsed !== null && typeof parsed === "object" && !Array.isArray(parsed),
        `${ctx}: body parseado deve ser objeto`,
      );
      // deal_id presente E com valor exato — comparação estrutural, não textual.
      assertEquals(parsed.deal_id, payload.deal_id, `${ctx}: body.deal_id divergente`);
      // Coerência cruzada: header.event == body.event.
      assertEquals(parsed.event, headers["X-Winloss-Event"], `${ctx}: body.event != header X-Winloss-Event`);
    }
  }
});

Deno.test("fan-out: backoff de uma sub falhando NÃO atrasa updateSubscription das demais (medido por id)", async () => {
  // Harness próprio: cada dispatchOne tem deps EXCLUSIVO via closure.
  // sleeps/fetches/updates são amarrados ao subId, não a estado global racy.
  const fetchesById: Record<string, number> = {};
  const sleepsById: Record<string, number[]> = {};
  const updates: Array<{ id: string; status: number; at: number }> = [];

  const urlToId: Record<string, string> = {
    [SUB_A.url]: "sub-A",
    [SUB_B.url]: "sub-B",
    [SUB_C.url]: "sub-C",
  };
  const responseFor: Record<string, () => Response> = {
    "sub-A": () => new Response("ok", { status: 200 }),
    "sub-B": () => new Response("err", { status: 500 }),
    "sub-C": () => new Response("ok", { status: 200 }),
  };

  const makeDeps = (subId: string): DispatchDeps => {
    let virtualNow = 0; // relógio virtual POR thread → independência real
    return {
      fetchFn: ((input: Parameters<typeof fetch>[0]) => {
        const url = typeof input === "string" ? input : (input as URL | Request).toString();
        const id = urlToId[url];
        fetchesById[id] = (fetchesById[id] ?? 0) + 1;
        return Promise.resolve(responseFor[id]());
      }) as typeof fetch,
      sleep: (ms: number) => {
        sleepsById[subId] = sleepsById[subId] ?? [];
        sleepsById[subId].push(ms);
        virtualNow += ms;
        return Promise.resolve();
      },
      insertDelivery: () => Promise.resolve(),
      updateSubscription: (id, status) => {
        updates.push({ id, status, at: virtualNow });
        return Promise.resolve();
      },
      rand: () => 0, // jitter zero → backoff determinístico [250, 500]
      now: () => virtualNow,
      log: () => {},
    };
  };

  const subs = [SUB_A, SUB_B, SUB_C];
  await Promise.all(subs.map((s) => dispatchOne(s, PAYLOAD, makeDeps(s.id))));

  // Fetches por id
  assertEquals(fetchesById["sub-A"], 1);
  assertEquals(fetchesById["sub-B"], MAX_ATTEMPTS);
  assertEquals(fetchesById["sub-C"], 1);

  // Sleeps por id: A e C zero; B exatamente [250, 500]
  assertEquals(sleepsById["sub-A"] ?? [], []);
  assertEquals(sleepsById["sub-C"] ?? [], []);
  assertEquals(sleepsById["sub-B"], [250, 500]);

  // updateSubscription: 1× por sub, status final correto
  assertEquals(updates.filter((u) => u.id === "sub-A").length, 1);
  assertEquals(updates.filter((u) => u.id === "sub-B").length, 1);
  assertEquals(updates.filter((u) => u.id === "sub-C").length, 1);
  const byId = Object.fromEntries(updates.map((u) => [u.id, u]));
  assertEquals(byId["sub-A"].status, 200);
  assertEquals(byId["sub-B"].status, 500);
  assertEquals(byId["sub-C"].status, 200);

  // Prova temporal: A e C atualizam em virtualNow=0 (não esperaram nada);
  // B atualiza após acumular 750ms (250+500) dos seus próprios backoffs.
  assertEquals(byId["sub-A"].at, 0, "sub-A não deveria ter esperado nada");
  assertEquals(byId["sub-C"].at, 0, "sub-C não deveria ter esperado nada");
  assertEquals(byId["sub-B"].at, 750, "sub-B deveria ter esperado 250+500=750ms");

  // Total de sleeps no fan-out
  const totalSleeps = Object.values(sleepsById).reduce((a, arr) => a + arr.length, 0);
  assertEquals(totalSleeps, MAX_ATTEMPTS - 1);
});

Deno.test("fan-out N=20: contagem por URL, header X-Winloss-Event e deal_id chegam em todas as subs", async () => {
  const N = 20;
  const subs: Subscription[] = Array.from({ length: N }, (_, i) => ({
    id: `sub-${i}`,
    url: `https://sub-${i}.test/hook`,
    events: ["x"],
    secret: null,
  }));
  const routes: Record<string, () => Response> = {};
  for (const s of subs) routes[s.url] = () => new Response("ok", { status: 200 });

  const h = makeFanoutHarness(routes);
  const payload = { event: "x", deal_id: "deal-bulk-999" };
  await Promise.all(subs.map((s) => dispatchOne(s, payload, h.deps)));

  // Contagem por URL: 1 POST por sub, total = N
  assertEquals(Object.keys(h.fetchesByUrl).length, N);
  for (const s of subs) assertEquals(h.fetchesByUrl[s.url], 1);
  const totalFetches = Object.values(h.fetchesByUrl).reduce((a, b) => a + b, 0);
  assertEquals(totalFetches, N);
  assertEquals(h.capturedInits.length, N);

  // Header + body + método + Content-Type por captura (uma vez por sub)
  const postsByUrl: Record<string, number> = {};
  for (const { url, init } of h.capturedInits) {
    postsByUrl[url] = (postsByUrl[url] ?? 0) + 1;
    assertEquals(init.method, "POST", `método deve ser POST em ${url}`);
    const headers = init.headers as Record<string, string>;
    assertEquals(headers["Content-Type"], "application/json", `Content-Type deve ser application/json em ${url}`);
    assertEquals(headers["X-Winloss-Event"], "x", `X-Winloss-Event ausente em ${url}`);
    const parsed = JSON.parse(String(init.body));
    assertEquals(parsed.deal_id, "deal-bulk-999", `deal_id ausente em ${url}`);
  }
  // Cada subscription recebeu exatamente 1 POST
  for (const s of subs) assertEquals(postsByUrl[s.url], 1, `${s.id}: deve ter exatamente 1 POST`);
});

Deno.test("fan-out: cada subscription recebe exatamente 1 POST com method=POST e Content-Type=application/json", async () => {
  // Foco exclusivo: método HTTP + Content-Type, validados UMA vez por subscription.
  // Cenário sem retries (todas 2xx) → garante mapeamento 1:1 entre sub e POST.
  const h = makeFanoutHarness({
    [SUB_A.url]: () => new Response("ok", { status: 200 }),
    [SUB_B.url]: () => new Response("ok", { status: 201 }),
    [SUB_C.url]: () => new Response("ok", { status: 202 }),
  });
  const payload = { event: "x", deal_id: "d-method-ct" };
  const subs = [SUB_A, SUB_B, SUB_C];
  await Promise.all(subs.map((s) => dispatchOne(s, payload, h.deps)));

  // Total: 1 POST por sub
  assertEquals(h.capturedInits.length, subs.length);
  for (const s of subs) {
    assertEquals(h.fetchesByUrl[s.url], 1, `${s.id}: deve ter exatamente 1 POST em ${s.url}`);
  }

  // Agrupa por URL para garantir "uma vez por subscription"
  const initsByUrl: Record<string, RequestInit[]> = {};
  for (const { url, init } of h.capturedInits) {
    initsByUrl[url] = initsByUrl[url] ?? [];
    initsByUrl[url].push(init);
  }

  for (const s of subs) {
    const inits = initsByUrl[s.url] ?? [];
    assertEquals(inits.length, 1, `${s.id}: esperava exatamente 1 init capturado`);

    const init = inits[0];
    // Asserção 1: method === "POST"
    assertEquals(init.method, "POST", `${s.id}: method deve ser exatamente "POST"`);

    // Asserção 2: Content-Type === "application/json"
    const headers = init.headers as Record<string, string>;
    assert(headers, `${s.id}: headers ausentes`);
    assertEquals(
      headers["Content-Type"],
      "application/json",
      `${s.id}: Content-Type deve ser exatamente "application/json"`,
    );
  }
});

Deno.test("fan-out N=20 (escala): total exato de POSTs, X-Winloss-Event em 100% e deal_id por sub via JSON.parse", async () => {
  // Escala: 20 subscriptions independentes recebendo o MESMO evento.
  // Validações fortes:
  //   1) Total de POSTs == N (sem dups, sem POSTs órfãos).
  //   2) Cada uma das N subs recebeu exatamente 1 POST na sua URL.
  //   3) 100% das requisições têm header X-Winloss-Event == event do payload.
  //   4) Cada body é JSON parseável e contém o deal_id esperado (comparação estrutural).
  //   5) Resultados por sub: succeeded=true, status=200, attempts=1.
  const N = 20;
  const EVENT = "winloss.deal.lost";
  const DEAL_ID = "deal-scale-N20-abc";

  const subs: Subscription[] = Array.from({ length: N }, (_, i) => ({
    id: `sub-${i}`,
    url: `https://sub-${i}.scale.test/hook`,
    events: [EVENT],
    secret: i % 3 === 0 ? `sec-${i}` : null, // mistura com/sem secret
  }));
  const routes: Record<string, () => Response> = {};
  for (const s of subs) routes[s.url] = () => new Response("ok", { status: 200 });

  const h = makeFanoutHarness(routes);
  const payload = { event: EVENT, deal_id: DEAL_ID, meta: { source: "scale-test" } };
  const results = await Promise.all(subs.map((s) => dispatchOne(s, payload, h.deps)));

  // (1) Total exato de POSTs
  const totalPosts = Object.values(h.fetchesByUrl).reduce((a, b) => a + b, 0);
  assertEquals(totalPosts, N, `total de POSTs deve ser ${N}, foi ${totalPosts}`);
  assertEquals(h.capturedInits.length, N, "capturedInits deve corresponder ao total de POSTs");

  // (2) Cobertura de URLs: conjunto exato == conjunto das N subs (sem extras, sem faltas).
  const expectedUrls = new Set(subs.map((s) => s.url));
  const seenUrls = new Set(Object.keys(h.fetchesByUrl));
  assertEquals(seenUrls, expectedUrls, "conjunto de URLs chamadas divergente");
  for (const s of subs) {
    assertEquals(h.fetchesByUrl[s.url], 1, `${s.id}: deve ter exatamente 1 POST em ${s.url}`);
  }

  // (3+4) 100% das requisições: header e body.deal_id corretos
  let headerHits = 0;
  let dealIdHits = 0;
  for (const { url, init } of h.capturedInits) {
    assertEquals(init.method, "POST", `${url}: método deve ser POST`);
    const headers = init.headers as Record<string, string>;

    assertEquals(headers["X-Winloss-Event"], EVENT, `${url}: X-Winloss-Event divergente`);
    headerHits += 1;

    assert(typeof init.body === "string", `${url}: body deve ser string serializada`);
    const parsed = JSON.parse(init.body as string) as Record<string, unknown>;
    assert(
      parsed !== null && typeof parsed === "object" && !Array.isArray(parsed),
      `${url}: body parseado deve ser objeto`,
    );
    assertEquals(parsed.deal_id, DEAL_ID, `${url}: body.deal_id divergente`);
    assertEquals(parsed.event, EVENT, `${url}: body.event divergente`);
    dealIdHits += 1;
  }
  assertEquals(headerHits, N, "header X-Winloss-Event deve estar em 100% das requisições");
  assertEquals(dealIdHits, N, "deal_id correto deve estar em 100% dos bodies");

  // (5) Resultados por sub
  assertEquals(results.length, N);
  const resById = Object.fromEntries(results.map((r) => [r.id, r]));
  for (const s of subs) {
    const r = resById[s.id];
    assert(r, `${s.id}: resultado ausente`);
    assertEquals(r.succeeded, true, `${s.id}: succeeded`);
    assertEquals(r.status, 200, `${s.id}: status`);
    assertEquals(r.attempts, 1, `${s.id}: attempts`);
  }

  // Side-effects coerentes com a escala
  assertEquals(h.deliveries.length, N, "deve haver 1 delivery por sub");
  assertEquals(h.updates.length, N, "deve haver 1 updateSubscription por sub");
});

Deno.test("fan-out: body por subscription corresponde EXATAMENTE ao payload daquela sub (sem reuso/cross-talk)", async () => {
  // Cenário: cada subscription recebe um payload DIFERENTE no mesmo fan-out concorrente.
  // O harness captura por URL, então conseguimos provar que o body entregue a cada
  // subscription é exatamente o payload destinado a ela — sem mistura entre chamadas
  // (nenhum closure compartilhado, nenhuma referência mutável reaproveitada).
  const subs = [SUB_A, SUB_B, SUB_C];
  const h = makeFanoutHarness({
    [SUB_A.url]: () => new Response("ok", { status: 200 }),
    [SUB_B.url]: () => new Response("ok", { status: 200 }),
    [SUB_C.url]: () => new Response("ok", { status: 200 }),
  });

  // Payloads distintos por subscription: deal_id, event e nested meta diferentes.
  const payloadByUrl: Record<string, Record<string, unknown>> = {
    [SUB_A.url]: { event: "winloss.deal.won", deal_id: "deal-A-001", meta: { region: "BR", tier: 1 } },
    [SUB_B.url]: { event: "winloss.deal.lost", deal_id: "deal-B-002", meta: { region: "US", tier: 2, reason: "price" } },
    [SUB_C.url]: { event: "winloss.deal.stalled", deal_id: "deal-C-003", meta: { region: "EU", tier: 3, tags: ["a", "b"] } },
  };
  // Snapshot serializado ANTES do dispatch — usado para detectar mutação no payload original.
  const snapshotByUrl: Record<string, string> = Object.fromEntries(
    Object.entries(payloadByUrl).map(([url, p]) => [url, JSON.stringify(p)]),
  );

  // Disparo concorrente: cada sub recebe SEU próprio payload.
  await Promise.all(subs.map((s) => dispatchOne(s, payloadByUrl[s.url], h.deps)));

  // Sanity: 1 POST por sub.
  assertEquals(h.capturedInits.length, subs.length);
  for (const s of subs) {
    assertEquals(h.fetchesByUrl[s.url], 1, `${s.id}: deve ter exatamente 1 POST em ${s.url}`);
  }

  // Para cada captura, o body parseado deve bater EXATAMENTE com o payload daquela sub.
  // Conferimos:
  //   (a) deal_id e event corretos por subscription (sem cross-talk de campos).
  //   (b) meta (objeto aninhado) deep-equal ao do payload daquela sub.
  //   (c) campo desconhecido de OUTRA sub não pode aparecer aqui.
  //   (d) o payload original (snapshot) não foi mutado durante o dispatch.
  const seenDealIds = new Set<string>();
  for (const { url, init } of h.capturedInits) {
    const expected = payloadByUrl[url];
    assert(expected, `payload esperado ausente para ${url}`);
    const parsed = JSON.parse(String(init.body)) as Record<string, unknown>;

    // (a) campos primários exatos
    assertEquals(parsed.event, expected.event, `${url}: event divergente`);
    assertEquals(parsed.deal_id, expected.deal_id, `${url}: deal_id divergente`);

    // (b) meta deep-equal
    assertEquals(parsed.meta, expected.meta, `${url}: meta divergente (cross-talk?)`);

    // (c) nenhum deal_id de OUTRA sub vazou
    for (const [otherUrl, otherPayload] of Object.entries(payloadByUrl)) {
      if (otherUrl === url) continue;
      assert(
        parsed.deal_id !== otherPayload.deal_id,
        `${url}: vazou deal_id de ${otherUrl} (${String(otherPayload.deal_id)})`,
      );
      assert(
        parsed.event !== otherPayload.event,
        `${url}: vazou event de ${otherUrl} (${String(otherPayload.event)})`,
      );
    }

    seenDealIds.add(String(parsed.deal_id));
  }

  // Cobertura: cada deal_id distinto chegou exatamente 1 vez (sem duplicação cruzada).
  assertEquals(seenDealIds.size, subs.length, "cada deal_id distinto deve ter sido visto exatamente 1 vez");
  for (const url of Object.keys(payloadByUrl)) {
    assert(seenDealIds.has(String(payloadByUrl[url].deal_id)), `deal_id de ${url} ausente nas capturas`);
  }

  // (d) Imutabilidade dos payloads originais: snapshots batem após o dispatch.
  for (const [url, snap] of Object.entries(snapshotByUrl)) {
    assertEquals(JSON.stringify(payloadByUrl[url]), snap, `${url}: payload original sofreu mutação`);
  }
});

Deno.test("fan-out [last_status + DLQ]: cada sub grava last_status; DLQ só para a sub que esgotou tentativas", async () => {
  // Cenário misto cobrindo todas as combinações relevantes:
  //   SUB_A → 200 na 1ª tentativa     → last_status=200, sem DLQ
  //   SUB_B → 500 em todas as 3       → last_status=500, COM DLQ (esgotou MAX_ATTEMPTS)
  //   SUB_C → 503 → 502 → 200         → last_status=200 (final), sem DLQ (recuperou no retry)
  const h = makeFanoutHarness(
    {
      [SUB_A.url]: () => new Response("ok", { status: 200 }),
      [SUB_B.url]: () => new Response("err", { status: 500 }),
      [SUB_C.url]: (attempt) => {
        if (attempt === 1) return new Response("e1", { status: 503 });
        if (attempt === 2) return new Response("e2", { status: 502 });
        return new Response("ok", { status: 200 });
      },
    },
    { withDeadLetter: true },
  );

  const subs = [SUB_A, SUB_B, SUB_C];
  const results = await Promise.all(subs.map((s) => dispatchOne(s, PAYLOAD, h.deps)));

  // (1) last_status — exatamente 1 update por sub, com o status final correto
  const lastStatusById: Record<string, number[]> = {};
  for (const u of h.updates) {
    lastStatusById[u.id] = lastStatusById[u.id] ?? [];
    lastStatusById[u.id].push(u.status);
  }
  assertEquals(lastStatusById[SUB_A.id]?.length, 1, "SUB_A deve ter 1 updateSubscription");
  assertEquals(lastStatusById[SUB_B.id]?.length, 1, "SUB_B deve ter 1 updateSubscription");
  assertEquals(lastStatusById[SUB_C.id]?.length, 1, "SUB_C deve ter 1 updateSubscription");
  assertEquals(lastStatusById[SUB_A.id][0], 200, "SUB_A last_status");
  assertEquals(lastStatusById[SUB_B.id][0], 500, "SUB_B last_status (último erro)");
  assertEquals(lastStatusById[SUB_C.id][0], 200, "SUB_C last_status (recuperou no retry)");

  // (2) DLQ — APENAS para SUB_B; nem SUB_A nem SUB_C podem aparecer
  assertEquals(h.deadLetters.length, 1, "DLQ deve ter exatamente 1 entrada");
  const dlqIds = h.deadLetters.map((d) => d.subscription_id);
  assertEquals(dlqIds, [SUB_B.id], "apenas SUB_B deve estar no DLQ");
  assert(!dlqIds.includes(SUB_A.id), "SUB_A não pode estar no DLQ (sucedeu na 1ª)");
  assert(!dlqIds.includes(SUB_C.id), "SUB_C não pode estar no DLQ (recuperou no retry)");

  // (3) DLQ entry de SUB_B coerente com o esgotamento de tentativas
  const dlq = h.deadLetters[0];
  assertEquals(dlq.attempts, MAX_ATTEMPTS, "DLQ.attempts deve ser MAX_ATTEMPTS");
  assertEquals(dlq.last_status, 500, "DLQ.last_status deve refletir o último erro");

  // (4) Resultados por sub coerentes com o estado persistido
  const resById = Object.fromEntries(results.map((r) => [r.id, r]));
  assertEquals(resById[SUB_A.id].succeeded, true);
  assertEquals(resById[SUB_A.id].status, 200);
  assertEquals(resById[SUB_A.id].attempts, 1);
  assertEquals(resById[SUB_B.id].succeeded, false);
  assertEquals(resById[SUB_B.id].status, 500);
  assertEquals(resById[SUB_B.id].attempts, MAX_ATTEMPTS);
  assertEquals(resById[SUB_C.id].succeeded, true);
  assertEquals(resById[SUB_C.id].status, 200);
  assertEquals(resById[SUB_C.id].attempts, 3);
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

// ───────── updateSubscription: chamada única com último status ─────────

Deno.test("updateSubscription: 1× com 200 em recovery 500 → 500 → 200", async () => {
  const responses = [500, 500, 200];
  const h = makeHarness((n) => new Response("", { status: responses[n - 1] }));
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.updates.length, 1);
  assertEquals(h.updates[0], { id: "sub-1", status: 200 });
});

Deno.test("updateSubscription: 1× com 200 em recovery na 2ª (502 → 200) — loop encerra cedo", async () => {
  const responses = [502, 200];
  const h = makeHarness((n) => new Response("", { status: responses[n - 1] }));
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.fetches, 2);
  assertEquals(h.updates.length, 1);
  assertEquals(h.updates[0], { id: "sub-1", status: 200 });
});

Deno.test("updateSubscription: 1× com 503 em falha persistente que muda de status (500 → 502 → 503)", async () => {
  const responses = [500, 502, 503];
  const h = makeHarness((n) => new Response("", { status: responses[n - 1] }));
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.updates.length, 1);
  assertEquals(h.updates[0], { id: "sub-1", status: 503 });
});

Deno.test("updateSubscription: 1× com status=0 quando última tentativa é erro de rede", async () => {
  const h = makeHarness((n) => {
    if (n < 3) return new Response("", { status: 500 });
    throw new Error("ENETDOWN");
  });
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.updates.length, 1);
  assertEquals(h.updates[0], { id: "sub-1", status: 0 });
});

Deno.test("updateSubscription: 1× com 200 quando última é HTTP após erros de rede", async () => {
  const h = makeHarness((n) => {
    if (n < 3) throw new Error("ENETDOWN");
    return new Response("", { status: 200 });
  });
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.updates.length, 1);
  assertEquals(h.updates[0], { id: "sub-1", status: 200 });
});

// ───────────── ordem das chamadas: updateSubscription antes de onDeadLetter ─────────────

Deno.test("ordem: updateSubscription é chamado ANTES de onDeadLetter quando todas as tentativas falham", async () => {
  // Instrumenta um log compartilhado para registrar a ordem real de invocação dos
  // side-effects do dispatcher (insertDelivery, updateSubscription, onDeadLetter).
  const events: string[] = [];

  const deps: DispatchDeps = {
    fetchFn: (() => Promise.resolve(new Response("err", { status: 500 }))) as typeof fetch,
    sleep: () => Promise.resolve(),
    insertDelivery: (_row) => { events.push("insertDelivery"); return Promise.resolve(); },
    updateSubscription: (_id, _status) => { events.push("updateSubscription"); return Promise.resolve(); },
    onDeadLetter: (_entry) => { events.push("onDeadLetter"); return Promise.resolve(); },
    rand: () => 0,
    now: () => 0,
    log: () => {},
  };

  const r = await dispatchOne(SUB, PAYLOAD, deps);

  // Sanity: realmente houve falha total e o DLQ foi acionado.
  assertEquals(r.succeeded, false);
  assertEquals(r.attempts, MAX_ATTEMPTS);

  const updateIdx = events.indexOf("updateSubscription");
  const dlqIdx = events.indexOf("onDeadLetter");
  assert(updateIdx !== -1, "updateSubscription deve ter sido chamado");
  assert(dlqIdx !== -1, "onDeadLetter deve ter sido chamado");
  assertEquals(events.filter((e) => e === "updateSubscription").length, 1);
  assertEquals(events.filter((e) => e === "onDeadLetter").length, 1);

  // ⇒ Asserção principal: updateSubscription PRECEDE onDeadLetter.
  assert(
    updateIdx < dlqIdx,
    `updateSubscription (idx=${updateIdx}) deve preceder onDeadLetter (idx=${dlqIdx}); ordem real: [${events.join(", ")}]`,
  );

  // onDeadLetter é o ÚLTIMO side-effect do fluxo.
  assertEquals(
    events[events.length - 1],
    "onDeadLetter",
    `onDeadLetter deve ser o último side-effect; ordem real: [${events.join(", ")}]`,
  );

  // E todas as 3 insertDelivery acontecem ANTES de updateSubscription/onDeadLetter.
  const lastDeliveryIdx = events.lastIndexOf("insertDelivery");
  assert(
    lastDeliveryIdx < updateIdx,
    `todas as insertDelivery devem preceder updateSubscription; ordem real: [${events.join(", ")}]`,
  );
});

Deno.test("ordem: updateSubscription PRECEDE onDeadLetter mesmo quando onDeadLetter throws", async () => {
  // Mesmo no caminho de exceção do DLQ, o estado da subscription já deve estar persistido.
  const events: string[] = [];

  const deps: DispatchDeps = {
    fetchFn: (() => Promise.resolve(new Response("boom", { status: 504 }))) as typeof fetch,
    sleep: () => Promise.resolve(),
    insertDelivery: () => { events.push("insertDelivery"); return Promise.resolve(); },
    updateSubscription: () => { events.push("updateSubscription"); return Promise.resolve(); },
    onDeadLetter: () => {
      events.push("onDeadLetter");
      return Promise.reject(new Error("dlq exploded"));
    },
    rand: () => 0,
    now: () => 0,
    log: () => {},
  };

  const r = await dispatchOne(SUB, PAYLOAD, deps);
  assertEquals(r.succeeded, false);

  const updateIdx = events.indexOf("updateSubscription");
  const dlqIdx = events.indexOf("onDeadLetter");
  assert(updateIdx !== -1 && dlqIdx !== -1);
  assert(
    updateIdx < dlqIdx,
    `updateSubscription deve preceder onDeadLetter mesmo quando o DLQ falha; ordem real: [${events.join(", ")}]`,
  );
});

// ───────── attempts == MAX_ATTEMPTS + last_status/last_error refletem a ÚLTIMA tentativa ─────────

Deno.test("DLQ: attempts é EXATAMENTE MAX_ATTEMPTS; last_status/last_error vêm da ÚLTIMA tentativa (HTTP puro 500→502→503)", async () => {
  const seq = [500, 502, 503];
  let i = 0;
  const h = makeHarness(() => new Response("err", { status: seq[i++] }), { withDeadLetter: true });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, false);
  assertEquals(h.fetches, MAX_ATTEMPTS, "deve haver exatamente MAX_ATTEMPTS fetches");
  assertEquals(h.deadLetters.length, 1);
  const e = h.deadLetters[0];

  // attempts EXATAMENTE igual a MAX_ATTEMPTS — nem MAX_ATTEMPTS-1, nem MAX_ATTEMPTS+1.
  assertEquals(e.attempts, MAX_ATTEMPTS);
  // last_status === último status da sequência (503), não os anteriores (500/502).
  assertEquals(e.last_status, seq[seq.length - 1]);
  assertEquals(e.last_status, 503);
  // last_error null em falhas HTTP puras (sem throw).
  assertEquals(e.last_error, null);
});

Deno.test("DLQ: rede pura 3× (Error sintético variando) → attempts=MAX_ATTEMPTS, last_status=0, last_error é da ÚLTIMA", async () => {
  const errors = ["ENETDOWN", "ETIMEDOUT", "ECONNRESET"];
  let i = 0;
  const h = makeHarness((): Response => { throw new Error(errors[i++]); }, { withDeadLetter: true });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, false);
  assertEquals(h.fetches, MAX_ATTEMPTS);
  assertEquals(h.deadLetters.length, 1);
  const e = h.deadLetters[0];

  assertEquals(e.attempts, MAX_ATTEMPTS);
  // status=0 convencional para erro de rede (sem resposta HTTP).
  assertEquals(e.last_status, 0);
  // last_error contém a mensagem da ÚLTIMA tentativa, não da 1ª/2ª.
  assert(typeof e.last_error === "string", "last_error deve ser string em erro de rede");
  assert(
    (e.last_error as string).includes(errors[errors.length - 1]),
    `last_error="${e.last_error}" deve conter "${errors[errors.length - 1]}" (última tentativa); não as anteriores`,
  );
  // E NÃO deve mencionar os erros anteriores.
  assert(!(e.last_error as string).includes(errors[0]), "last_error não deve refletir o erro da 1ª tentativa");
  assert(!(e.last_error as string).includes(errors[1]), "last_error não deve refletir o erro da 2ª tentativa");
});

Deno.test("DLQ: misto rede→rede→HTTP 504 → attempts=MAX_ATTEMPTS, last_status=504 (reflete a ÚLTIMA tentativa)", async () => {
  // Contrato observado: last_status SEMPRE espelha o resultado da última tentativa.
  // last_error preserva a última exceção lançada — quando a última é HTTP, ele mantém
  // a mensagem de rede da tentativa anterior (não é "resetado"). Esse comportamento
  // é intencional para não perder o sinal de instabilidade da rede.
  let n = 0;
  const h = makeHarness((): Response => {
    n += 1;
    if (n < 3) throw new Error("ENETDOWN");
    return new Response("gateway", { status: 504 });
  }, { withDeadLetter: true });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, false);
  assertEquals(h.fetches, MAX_ATTEMPTS);
  assertEquals(h.deadLetters.length, 1);
  const e = h.deadLetters[0];

  assertEquals(e.attempts, MAX_ATTEMPTS);
  // last_status DEVE refletir a última tentativa (HTTP 504), e não 0 das anteriores.
  assertEquals(e.last_status, 504);
  // last_error preserva a última exceção observada (rede), comprovando que o sinal
  // não é descartado mesmo quando a tentativa final é HTTP.
  assert(typeof e.last_error === "string");
  assert((e.last_error as string).includes("ENETDOWN"));
});

Deno.test("DLQ: misto HTTP 500→HTTP 502→rede → attempts=MAX_ATTEMPTS, last_status=0, last_error contém o erro da ÚLTIMA", async () => {
  let n = 0;
  const h = makeHarness((): Response => {
    n += 1;
    if (n === 1) return new Response("", { status: 500 });
    if (n === 2) return new Response("", { status: 502 });
    throw new Error("FINAL_NETWORK_BOOM");
  }, { withDeadLetter: true });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, false);
  assertEquals(h.fetches, MAX_ATTEMPTS);
  assertEquals(h.deadLetters.length, 1);
  const e = h.deadLetters[0];

  assertEquals(e.attempts, MAX_ATTEMPTS);
  // Última foi rede → status=0, last_error reflete a ÚLTIMA mensagem.
  assertEquals(e.last_status, 0);
  assert(typeof e.last_error === "string");
  assert(
    (e.last_error as string).includes("FINAL_NETWORK_BOOM"),
    `last_error="${e.last_error}" deve refletir o erro da ÚLTIMA tentativa`,
  );
});

Deno.test("DLQ: AbortError × MAX_ATTEMPTS → attempts=MAX_ATTEMPTS, last_status=0, last_error menciona AbortError da ÚLTIMA", async () => {
  const h = makeHarness((): Response => {
    const err = new Error("The signal has been aborted");
    err.name = "AbortError";
    throw err;
  }, { withDeadLetter: true });
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(r.succeeded, false);
  assertEquals(h.fetches, MAX_ATTEMPTS);
  assertEquals(h.deadLetters.length, 1);
  const e = h.deadLetters[0];

  assertEquals(e.attempts, MAX_ATTEMPTS);
  assertEquals(e.last_status, 0);
  assert(typeof e.last_error === "string");
  assert(
    (e.last_error as string).includes("AbortError"),
    `last_error="${e.last_error}" deve mencionar AbortError`,
  );
});

// ───────────── fan-out: mutação de payload entre envios ─────────────
// Garante que dispatchOne serializa o payload no momento do envio (snapshot)
// e NÃO mantém referência viva ao objeto. Mutar o mesmo objeto entre chamadas
// não pode "vazar" valores novos para bodies já enviados.

Deno.test("fan-out [mutação]: mutar payload entre envios não contamina bodies anteriores (sem reuso por referência)", async () => {
  const h = makeAllOkFanout();

  // Reaproveita propositalmente o MESMO objeto entre envios,
  // mutando seus campos antes de cada dispatchOne.
  const shared: Record<string, unknown> = { event: "x", deal_id: "DEAL-A", seq: 1, meta: { tag: "A" } };

  // 1) Envio para SUB_A com snapshot A
  await dispatchOne(SUB_A, shared, h.deps);
  const snapshotA = { event: "x", deal_id: "DEAL-A", seq: 1, meta: { tag: "A" } };

  // 2) Mutar o mesmo objeto e enviar para SUB_B
  shared.deal_id = "DEAL-B";
  shared.seq = 2;
  (shared.meta as Record<string, unknown>).tag = "B";
  await dispatchOne(SUB_B, shared, h.deps);
  const snapshotB = { event: "x", deal_id: "DEAL-B", seq: 2, meta: { tag: "B" } };

  // 3) Mutar novamente e enviar para SUB_C
  shared.deal_id = "DEAL-C";
  shared.seq = 3;
  shared.meta = { tag: "C" }; // substitui o objeto aninhado
  await dispatchOne(SUB_C, shared, h.deps);
  const snapshotC = { event: "x", deal_id: "DEAL-C", seq: 3, meta: { tag: "C" } };

  // Devem existir exatamente 3 fetches, 1 por subscription.
  assertEquals(h.capturedInits.length, 3, "esperado 1 POST por subscription");
  assertEquals(h.fetchesByUrl[SUB_A.url], 1);
  assertEquals(h.fetchesByUrl[SUB_B.url], 1);
  assertEquals(h.fetchesByUrl[SUB_C.url], 1);

  const byUrl: Record<string, Record<string, unknown>> = {};
  for (const { url, init } of h.capturedInits) {
    assert(typeof init.body === "string", `${url}: body deve ser string serializada (snapshot)`);
    byUrl[url] = JSON.parse(init.body as string) as Record<string, unknown>;
  }

  // Cada body deve refletir o snapshot do momento do envio (campos do payload).
  // Nota: o dispatcher pode anexar metadados como `dispatched_at` — usamos
  // assertObjectMatch para validar inclusão dos campos do snapshot sem exigir
  // igualdade estrita das chaves extras.
  assertObjectMatch(byUrl[SUB_A.url], snapshotA);
  assertObjectMatch(byUrl[SUB_B.url], snapshotB);
  assertObjectMatch(byUrl[SUB_C.url], snapshotC);

  // Cross-talk: nenhum body pode conter o deal_id de outra subscription.
  assertEquals(byUrl[SUB_A.url].deal_id, "DEAL-A");
  assertEquals(byUrl[SUB_B.url].deal_id, "DEAL-B");
  assertEquals(byUrl[SUB_C.url].deal_id, "DEAL-C");
  assert(byUrl[SUB_A.url].deal_id !== byUrl[SUB_B.url].deal_id);
  assert(byUrl[SUB_B.url].deal_id !== byUrl[SUB_C.url].deal_id);
  assert(byUrl[SUB_A.url].deal_id !== byUrl[SUB_C.url].deal_id);

  // O `seq` capturado por sub também deve ser o do momento do envio.
  assertEquals(byUrl[SUB_A.url].seq, 1);
  assertEquals(byUrl[SUB_B.url].seq, 2);
  assertEquals(byUrl[SUB_C.url].seq, 3);

  // E o objeto aninhado `meta` não pode ter sido "alcançado" pela mutação
  // posterior (ex.: SUB_A.meta.tag deve permanecer "A", não "B"/"C").
  assertEquals((byUrl[SUB_A.url].meta as Record<string, unknown>).tag, "A");
  assertEquals((byUrl[SUB_B.url].meta as Record<string, unknown>).tag, "B");
  assertEquals((byUrl[SUB_C.url].meta as Record<string, unknown>).tag, "C");
});

// ───────────── fan-out: limites de sleeps/retries por subscription ─────────────
// Garante que NENHUMA subscription dorme além do máximo previsto pela fórmula
// backoffDelay (base exponencial + jitter ≤ 250ms, cap em 8000ms base) e que a
// quantidade de sleeps == fetches - 1 por sub. Cobre 3 perfis: sucesso na 1ª
// (zero sleeps), falha persistente (MAX_ATTEMPTS-1 sleeps) e recovery na 2ª
// (1 sleep). Usa rand=0.999 para empurrar o jitter ao limite superior.

Deno.test("fan-out [limites]: sleeps por subscription respeitam backoff (sem atrasos excessivos)", async () => {
  const h = makeFanoutHarness(
    {
      // SUB_A: sucesso imediato → 0 sleeps
      [SUB_A.url]: () => new Response("ok", { status: 200 }),
      // SUB_B: falha persistente → MAX_ATTEMPTS fetches, MAX_ATTEMPTS-1 sleeps
      [SUB_B.url]: () => new Response("err", { status: 500 }),
      // SUB_C: 503 na 1ª, 200 na 2ª → 2 fetches, 1 sleep
      [SUB_C.url]: (attempt) => attempt === 1
        ? new Response("e", { status: 503 })
        : new Response("ok", { status: 200 }),
    },
    { withDeadLetter: true, rand: () => 0.999 }, // jitter no limite superior
  );

  // Execução sequencial: o harness atribui sleeps por `currentUrl`, então
  // rodamos uma sub por vez para garantir contabilização determinística por
  // subscription (o paralelismo é coberto por outros testes do fan-out).
  const subs = [SUB_A, SUB_B, SUB_C];
  for (const s of subs) {
    await dispatchOne(s, PAYLOAD, h.deps);
  }

  // ── Invariante por sub: sleeps == fetches - 1 ─────────────────────
  for (const s of subs) {
    const fetches = h.fetchesByUrl[s.url] ?? 0;
    const sleeps = h.sleepsByUrl[s.url] ?? [];
    assertEquals(sleeps.length, Math.max(0, fetches - 1), `${s.id}: sleeps == fetches - 1`);
  }

  // ── SUB_A: zero sleeps (sucesso na 1ª) ────────────────────────────
  assertEquals(h.fetchesByUrl[SUB_A.url], 1);
  assertEquals((h.sleepsByUrl[SUB_A.url] ?? []).length, 0, "SUB_A: nenhum sleep em sucesso");

  // ── SUB_C: exatamente 1 sleep no range [250, 499] ─────────────────
  assertEquals(h.fetchesByUrl[SUB_C.url], 2);
  const sleepsC = h.sleepsByUrl[SUB_C.url];
  assertEquals(sleepsC.length, 1);
  assertEquals(sleepsC[0], backoffDelay(1, () => 0.999));
  assertGreaterOrEqual(sleepsC[0], 250);
  assertLessOrEqual(sleepsC[0], 250 + 249);

  // ── SUB_B: MAX_ATTEMPTS-1 sleeps, cada um dentro do range ─────────
  assertEquals(h.fetchesByUrl[SUB_B.url], MAX_ATTEMPTS);
  const sleepsB = h.sleepsByUrl[SUB_B.url];
  assertEquals(sleepsB.length, MAX_ATTEMPTS - 1);

  // Limites por tentativa: base = min(250 * 2^(attempt-1), 8000); jitter ∈ [0, 249].
  for (let i = 0; i < sleepsB.length; i += 1) {
    const attempt = i + 1; // sleep[i] corresponde à espera APÓS a tentativa i
    const base = Math.min(250 * 2 ** (attempt - 1), 8000);
    assertEquals(sleepsB[i], backoffDelay(attempt, () => 0.999), `SUB_B sleep#${attempt}`);
    assertGreaterOrEqual(sleepsB[i], base, `SUB_B sleep#${attempt} >= base`);
    assertLessOrEqual(sleepsB[i], base + 249, `SUB_B sleep#${attempt} <= base + jitter máx`);
  }

  // ── Cap absoluto: nenhum sleep em qualquer sub pode exceder 8000+249 ──
  const HARD_CAP_MS = 8000 + 249;
  for (const s of subs) {
    for (const ms of h.sleepsByUrl[s.url] ?? []) {
      assertLessOrEqual(ms, HARD_CAP_MS, `${s.id}: sleep ${ms}ms acima do hard cap`);
      assertGreaterOrEqual(ms, 0, `${s.id}: sleep negativo`);
    }
  }

  // ── Soma total por sub: limite superior teórico (sanidade) ────────
  // SUB_A: 0; SUB_C: ≤ 499; SUB_B: soma das bases + jitter máximo por tentativa.
  let sumBmax = 0;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS - 1; attempt += 1) {
    sumBmax += Math.min(250 * 2 ** (attempt - 1), 8000) + 249;
  }
  const sumA = (h.sleepsByUrl[SUB_A.url] ?? []).reduce((a, b) => a + b, 0);
  const sumB = (h.sleepsByUrl[SUB_B.url] ?? []).reduce((a, b) => a + b, 0);
  const sumC = (h.sleepsByUrl[SUB_C.url] ?? []).reduce((a, b) => a + b, 0);
  assertEquals(sumA, 0);
  assertLessOrEqual(sumC, 499);
  assertLessOrEqual(sumB, sumBmax, `SUB_B soma de sleeps ${sumB} > teórico ${sumBmax}`);
});

// ───────────── fan-out [estresse]: N=100 subs ─────────────
// Documenta o comportamento atual do dispatcher: NÃO há limite de concorrência
// configurado (Promise.all direto sobre os targets). Este teste valida:
//   • Total de POSTs == sucessos*1 + falhas*MAX_ATTEMPTS (nada perdido).
//   • Cada subscription recebe POSTs apenas na sua própria URL (sem cross-fire).
//   • Pico de fetches em voo == N (todas disparam simultaneamente) — observabilidade.
// Se um throttling for introduzido no futuro, o pico in-flight cairá e este teste
// destacará a mudança via mensagem informativa (não falha).

Deno.test("fan-out [estresse]: N=100 subs — total de POSTs preservado, sem cross-fire, comportamento de concorrência documentado", async () => {
  const N = 100;
  const FAIL_EVERY = 7; // ~14 subs falhando persistente → MAX_ATTEMPTS POSTs cada
  const subs: Subscription[] = Array.from({ length: N }, (_, i) => ({
    id: `sub-stress-${i.toString().padStart(3, "0")}`,
    url: `https://stress-${i.toString().padStart(3, "0")}.test/hook`,
    events: ["x"],
    secret: i % 3 === 0 ? `secret-${i}` : null,
  }));

  // Instrumentação manual para medir concorrência in-flight.
  let inFlight = 0;
  let peakInFlight = 0;
  const fetchesByUrl: Record<string, number> = {};
  const capturedUrls: string[] = [];
  const deliveries: DeliveryRow[] = [];
  const updates: Array<{ id: string; status: number }> = [];
  const deadLetters: DeadLetterEntry[] = [];

  const failingUrls = new Set(subs.filter((_, i) => i % FAIL_EVERY === 0).map((s) => s.url));

  const deps: DispatchDeps = {
    fetchFn: ((input: Parameters<typeof fetch>[0]) => {
      const url = typeof input === "string" ? input : (input as URL | Request).toString();
      capturedUrls.push(url);
      fetchesByUrl[url] = (fetchesByUrl[url] ?? 0) + 1;
      inFlight += 1;
      if (inFlight > peakInFlight) peakInFlight = inFlight;

      // Resolução assíncrona força o loop de microtasks a observar o pico real.
      return new Promise<Response>((resolve) => {
        queueMicrotask(() => {
          inFlight -= 1;
          resolve(
            failingUrls.has(url)
              ? new Response("err", { status: 500 })
              : new Response("ok", { status: 200 }),
          );
        });
      });
    }) as typeof fetch,
    sleep: () => Promise.resolve(),
    insertDelivery: (row) => { deliveries.push(row); return Promise.resolve(); },
    updateSubscription: (id, status) => { updates.push({ id, status }); return Promise.resolve(); },
    onDeadLetter: (entry) => { deadLetters.push(entry); return Promise.resolve(); },
    rand: () => 0,
    now: () => 0,
    log: () => {},
  };

  const results = await Promise.all(subs.map((s) => dispatchOne(s, PAYLOAD, deps)));

  // ── Cobertura: 1 resultado por sub ─────────────────────────────
  assertEquals(results.length, N);

  // ── Sucessos vs falhas determinísticos ────────────────────────
  const failingSubs = subs.filter((s) => failingUrls.has(s.url));
  const successSubs = subs.filter((s) => !failingUrls.has(s.url));
  assertEquals(failingSubs.length, Math.ceil(N / FAIL_EVERY)); // 15 (índices 0,7,...,98)
  assertEquals(successSubs.length, N - failingSubs.length);

  // ── Total de POSTs: sucessos*1 + falhas*MAX_ATTEMPTS ──────────
  const expectedTotalPosts = successSubs.length * 1 + failingSubs.length * MAX_ATTEMPTS;
  const actualTotalPosts = capturedUrls.length;
  assertEquals(actualTotalPosts, expectedTotalPosts, "total de POSTs divergente");
  assertEquals(deliveries.length, expectedTotalPosts, "deliveries devem espelhar total de POSTs");

  // ── Sem cross-fire: cada URL recebe POSTs apenas dela mesma ───
  for (const s of successSubs) {
    assertEquals(fetchesByUrl[s.url], 1, `${s.id}: sucesso deve ter 1 POST`);
  }
  for (const s of failingSubs) {
    assertEquals(fetchesByUrl[s.url], MAX_ATTEMPTS, `${s.id}: falha deve ter MAX_ATTEMPTS POSTs`);
  }
  // Nenhuma URL além das declaradas.
  const seenUrls = new Set(capturedUrls);
  assertEquals(seenUrls.size, N, "deve haver exatamente N URLs distintas");
  for (const url of seenUrls) {
    assert(subs.some((s) => s.url === url), `URL inesperada nos POSTs: ${url}`);
  }

  // ── updateSubscription: 1× por sub com status final correto ───
  assertEquals(updates.length, N);
  const statusById = Object.fromEntries(updates.map((u) => [u.id, u.status]));
  for (const s of successSubs) assertEquals(statusById[s.id], 200, `${s.id}: status final`);
  for (const s of failingSubs) assertEquals(statusById[s.id], 500, `${s.id}: status final`);

  // ── DLQ: apenas as falhas persistentes vão para a fila ────────
  assertEquals(deadLetters.length, failingSubs.length, "DLQ deve conter apenas falhas persistentes");
  const dlqIds = new Set(deadLetters.map((d) => d.subscription_id));
  for (const s of failingSubs) assert(dlqIds.has(s.id), `${s.id} ausente no DLQ`);
  for (const s of successSubs) assert(!dlqIds.has(s.id), `${s.id} não deveria estar no DLQ`);

  // ── Concorrência (observabilidade do contrato atual) ──────────
  // Sem throttling, o pico in-flight da PRIMEIRA rodada == N (todas disparam juntas).
  // Em rodadas subsequentes (retries), o pico cai porque sucessos já terminaram.
  assertEquals(peakInFlight, N, `pico in-flight esperado=${N} (sem throttling); obtido=${peakInFlight}`);
  // Sanidade: nunca pode ultrapassar N (seria contagem corrompida ou cross-fire).
  assertLessOrEqual(peakInFlight, N, "pico in-flight não pode exceder N");
});

