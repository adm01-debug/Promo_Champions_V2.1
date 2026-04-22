// Determinístico: nenhum Math.random — todos os PRNGs são injetados via deps.rand.
// Foco: VALORES e ORDEM dos sleeps entre as 3 tentativas quando a falha é AbortError.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  backoffDelay,
  type DeliveryRow,
  type DispatchDeps,
  dispatchOne,
  MAX_ATTEMPTS,
  type Subscription,
} from "./retry.ts";

// Constante interna de retry.ts (base do expoente). Documentada aqui para asserts
// derivados da fórmula: backoffDelay(n) = 2^(n-1) * BASE + floor(rand() * BASE)
const BASE = 250;
const MAX_BASE_CAP = 8000;

const SUB: Subscription = { id: "sub-1", url: "https://x.test/hook", events: ["x"], secret: null };
const PAYLOAD = { event: "x", data: { foo: 1 } };

type TimelineEvent =
  | { kind: "fetch"; attempt: number }
  | { kind: "delivery"; attempt: number; succeeded: boolean }
  | { kind: "sleep"; ms: number };

interface Harness {
  deps: DispatchDeps;
  sleeps: number[];
  deliveries: DeliveryRow[];
  timeline: TimelineEvent[];
  fetches: () => number;
}

function makeHarness(
  fetchImpl: (attempt: number) => Response | Promise<Response>,
  rand: () => number,
  opts: { withDeadLetter?: boolean } = {},
): Harness {
  let attempt = 0;
  const sleeps: number[] = [];
  const deliveries: DeliveryRow[] = [];
  const timeline: TimelineEvent[] = [];

  const deps: DispatchDeps = {
    fetchFn: ((_url: string, _init?: RequestInit) => {
      attempt += 1;
      timeline.push({ kind: "fetch", attempt });
      return Promise.resolve(fetchImpl(attempt));
    }) as typeof fetch,
    sleep: (ms: number) => {
      sleeps.push(ms);
      timeline.push({ kind: "sleep", ms });
      return Promise.resolve();
    },
    insertDelivery: (row) => {
      deliveries.push(row);
      timeline.push({ kind: "delivery", attempt: row.attempt, succeeded: row.succeeded });
      return Promise.resolve();
    },
    updateSubscription: () => Promise.resolve(),
    onDeadLetter: opts.withDeadLetter ? () => Promise.resolve() : undefined,
    now: () => 0,
    rand,
  };

  return { deps, sleeps, deliveries, timeline, fetches: () => attempt };
}

function makeAbortError(message = "The signal has been aborted"): Error {
  const e = new Error(message);
  e.name = "AbortError";
  return e;
}

const alwaysAbort = () => { throw makeAbortError(); };

// 1. rand=0 (mínimo) → sleeps exatos sem jitter
Deno.test("backoff sleeps: AbortError + rand=0 → sleeps == [250, 500]", async () => {
  const h = makeHarness(alwaysAbort, () => 0);
  await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(h.fetches(), MAX_ATTEMPTS);
  assertEquals(h.sleeps, [BASE, BASE * 2]);
});

// 2. rand≈1 (máximo prático) → jitter máximo = floor(0.9999*250) = 249
Deno.test("backoff sleeps: AbortError + rand≈1 → sleeps == [499, 749] (jitter máx)", async () => {
  const MAX_RAND = 0.9999999;
  const h = makeHarness(alwaysAbort, () => MAX_RAND);
  await dispatchOne(SUB, PAYLOAD, h.deps);
  const expectedJitter = Math.floor(MAX_RAND * BASE); // 249
  assertEquals(h.sleeps, [BASE + expectedJitter, BASE * 2 + expectedJitter]);
  assertEquals(h.sleeps, [499, 749]);
});

// 3. rand=0.5 → jitter constante = 125
Deno.test("backoff sleeps: AbortError + rand=0.5 → sleeps == [375, 625]", async () => {
  const h = makeHarness(alwaysAbort, () => 0.5);
  await dispatchOne(SUB, PAYLOAD, h.deps);
  assertEquals(h.sleeps, [BASE + 125, BASE * 2 + 125]);
});

// 4. rand sequencial: cada sleep consome o próximo valor de rand
Deno.test("backoff sleeps: AbortError + rand sequencial [0.1, 0.9] → sleeps == [275, 725]", async () => {
  const seq = [0.1, 0.9];
  let i = 0;
  const rand = () => seq[i++ % seq.length];
  const h = makeHarness(alwaysAbort, rand);
  await dispatchOne(SUB, PAYLOAD, h.deps);
  // attempt 1 usa rand=0.1 → floor(25)=25; attempt 2 usa rand=0.9 → floor(225)=225
  assertEquals(h.sleeps, [BASE + 25, BASE * 2 + 225]);
  assertEquals(h.sleeps, [275, 725]);
});

// 5. Fórmula geral: para vários valores fixos de rand, sleeps[i] === 2^i * BASE + floor(r*BASE)
Deno.test("backoff sleeps: fórmula geral validada para r ∈ {0, 0.25, 0.5, 0.75}", async () => {
  for (const r of [0, 0.25, 0.5, 0.75]) {
    const h = makeHarness(alwaysAbort, () => r);
    await dispatchOne(SUB, PAYLOAD, h.deps);
    const jitter = Math.floor(r * BASE);
    const expected = [0, 1].map((i) => (2 ** i) * BASE + jitter);
    assertEquals(
      h.sleeps,
      expected,
      `sleeps incorretos para r=${r}: esperado ${JSON.stringify(expected)}, obtido ${JSON.stringify(h.sleeps)}`,
    );
  }
});

// 6. Cap de 8000ms: cobertura defensiva do Math.min em backoffDelay
Deno.test("backoff sleeps: cap de 8000ms aplicado para attempt grande (defensivo)", () => {
  // attempt=6 → 2^5 * 250 = 8000 (no cap); attempt=7 → 16000 capped a 8000
  const d6 = backoffDelay(6, () => 0);
  const d7 = backoffDelay(7, () => 0);
  assertEquals(d6, MAX_BASE_CAP);
  assertEquals(d7, MAX_BASE_CAP);

  // Com jitter máximo, base permanece capped; jitter é somado por cima
  const d7max = backoffDelay(7, () => 0.9999999);
  assertEquals(d7max, MAX_BASE_CAP + Math.floor(0.9999999 * BASE));
  assert(d7max <= MAX_BASE_CAP + BASE, "sleep não deve exceder cap + jitter máximo");
});

// 7. Ordem temporal: sleep SEMPRE entre delivery N e fetch N+1, NUNCA após o último delivery
Deno.test("backoff sleeps: ordem temporal fetch → delivery → sleep entrelaçada corretamente", async () => {
  const h = makeHarness(alwaysAbort, () => 0);
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.timeline, [
    { kind: "fetch", attempt: 1 },
    { kind: "delivery", attempt: 1, succeeded: false },
    { kind: "sleep", ms: BASE },
    { kind: "fetch", attempt: 2 },
    { kind: "delivery", attempt: 2, succeeded: false },
    { kind: "sleep", ms: BASE * 2 },
    { kind: "fetch", attempt: 3 },
    { kind: "delivery", attempt: 3, succeeded: false },
    // crucial: nenhum sleep após o último delivery
  ]);

  // Garantia explícita: o último evento NÃO é um sleep
  assertEquals(h.timeline[h.timeline.length - 1].kind, "delivery");
});

// 8. Sucesso na 2ª tentativa após 1 AbortError → 1 único sleep, sem 3º fetch
Deno.test("backoff sleeps: sucesso na 2ª após 1 AbortError → sleeps == [250], timeline curto", async () => {
  const h = makeHarness(
    (attempt) => {
      if (attempt === 1) throw makeAbortError();
      return new Response("ok", { status: 200 });
    },
    () => 0,
  );
  const r = await dispatchOne(SUB, PAYLOAD, h.deps);

  assertEquals(h.fetches(), 2);
  assertEquals(h.sleeps, [BASE]);
  assertEquals(r.attempts, 2);
  assertEquals(r.succeeded, true);

  assertEquals(h.timeline, [
    { kind: "fetch", attempt: 1 },
    { kind: "delivery", attempt: 1, succeeded: false },
    { kind: "sleep", ms: BASE },
    { kind: "fetch", attempt: 2 },
    { kind: "delivery", attempt: 2, succeeded: true },
  ]);
});

// 9. AbortError nas 2 primeiras tentativas, 200 na 3ª → error_message null SÓ na entrega bem-sucedida
Deno.test(
  "backoff sleeps: AbortError × 2 + 200 na 3ª → error_message null apenas na delivery #3",
  async () => {
    const h = makeHarness(
      (attempt) => {
        if (attempt < 3) throw makeAbortError(`timeout #${attempt}`);
        return new Response("ok", { status: 200 });
      },
      () => 0,
    );
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    // 3 tentativas executadas, 2 sleeps determinísticos entre elas
    assertEquals(h.fetches(), MAX_ATTEMPTS);
    assertEquals(h.sleeps, [BASE, BASE * 2]);

    // Resultado final reflete sucesso na última
    assertEquals(r.attempts, MAX_ATTEMPTS);
    assertEquals(r.succeeded, true);
    assertEquals(r.status, 200);
    assertEquals(r.error, null, "r.error deve ser null quando a última tentativa sucede");

    // 3 entregas registradas, com error_message presente nas duas primeiras e null SÓ na terceira
    assertEquals(h.deliveries.length, MAX_ATTEMPTS);

    assertEquals(h.deliveries[0].error_message, "AbortError: timeout #1");
    assertEquals(h.deliveries[0].succeeded, false);
    assertEquals(h.deliveries[0].status, 0);

    assertEquals(h.deliveries[1].error_message, "AbortError: timeout #2");
    assertEquals(h.deliveries[1].succeeded, false);
    assertEquals(h.deliveries[1].status, 0);

    assertEquals(h.deliveries[2].error_message, null, "delivery #3 deve ter error_message=null");
    assertEquals(h.deliveries[2].succeeded, true);
    assertEquals(h.deliveries[2].status, 200);

    // Invariante: exatamente 1 entrega com error_message null, e é a bem-sucedida
    const nullErrors = h.deliveries.filter((d) => d.error_message === null);
    assertEquals(nullErrors.length, 1);
    assertEquals(nullErrors[0].succeeded, true);

    // Ordem temporal exata: sleeps entrelaçados, sem sleep após o último delivery
    assertEquals(h.timeline, [
      { kind: "fetch", attempt: 1 },
      { kind: "delivery", attempt: 1, succeeded: false },
      { kind: "sleep", ms: BASE },
      { kind: "fetch", attempt: 2 },
      { kind: "delivery", attempt: 2, succeeded: false },
      { kind: "sleep", ms: BASE * 2 },
      { kind: "fetch", attempt: 3 },
      { kind: "delivery", attempt: 3, succeeded: true },
    ]);
  },
);
