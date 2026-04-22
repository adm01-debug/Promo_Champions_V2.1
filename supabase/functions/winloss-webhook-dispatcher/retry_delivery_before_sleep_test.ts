// Instrumentação determinística: prova que insertDelivery (gravação em
// winloss_webhook_deliveries) acontece SEMPRE antes do sleep da mesma tentativa,
// em múltiplos modos de falha. Sem Math.random — rand=()=>0, sleep no-op.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  type DeliveryRow,
  type DispatchDeps,
  dispatchOne,
  MAX_ATTEMPTS,
  type Subscription,
} from "./retry.ts";

const SUB: Subscription = { id: "sub-seq", url: "https://x.test/hook", events: ["x"], secret: null };
const PAYLOAD = { event: "x", data: { foo: 1 } };

type Event =
  | { seq: number; kind: "fetch"; attempt: number }
  | { seq: number; kind: "delivery"; attempt: number; succeeded: boolean }
  | { seq: number; kind: "sleep"; attempt: number; ms: number };

interface Harness {
  deps: DispatchDeps;
  events: Event[];
  deliveries: DeliveryRow[];
}

function makeHarness(
  fetchImpl: (attempt: number) => Response | Promise<Response>,
): Harness {
  let attempt = 0;
  let seq = 0;
  const events: Event[] = [];
  const deliveries: DeliveryRow[] = [];

  const deps: DispatchDeps = {
    fetchFn: ((_u: string) => {
      attempt += 1;
      events.push({ seq: ++seq, kind: "fetch", attempt });
      return Promise.resolve(fetchImpl(attempt));
    }) as typeof fetch,
    insertDelivery: (row) => {
      deliveries.push(row);
      events.push({ seq: ++seq, kind: "delivery", attempt: row.attempt, succeeded: row.succeeded });
      return Promise.resolve();
    },
    sleep: (ms) => {
      // Marca o sleep com o último attempt observado (corresponde ao attempt que falhou)
      events.push({ seq: ++seq, kind: "sleep", attempt, ms });
      return Promise.resolve();
    },
    updateSubscription: () => Promise.resolve(),
    now: () => 0,
    rand: () => 0,
  };

  return { deps, events, deliveries };
}

/** Para cada attempt N, retorna {fetch, delivery, sleep?} com seq absoluto. */
function indexByAttempt(events: Event[]) {
  const map = new Map<number, { fetch?: Event; delivery?: Event; sleep?: Event }>();
  for (const e of events) {
    const slot = map.get(e.attempt) ?? {};
    if (e.kind === "fetch") slot.fetch = e;
    else if (e.kind === "delivery") slot.delivery = e;
    else slot.sleep = e;
    map.set(e.attempt, slot);
  }
  return map;
}

/**
 * Invariante central: para CADA tentativa N que tem sleep,
 *   seq(fetch_N) < seq(delivery_N) < seq(sleep_N) < seq(fetch_{N+1}).
 * Para a última tentativa, NÃO existe sleep.
 */
function assertDeliveryBeforeSleepInvariant(events: Event[], expectedAttempts: number, opts: { lastSucceeded: boolean }) {
  const idx = indexByAttempt(events);
  for (let n = 1; n <= expectedAttempts; n++) {
    const slot = idx.get(n);
    assert(slot, `attempt ${n}: slot ausente`);
    assert(slot.fetch, `attempt ${n}: fetch ausente`);
    assert(slot.delivery, `attempt ${n}: delivery ausente`);
    assert(slot.fetch.seq < slot.delivery.seq, `attempt ${n}: fetch (${slot.fetch.seq}) deve preceder delivery (${slot.delivery.seq})`);

    const isLast = n === expectedAttempts;
    if (isLast) {
      // Sem sleep após a última tentativa (sucesso ou esgotamento)
      assert(!slot.sleep, `attempt ${n} (última): NÃO deve haver sleep, achei seq=${slot.sleep?.seq}`);
    } else {
      assert(slot.sleep, `attempt ${n}: sleep ausente entre tentativas`);
      assert(
        slot.delivery.seq < slot.sleep.seq,
        `attempt ${n}: delivery (seq=${slot.delivery.seq}) DEVE preceder sleep (seq=${slot.sleep.seq})`,
      );
      const next = idx.get(n + 1);
      assert(next?.fetch, `attempt ${n + 1}: fetch ausente`);
      assert(
        slot.sleep.seq < next.fetch.seq,
        `attempt ${n}: sleep (seq=${slot.sleep.seq}) deve preceder fetch da tentativa ${n + 1} (seq=${next.fetch.seq})`,
      );
    }
  }

  // Último delivery
  const last = idx.get(expectedAttempts);
  assertEquals(last?.delivery?.succeeded, opts.lastSucceeded);
}

/** Invariante adicional: a sequência global de seq é estritamente monotônica e contígua a partir de 1. */
function assertSeqMonotonic(events: Event[]) {
  for (let i = 0; i < events.length; i++) {
    assertEquals(events[i].seq, i + 1, `seq deve ser contíguo: posição ${i}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

Deno.test("instrumentação: HTTP error persistente (500×3) → delivery_N precede sleep_N em N=1,2; sem sleep após N=3", async () => {
  const h = makeHarness(() => new Response("e", { status: 500 }));
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertSeqMonotonic(h.events);
  assertDeliveryBeforeSleepInvariant(h.events, MAX_ATTEMPTS, { lastSucceeded: false });

  // Conta exata de eventos: 3 fetch + 3 delivery + 2 sleep = 8
  assertEquals(h.events.length, 8);
  assertEquals(h.events.filter((e) => e.kind === "sleep").length, 2);
  assertEquals(h.events.filter((e) => e.kind === "delivery").length, 3);
});

Deno.test("instrumentação: network error (Error sintético) persistente → delivery_N precede sleep_N", async () => {
  const h = makeHarness(() => { throw new Error("ENETDOWN"); });
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertSeqMonotonic(h.events);
  assertDeliveryBeforeSleepInvariant(h.events, MAX_ATTEMPTS, { lastSucceeded: false });

  // Verifica explicitamente que o seq do delivery vem ANTES do seq do sleep para attempt 1 e 2
  for (const n of [1, 2]) {
    const d = h.events.find((e) => e.kind === "delivery" && e.attempt === n)!;
    const s = h.events.find((e) => e.kind === "sleep" && e.attempt === n)!;
    assert(d.seq < s.seq, `attempt ${n}: delivery.seq (${d.seq}) < sleep.seq (${s.seq})`);
  }
});

Deno.test("instrumentação: AbortError persistente → delivery_N precede sleep_N (timeline AbortSignal)", async () => {
  const h = makeHarness(() => {
    const e = new Error("aborted");
    e.name = "AbortError";
    throw e;
  });
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertSeqMonotonic(h.events);
  assertDeliveryBeforeSleepInvariant(h.events, MAX_ATTEMPTS, { lastSucceeded: false });

  // Sleeps recebem o attempt correto (1 e 2, não 3)
  const sleepAttempts = h.events.filter((e) => e.kind === "sleep").map((e) => e.attempt);
  assertEquals(sleepAttempts, [1, 2]);
});

Deno.test("instrumentação: recovery 500→500→200 → delivery_N precede sleep_N em N=1,2; sem sleep após sucesso N=3", async () => {
  const responses = [500, 500, 200];
  const h = makeHarness((n) => new Response("x", { status: responses[n - 1] }));
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertSeqMonotonic(h.events);
  assertDeliveryBeforeSleepInvariant(h.events, 3, { lastSucceeded: true });

  // Conferência cirúrgica do último delivery: succeeded=true e SEM sleep depois
  const last = h.events[h.events.length - 1];
  assertEquals(last.kind, "delivery");
  assertEquals(last.attempt, 3);
  assert(last.kind === "delivery" && last.succeeded);
});

Deno.test("instrumentação: recovery na 2ª (502→200) → 1 sleep entre delivery#1 e fetch#2; nada após delivery#2", async () => {
  const responses = [502, 200];
  const h = makeHarness((n) => new Response("x", { status: responses[n - 1] }));
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertSeqMonotonic(h.events);
  assertDeliveryBeforeSleepInvariant(h.events, 2, { lastSucceeded: true });

  // 2 fetch + 2 delivery + 1 sleep = 5 eventos
  assertEquals(h.events.length, 5);

  // Sequência exata
  assertEquals(
    h.events.map((e) => `${e.kind}#${e.attempt}`),
    ["fetch#1", "delivery#1", "sleep#1", "fetch#2", "delivery#2"],
  );
});

Deno.test("instrumentação: mistura HTTP+network (500 → throw → 200) preserva delivery→sleep para CADA tipo de falha", async () => {
  const h = makeHarness((n) => {
    if (n === 1) return new Response("e", { status: 500 });
    if (n === 2) throw new Error("ENETDOWN");
    return new Response("ok", { status: 200 });
  });
  await dispatchOne(SUB, PAYLOAD, h.deps);

  assertSeqMonotonic(h.events);
  assertDeliveryBeforeSleepInvariant(h.events, 3, { lastSucceeded: true });

  // Sequência completa: independente do MODO de falha (HTTP vs throw),
  // delivery sempre vem antes do sleep da mesma tentativa
  assertEquals(
    h.events.map((e) => `${e.kind}#${e.attempt}`),
    [
      "fetch#1", "delivery#1", "sleep#1",
      "fetch#2", "delivery#2", "sleep#2",
      "fetch#3", "delivery#3",
    ],
  );
});

Deno.test("instrumentação: invariante numérica — para CADA N<MAX, idxOf(delivery,N) < idxOf(sleep,N) < idxOf(fetch,N+1)", async () => {
  // Cenário: HTTP error persistente — força MAX_ATTEMPTS exatas
  const h = makeHarness(() => new Response("e", { status: 503 }));
  await dispatchOne(SUB, PAYLOAD, h.deps);

  const idxOf = (kind: Event["kind"], attempt: number): number =>
    h.events.findIndex((e) => e.kind === kind && e.attempt === attempt);

  for (let n = 1; n < MAX_ATTEMPTS; n++) {
    const dIdx = idxOf("delivery", n);
    const sIdx = idxOf("sleep", n);
    const fNextIdx = idxOf("fetch", n + 1);
    assert(dIdx >= 0, `delivery#${n} encontrado`);
    assert(sIdx >= 0, `sleep#${n} encontrado`);
    assert(fNextIdx >= 0, `fetch#${n + 1} encontrado`);
    assert(dIdx < sIdx, `delivery#${n} (idx ${dIdx}) < sleep#${n} (idx ${sIdx})`);
    assert(sIdx < fNextIdx, `sleep#${n} (idx ${sIdx}) < fetch#${n + 1} (idx ${fNextIdx})`);
    // E não há outros eventos entre delivery#N e sleep#N
    assertEquals(sIdx - dIdx, 1, `delivery#${n} é IMEDIATAMENTE seguido de sleep#${n}`);
  }
});
