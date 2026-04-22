// Foco: comportamento do dispatcher quando insertDelivery falha em TODAS as tentativas.
// Combina dois invariantes:
//   (A) Zero linhas persistidas em winloss_webhook_deliveries
//       MAS as tentativas (fetches) ocorrem exatamente MAX_ATTEMPTS vezes.
//   (B) DLQ é acionada após a 3ª falha terminal, com attempts=3 e last_error
//       consistente com o erro da última tentativa (HTTP / Abort / Timeout / TypeError).
//
// Determinístico: rand=()=>0, sleep no-op, sem Math.random.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  type DeadLetterEntry,
  type DeliveryRow,
  type DispatchDeps,
  dispatchOne,
  MAX_ATTEMPTS,
  type Subscription,
} from "./retry.ts";

const SUB: Subscription = { id: "sub-ifd", url: "https://x.test/hook", events: ["x"], secret: null };
const PAYLOAD = { event: "x", data: { foo: 1 } };

interface Harness {
  deps: DispatchDeps;
  fetches: number;
  sleeps: number[];
  deliveryAttempts: number;          // # de chamadas a insertDelivery (mesmo que rejeite)
  insertedRows: DeliveryRow[];       // linhas que sobrevivem (não devem existir quando insertThrows=true)
  deadLetters: DeadLetterEntry[];
}

function makeFailingInsertHarness(
  fetchImpl: (n: number) => Response | Promise<Response>,
  opts: { insertError?: Error } = {},
): Harness {
  let attempt = 0;
  const sleeps: number[] = [];
  const insertedRows: DeliveryRow[] = [];
  const deadLetters: DeadLetterEntry[] = [];
  let deliveryAttempts = 0;
  const insertErr = opts.insertError ?? new Error("DB_WRITE_FAILED: simulated insert failure");

  const deps: DispatchDeps = {
    fetchFn: ((_u: string) => {
      attempt += 1;
      return Promise.resolve(fetchImpl(attempt));
    }) as typeof fetch,
    insertDelivery: (_row) => {
      deliveryAttempts += 1;
      // SEMPRE rejeita — nada é persistido
      return Promise.reject(insertErr);
    },
    sleep: (ms) => { sleeps.push(ms); return Promise.resolve(); },
    updateSubscription: () => Promise.resolve(),
    onDeadLetter: (entry) => { deadLetters.push(entry); return Promise.resolve(); },
    now: () => 0,
    rand: () => 0,
  };

  return {
    deps,
    get fetches() { return attempt; },
    sleeps,
    get deliveryAttempts() { return deliveryAttempts; },
    insertedRows,
    deadLetters,
  };
}

function namedError(name: string, message: string): Error {
  const e = new Error(message);
  e.name = name;
  return e;
}

// ─────────────────────── (A) Sem persistência + fetches=3 ───────────────────────

Deno.test(
  "insertDelivery rejeita sempre + HTTP 500×3: zero linhas persistidas, fetches=MAX_ATTEMPTS, sleeps=MAX-1",
  async () => {
    const h = makeFailingInsertHarness(() => new Response("err", { status: 500 }));
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    // INVARIANTE 1: tentativas (fetches) acontecem TODAS apesar do insert quebrar
    assertEquals(h.fetches, MAX_ATTEMPTS, "fetches devem ocorrer exatamente MAX_ATTEMPTS vezes");

    // INVARIANTE 2: insertDelivery foi CHAMADO 3× (uma por tentativa) — mas todas rejeitaram
    assertEquals(h.deliveryAttempts, MAX_ATTEMPTS, "insertDelivery foi invocado MAX_ATTEMPTS vezes");

    // INVARIANTE 3: ZERO linhas persistidas (todas as promises de insert rejeitaram)
    assertEquals(h.insertedRows.length, 0, "ZERO linhas em winloss_webhook_deliveries");

    // INVARIANTE 4: backoff continua determinístico mesmo com insert falhando
    assertEquals(h.sleeps.length, MAX_ATTEMPTS - 1, "sleeps === MAX_ATTEMPTS - 1");
    assertEquals(h.sleeps, [250, 500], "backoff exponencial preservado mesmo com insert quebrando");

    // INVARIANTE 5: resultado final coerente (loop completou normalmente)
    assertEquals(r.succeeded, false);
    assertEquals(r.attempts, MAX_ATTEMPTS);
    assertEquals(r.status, 500);
  },
);

Deno.test(
  "insertDelivery rejeita sempre + AbortError×3: zero linhas, fetches=3, erro da última propagado",
  async () => {
    const h = makeFailingInsertHarness(() => { throw namedError("AbortError", "deadline exceeded"); });
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    assertEquals(h.fetches, MAX_ATTEMPTS);
    assertEquals(h.deliveryAttempts, MAX_ATTEMPTS);
    assertEquals(h.insertedRows.length, 0);
    assertEquals(h.sleeps.length, MAX_ATTEMPTS - 1);

    assertEquals(r.succeeded, false);
    assertEquals(r.attempts, MAX_ATTEMPTS);
    assertEquals(r.status, 0);
    assertEquals(r.error, "AbortError: deadline exceeded");
  },
);

Deno.test(
  "insertDelivery rejeita sempre + sucesso na 3ª: zero linhas mas dispatcher retorna succeeded=true",
  async () => {
    const responses = [500, 500, 200];
    const h = makeFailingInsertHarness((n) => new Response("x", { status: responses[n - 1] }));
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    // Loop NÃO interrompido pela falha de insert → chegou até a 3ª e ganhou
    assertEquals(h.fetches, 3);
    assertEquals(h.deliveryAttempts, 3);
    assertEquals(h.insertedRows.length, 0, "nenhuma linha persistida apesar do sucesso final");
    assertEquals(h.sleeps.length, 2);

    assertEquals(r.succeeded, true);
    assertEquals(r.status, 200);
    assertEquals(r.error, null);
    // Sucesso → DLQ NÃO chamada
    assertEquals(h.deadLetters.length, 0);
  },
);

// ─────────────────────── (B) DLQ acionada com attempts=3 e last_error consistente ───────────────────────

Deno.test(
  "insertDelivery falha + HTTP 500×3 → DLQ chamada 1× com attempts=3, last_status=500, last_error null",
  async () => {
    const h = makeFailingInsertHarness(() => new Response("err", { status: 500 }));
    await dispatchOne(SUB, PAYLOAD, h.deps);

    // DLQ acionada exatamente 1× APÓS a 3ª tentativa (não por tentativa)
    assertEquals(h.deadLetters.length, 1);
    const dl = h.deadLetters[0];

    assertEquals(dl.attempts, MAX_ATTEMPTS, "DLQ.attempts === 3");
    assertEquals(dl.last_status, 500, "DLQ.last_status reflete HTTP da última tentativa");
    // Em falha HTTP, last_error é null (sinal vem do status não-2xx)
    assertEquals(dl.last_error, null, "falha HTTP → DLQ.last_error null");
    assertEquals(dl.subscription_id, SUB.id);
    assertEquals(dl.event, "x");
    assert(typeof dl.total_latency_ms === "number" && dl.total_latency_ms >= 0);

    // E nada foi persistido em deliveries
    assertEquals(h.insertedRows.length, 0);
  },
);

Deno.test(
  "insertDelivery falha + AbortError×3 → DLQ.attempts=3, last_status=0, last_error='AbortError: <msg>'",
  async () => {
    const MSG = "aborted by upstream deadline";
    const h = makeFailingInsertHarness(() => { throw namedError("AbortError", MSG); });
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    assertEquals(h.fetches, MAX_ATTEMPTS);
    assertEquals(h.insertedRows.length, 0);

    assertEquals(h.deadLetters.length, 1);
    const dl = h.deadLetters[0];
    assertEquals(dl.attempts, MAX_ATTEMPTS);
    assertEquals(dl.last_status, 0);
    assertEquals(dl.last_error, `AbortError: ${MSG}`);
    // Coerência: DLQ.last_error === r.error (resultado final do dispatcher)
    assertEquals(dl.last_error, r.error, "DLQ.last_error deve coincidir com r.error");
  },
);

Deno.test(
  "insertDelivery falha + TimeoutError×3 → DLQ.last_error='TimeoutError: <msg>' coerente",
  async () => {
    const MSG = "signal timed out after 8000ms";
    const h = makeFailingInsertHarness(() => { throw namedError("TimeoutError", MSG); });
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    assertEquals(h.fetches, MAX_ATTEMPTS);
    assertEquals(h.insertedRows.length, 0);
    assertEquals(h.deadLetters.length, 1);

    const dl = h.deadLetters[0];
    assertEquals(dl.attempts, MAX_ATTEMPTS);
    assertEquals(dl.last_status, 0);
    assertEquals(dl.last_error, `TimeoutError: ${MSG}`);
    assertEquals(dl.last_error, r.error);

    // Garantia explícita do prefixo (separação Name vs message)
    assert(dl.last_error!.startsWith("TimeoutError: "));
  },
);

Deno.test(
  "insertDelivery falha + TypeError (rede) ×3 → DLQ.last_error='TypeError: <msg>' coerente",
  async () => {
    const MSG = "error sending request: connection reset by peer";
    const h = makeFailingInsertHarness(() => { throw namedError("TypeError", MSG); });
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    assertEquals(h.fetches, MAX_ATTEMPTS);
    assertEquals(h.insertedRows.length, 0);

    assertEquals(h.deadLetters.length, 1);
    const dl = h.deadLetters[0];
    assertEquals(dl.attempts, MAX_ATTEMPTS);
    assertEquals(dl.last_status, 0);
    assertEquals(dl.last_error, `TypeError: ${MSG}`);
    assertEquals(dl.last_error, r.error);
  },
);

Deno.test(
  "insertDelivery falha + erro varia por tentativa (Abort#1 → Timeout#2 → TypeError#3) → DLQ.last_error reflete APENAS a 3ª",
  async () => {
    const h = makeFailingInsertHarness((n) => {
      if (n === 1) throw namedError("AbortError", "abort #1");
      if (n === 2) throw namedError("TimeoutError", "tmo #2");
      throw namedError("TypeError", "net #3");
    });
    const r = await dispatchOne(SUB, PAYLOAD, h.deps);

    assertEquals(h.fetches, MAX_ATTEMPTS);
    assertEquals(h.insertedRows.length, 0);
    assertEquals(h.deadLetters.length, 1);

    const dl = h.deadLetters[0];
    assertEquals(dl.attempts, MAX_ATTEMPTS);
    assertEquals(dl.last_status, 0);
    // last_error reflete EXATAMENTE o erro da ÚLTIMA tentativa, não as anteriores
    assertEquals(dl.last_error, "TypeError: net #3");
    assertEquals(dl.last_error, r.error);

    // Não vaza informação das tentativas anteriores
    assert(!dl.last_error!.includes("AbortError"));
    assert(!dl.last_error!.includes("TimeoutError"));
    assert(!dl.last_error!.includes("abort #1"));
    assert(!dl.last_error!.includes("tmo #2"));
  },
);

Deno.test(
  "insertDelivery falha + sucesso na 3ª → DLQ NUNCA chamada (mesmo com insert quebrado)",
  async () => {
    const responses = [500, 500, 200];
    const h = makeFailingInsertHarness((n) => new Response("x", { status: responses[n - 1] }));
    await dispatchOne(SUB, PAYLOAD, h.deps);

    // DLQ é acionada APENAS por exaustão sem sucesso — sucesso na 3ª impede
    assertEquals(h.deadLetters.length, 0, "sucesso final → DLQ NÃO disparada");
    assertEquals(h.insertedRows.length, 0, "ainda zero linhas em deliveries (insert quebrado)");
    assertEquals(h.fetches, 3);
  },
);

// ─────────────── Cobertura cruzada: insert quebrado NÃO altera contrato do dispatcher ───────────────

Deno.test(
  "insertDelivery falha em CADA cenário (HTTP/Abort/Timeout/TypeError): SEMPRE 3 fetches + 0 rows + DLQ 1×",
  async () => {
    const fixtures: Array<{ name: string; impl: (n: number) => Response | Promise<Response>; expectedLastError: string | null; expectedLastStatus: number }> = [
      { name: "HTTP", impl: () => new Response("e", { status: 503 }), expectedLastError: null, expectedLastStatus: 503 },
      { name: "AbortError", impl: () => { throw namedError("AbortError", "abrt"); }, expectedLastError: "AbortError: abrt", expectedLastStatus: 0 },
      { name: "TimeoutError", impl: () => { throw namedError("TimeoutError", "tmo"); }, expectedLastError: "TimeoutError: tmo", expectedLastStatus: 0 },
      { name: "TypeError", impl: () => { throw namedError("TypeError", "net"); }, expectedLastError: "TypeError: net", expectedLastStatus: 0 },
    ];

    for (const fx of fixtures) {
      const h = makeFailingInsertHarness(fx.impl);
      const r = await dispatchOne(SUB, PAYLOAD, h.deps);

      assertEquals(h.fetches, MAX_ATTEMPTS, `[${fx.name}] fetches=3`);
      assertEquals(h.deliveryAttempts, MAX_ATTEMPTS, `[${fx.name}] insertDelivery invocado 3×`);
      assertEquals(h.insertedRows.length, 0, `[${fx.name}] 0 linhas persistidas`);
      assertEquals(h.sleeps.length, MAX_ATTEMPTS - 1, `[${fx.name}] sleeps=2`);
      assertEquals(h.deadLetters.length, 1, `[${fx.name}] DLQ chamada 1×`);

      const dl = h.deadLetters[0];
      assertEquals(dl.attempts, MAX_ATTEMPTS, `[${fx.name}] DLQ.attempts=3`);
      assertEquals(dl.last_status, fx.expectedLastStatus, `[${fx.name}] DLQ.last_status`);
      assertEquals(dl.last_error, fx.expectedLastError, `[${fx.name}] DLQ.last_error`);
      // Coerência com resultado do dispatcher
      assertEquals(dl.last_error, r.error, `[${fx.name}] DLQ.last_error === r.error`);
      assertEquals(dl.last_status, r.status, `[${fx.name}] DLQ.last_status === r.status`);
    }
  },
);
