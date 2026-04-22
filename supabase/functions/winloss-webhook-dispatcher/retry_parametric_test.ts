// Teste PARAMETRIZADO: matriz exaustiva de cenários (sucesso na 1ª/2ª/3ª e
// falha persistente em múltiplos modos de falha) com asserts sobre invariantes
// universais — tentativas, ordem temporal, contagens de sleep, e shape final.
//
// Determinístico: rand=()=>0, sleep no-op (mas conta+ordem capturadas).
// Sem Math.random.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  type DeadLetterEntry,
  type DeliveryRow,
  type DispatchDeps,
  dispatchOne,
  MAX_ATTEMPTS,
  type Subscription,
} from "./retry.ts";

const SUB: Subscription = { id: "sub-param", url: "https://x.test/hook", events: ["x"], secret: null };
const PAYLOAD = { event: "x", data: { foo: 1 } };

type Event =
  | { seq: number; kind: "fetch"; attempt: number }
  | { seq: number; kind: "delivery"; attempt: number; succeeded: boolean; status: number }
  | { seq: number; kind: "sleep"; attempt: number };

interface Harness {
  deps: DispatchDeps;
  events: Event[];
  deliveries: DeliveryRow[];
  deadLetters: DeadLetterEntry[];
}

function makeHarness(fetchImpl: (n: number) => Response | Promise<Response>): Harness {
  let attempt = 0;
  let seq = 0;
  const events: Event[] = [];
  const deliveries: DeliveryRow[] = [];
  const deadLetters: DeadLetterEntry[] = [];

  const deps: DispatchDeps = {
    fetchFn: ((_u: string) => {
      attempt += 1;
      events.push({ seq: ++seq, kind: "fetch", attempt });
      return Promise.resolve(fetchImpl(attempt));
    }) as typeof fetch,
    insertDelivery: (row) => {
      deliveries.push(row);
      events.push({ seq: ++seq, kind: "delivery", attempt: row.attempt, succeeded: row.succeeded, status: row.status });
      return Promise.resolve();
    },
    sleep: () => {
      events.push({ seq: ++seq, kind: "sleep", attempt });
      return Promise.resolve();
    },
    updateSubscription: () => Promise.resolve(),
    onDeadLetter: (entry) => { deadLetters.push(entry); return Promise.resolve(); },
    now: () => 0,
    rand: () => 0,
  };
  return { deps, events, deliveries, deadLetters };
}

function namedError(name: string, message: string): Error {
  const e = new Error(message);
  e.name = name;
  return e;
}

// ─────────────────── Matriz de cenários ───────────────────

interface Scenario {
  name: string;
  fetchImpl: (n: number) => Response | Promise<Response>;
  expectedAttempts: number;
  expectedSucceeded: boolean;
  expectedFinalStatus: number;
  /** prefixo esperado em error_message das tentativas que falharam (null = sucesso) */
  failurePrefix: "HTTP" | "AbortError" | "TimeoutError" | "TypeError" | "Error";
}

const SCENARIOS: Scenario[] = [
  // ── Sucesso na 1ª tentativa (sem retries) ──
  {
    name: "sucesso 1ª (200)",
    fetchImpl: () => new Response("ok", { status: 200 }),
    expectedAttempts: 1,
    expectedSucceeded: true,
    expectedFinalStatus: 200,
    failurePrefix: "HTTP",
  },
  {
    name: "sucesso 1ª (201)",
    fetchImpl: () => new Response("created", { status: 201 }),
    expectedAttempts: 1,
    expectedSucceeded: true,
    expectedFinalStatus: 201,
    failurePrefix: "HTTP",
  },
  // ── Sucesso na 2ª tentativa (1 retry) ──
  {
    name: "sucesso 2ª após HTTP 500",
    fetchImpl: (n) => new Response("x", { status: n === 1 ? 500 : 200 }),
    expectedAttempts: 2,
    expectedSucceeded: true,
    expectedFinalStatus: 200,
    failurePrefix: "HTTP",
  },
  {
    name: "sucesso 2ª após AbortError",
    fetchImpl: (n) => {
      if (n === 1) throw namedError("AbortError", "aborted #1");
      return new Response("ok", { status: 200 });
    },
    expectedAttempts: 2,
    expectedSucceeded: true,
    expectedFinalStatus: 200,
    failurePrefix: "AbortError",
  },
  {
    name: "sucesso 2ª após TypeError (rede)",
    fetchImpl: (n) => {
      if (n === 1) throw namedError("TypeError", "ECONNREFUSED");
      return new Response("ok", { status: 200 });
    },
    expectedAttempts: 2,
    expectedSucceeded: true,
    expectedFinalStatus: 200,
    failurePrefix: "TypeError",
  },
  // ── Sucesso na 3ª tentativa (2 retries) ──
  {
    name: "sucesso 3ª após HTTP 502→503",
    fetchImpl: (n) => new Response("x", { status: [502, 503, 200][n - 1] }),
    expectedAttempts: 3,
    expectedSucceeded: true,
    expectedFinalStatus: 200,
    failurePrefix: "HTTP",
  },
  {
    name: "sucesso 3ª após TimeoutError×2",
    fetchImpl: (n) => {
      if (n < 3) throw namedError("TimeoutError", `tmo #${n}`);
      return new Response("ok", { status: 200 });
    },
    expectedAttempts: 3,
    expectedSucceeded: true,
    expectedFinalStatus: 200,
    failurePrefix: "TimeoutError",
  },
  // ── Falha persistente (esgota MAX_ATTEMPTS=3) ──
  {
    name: "falha persistente HTTP 500×3",
    fetchImpl: () => new Response("e", { status: 500 }),
    expectedAttempts: MAX_ATTEMPTS,
    expectedSucceeded: false,
    expectedFinalStatus: 500,
    failurePrefix: "HTTP",
  },
  {
    name: "falha persistente AbortError×3",
    fetchImpl: () => { throw namedError("AbortError", "aborted by deadline"); },
    expectedAttempts: MAX_ATTEMPTS,
    expectedSucceeded: false,
    expectedFinalStatus: 0,
    failurePrefix: "AbortError",
  },
  {
    name: "falha persistente TimeoutError×3",
    fetchImpl: () => { throw namedError("TimeoutError", "deadline exceeded"); },
    expectedAttempts: MAX_ATTEMPTS,
    expectedSucceeded: false,
    expectedFinalStatus: 0,
    failurePrefix: "TimeoutError",
  },
  {
    name: "falha persistente TypeError×3 (rede)",
    fetchImpl: () => { throw namedError("TypeError", "connection reset"); },
    expectedAttempts: MAX_ATTEMPTS,
    expectedSucceeded: false,
    expectedFinalStatus: 0,
    failurePrefix: "TypeError",
  },
];

// ─────────────────── Asserts de invariantes (universais) ───────────────────

function assertInvariants(label: string, h: Harness, sc: Scenario) {
  // Resultado geral coerente com cenário
  const last = h.deliveries[h.deliveries.length - 1];
  assertEquals(h.deliveries.length, sc.expectedAttempts, `[${label}] deliveries.length === expectedAttempts`);
  assertEquals(last.succeeded, sc.expectedSucceeded, `[${label}] última delivery succeeded`);
  assertEquals(last.status, sc.expectedFinalStatus, `[${label}] última delivery status`);
  assertEquals(last.attempt, sc.expectedAttempts, `[${label}] última delivery attempt`);

  // (1) attempts numerados 1..N sem buracos nem repetições
  const attemptsSeen = h.deliveries.map((d) => d.attempt);
  assertEquals(
    attemptsSeen,
    Array.from({ length: sc.expectedAttempts }, (_, i) => i + 1),
    `[${label}] attempts contíguos 1..N`,
  );

  // (2) Contagens de eventos
  const fetches = h.events.filter((e) => e.kind === "fetch");
  const sleeps = h.events.filter((e) => e.kind === "sleep");
  const deliveries = h.events.filter((e) => e.kind === "delivery");
  assertEquals(fetches.length, sc.expectedAttempts, `[${label}] #fetches === expectedAttempts`);
  assertEquals(deliveries.length, sc.expectedAttempts, `[${label}] #deliveries === expectedAttempts`);
  // INVARIANTE: sleeps == fetches - 1, SEMPRE (sucesso ou falha)
  assertEquals(sleeps.length, sc.expectedAttempts - 1, `[${label}] #sleeps === N-1`);

  // (3) seq global contígua e monotônica
  for (let i = 0; i < h.events.length; i++) {
    assertEquals(h.events[i].seq, i + 1, `[${label}] seq contíguo @${i}`);
  }

  // (4) Ordem por tentativa: fetch_N → delivery_N → (sleep_N se N<final) → fetch_{N+1}
  for (let n = 1; n <= sc.expectedAttempts; n++) {
    const f = h.events.find((e) => e.kind === "fetch" && e.attempt === n)!;
    const d = h.events.find((e) => e.kind === "delivery" && e.attempt === n)!;
    assert(f, `[${label}] fetch#${n} presente`);
    assert(d, `[${label}] delivery#${n} presente`);
    assert(f.seq < d.seq, `[${label}] fetch#${n}(${f.seq}) < delivery#${n}(${d.seq})`);

    if (n < sc.expectedAttempts) {
      const s = h.events.find((e) => e.kind === "sleep" && e.attempt === n)!;
      const fNext = h.events.find((e) => e.kind === "fetch" && e.attempt === n + 1)!;
      assert(s, `[${label}] sleep#${n} presente (não é última)`);
      assert(fNext, `[${label}] fetch#${n + 1} presente`);
      assert(d.seq < s.seq, `[${label}] delivery#${n}(${d.seq}) < sleep#${n}(${s.seq})`);
      assert(s.seq < fNext.seq, `[${label}] sleep#${n}(${s.seq}) < fetch#${n+1}(${fNext.seq})`);
      assertEquals(s.seq - d.seq, 1, `[${label}] sleep#${n} adjacente a delivery#${n}`);
    } else {
      // Última tentativa NUNCA tem sleep
      const sLast = h.events.find((e) => e.kind === "sleep" && e.attempt === n);
      assert(!sLast, `[${label}] última tentativa N=${n} NÃO tem sleep`);
    }
  }

  // (5) Sleeps cobrem exatamente attempts [1..N-1]
  const sleepAttempts = sleeps.map((e) => e.attempt).sort((a, b) => a - b);
  assertEquals(
    sleepAttempts,
    Array.from({ length: sc.expectedAttempts - 1 }, (_, i) => i + 1),
    `[${label}] sleeps cobrem [1..N-1]`,
  );

  // (6) error_message coerente: null no sucesso, prefixo correto nas falhas
  for (let i = 0; i < sc.expectedAttempts; i++) {
    const d = h.deliveries[i];
    const isLast = i === sc.expectedAttempts - 1;
    const isSuccess = isLast && sc.expectedSucceeded;
    if (isSuccess) {
      assertEquals(d.error_message, null, `[${label}] delivery#${i+1} sucesso → error_message null`);
      assertEquals(d.succeeded, true);
    } else {
      assert(d.error_message, `[${label}] delivery#${i+1} falha → error_message não-null`);
      assertEquals(d.succeeded, false);
      if (sc.failurePrefix === "HTTP") {
        assert(
          d.error_message!.startsWith("HTTP "),
          `[${label}] delivery#${i+1} prefixo HTTP, got: ${d.error_message}`,
        );
      } else {
        assert(
          d.error_message!.startsWith(`${sc.failurePrefix}: `),
          `[${label}] delivery#${i+1} prefixo '${sc.failurePrefix}: ', got: ${d.error_message}`,
        );
      }
    }
  }

  // (7) DLQ: chamada exatamente 1× se falha persistente, 0× se sucesso
  if (!sc.expectedSucceeded) {
    assertEquals(h.deadLetters.length, 1, `[${label}] DLQ chamada 1×`);
    const dl = h.deadLetters[0];
    assertEquals(dl.attempts, MAX_ATTEMPTS, `[${label}] DLQ.attempts === MAX_ATTEMPTS`);
    assertEquals(dl.last_status, sc.expectedFinalStatus, `[${label}] DLQ.last_status`);
    assertEquals(dl.subscription_id, SUB.id);
    // Coerência: DLQ.last_error === error_message da última delivery
    assertEquals(dl.last_error, last.error_message, `[${label}] DLQ.last_error == last delivery.error_message`);
  } else {
    assertEquals(h.deadLetters.length, 0, `[${label}] sucesso → DLQ NÃO chamada`);
  }

  // (8) Último evento da timeline é a delivery final (nada depois)
  const lastEvent = h.events[h.events.length - 1];
  assertEquals(lastEvent.kind, "delivery", `[${label}] último evento é delivery`);
  assertEquals(lastEvent.attempt, sc.expectedAttempts, `[${label}] último evento attempt === N`);
}

// ─────────────────── Execução parametrizada ───────────────────

for (const sc of SCENARIOS) {
  Deno.test(`parametrizado: ${sc.name} → invariantes (attempts, ordem, sleeps=N-1, DLQ)`, async () => {
    const h = makeHarness(sc.fetchImpl);
    await dispatchOne(SUB, PAYLOAD, h.deps);
    assertInvariants(sc.name, h, sc);
  });
}

// ─────────────────── Meta-asserts (cobertura da matriz) ───────────────────

Deno.test("parametrizado: matriz cobre sucesso 1ª/2ª/3ª E falha persistente em ≥1 modo cada", () => {
  const buckets = {
    success1: SCENARIOS.filter((s) => s.expectedSucceeded && s.expectedAttempts === 1),
    success2: SCENARIOS.filter((s) => s.expectedSucceeded && s.expectedAttempts === 2),
    success3: SCENARIOS.filter((s) => s.expectedSucceeded && s.expectedAttempts === 3),
    failPersist: SCENARIOS.filter((s) => !s.expectedSucceeded && s.expectedAttempts === MAX_ATTEMPTS),
  };
  assert(buckets.success1.length >= 1, "≥1 cenário de sucesso na 1ª");
  assert(buckets.success2.length >= 1, "≥1 cenário de sucesso na 2ª");
  assert(buckets.success3.length >= 1, "≥1 cenário de sucesso na 3ª");
  assert(buckets.failPersist.length >= 1, "≥1 cenário de falha persistente");

  // Falha persistente cobre HTTP + ≥2 modos de exceção (Abort/Timeout/TypeError)
  const failPrefixes = new Set(buckets.failPersist.map((s) => s.failurePrefix));
  assert(failPrefixes.has("HTTP"), "falha persistente cobre HTTP");
  const exceptionModes = ["AbortError", "TimeoutError", "TypeError"].filter((p) => failPrefixes.has(p as Scenario["failurePrefix"]));
  assert(exceptionModes.length >= 2, `≥2 modos de exceção em falha persistente, got: ${exceptionModes.join(",")}`);
});
