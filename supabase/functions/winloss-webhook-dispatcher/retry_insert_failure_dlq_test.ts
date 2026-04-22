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

// ─────────────── Sleep timing: insertDelivery falhando → exatamente 2 sleeps, nenhum após a última ───────────────

/**
 * Harness instrumentado com timeline (fetch/insert/sleep + attempt) para
 * provar que NENHUM sleep ocorre depois da última tentativa.
 */
type TimelineEvent =
  | { seq: number; kind: "fetch"; attempt: number }
  | { seq: number; kind: "insert"; attempt: number; rejected: boolean }
  | { seq: number; kind: "sleep"; attempt: number; ms: number };

interface TimelineHarness {
  deps: DispatchDeps;
  events: TimelineEvent[];
  insertedRows: DeliveryRow[];
  deadLetters: DeadLetterEntry[];
}

function makeFailingInsertTimelineHarness(
  fetchImpl: (n: number) => Response | Promise<Response>,
): TimelineHarness {
  let attempt = 0;
  let seq = 0;
  const events: TimelineEvent[] = [];
  const insertedRows: DeliveryRow[] = [];
  const deadLetters: DeadLetterEntry[] = [];

  const deps: DispatchDeps = {
    fetchFn: ((_u: string) => {
      attempt += 1;
      events.push({ seq: ++seq, kind: "fetch", attempt });
      return Promise.resolve(fetchImpl(attempt));
    }) as typeof fetch,
    insertDelivery: (row) => {
      events.push({ seq: ++seq, kind: "insert", attempt: row.attempt, rejected: true });
      return Promise.reject(new Error("DB_WRITE_FAILED"));
    },
    sleep: (ms) => {
      events.push({ seq: ++seq, kind: "sleep", attempt, ms });
      return Promise.resolve();
    },
    updateSubscription: () => Promise.resolve(),
    onDeadLetter: (entry) => { deadLetters.push(entry); return Promise.resolve(); },
    now: () => 0,
    rand: () => 0,
  };
  return { deps, events, insertedRows, deadLetters };
}

Deno.test(
  "insertDelivery falhando + falha persistente: EXATAMENTE 2 sleeps, NENHUM após attempt=MAX_ATTEMPTS",
  async () => {
    // Fixture cobre todos os modos de falha terminal: HTTP, Abort, Timeout, TypeError
    const fixtures: Array<{ name: string; impl: (n: number) => Response | Promise<Response> }> = [
      { name: "HTTP 500×3", impl: () => new Response("e", { status: 500 }) },
      { name: "AbortError×3", impl: () => { throw namedError("AbortError", "abrt"); } },
      { name: "TimeoutError×3", impl: () => { throw namedError("TimeoutError", "tmo"); } },
      { name: "TypeError×3", impl: () => { throw namedError("TypeError", "net"); } },
    ];

    for (const fx of fixtures) {
      const h = makeFailingInsertTimelineHarness(fx.impl);
      await dispatchOne(SUB, PAYLOAD, h.deps);

      const fetches = h.events.filter((e) => e.kind === "fetch");
      const sleeps = h.events.filter((e) => e.kind === "sleep");
      const inserts = h.events.filter((e) => e.kind === "insert");

      // (1) Quantidade EXATA de sleeps: 2 (= MAX_ATTEMPTS - 1)
      assertEquals(sleeps.length, 2, `[${fx.name}] sleeps EXATAMENTE 2`);
      assertEquals(sleeps.length, MAX_ATTEMPTS - 1, `[${fx.name}] sleeps === MAX_ATTEMPTS-1`);

      // (2) Sleeps cobrem APENAS attempts 1 e 2 — NUNCA o último (3)
      const sleepAttempts = sleeps.map((e) => e.attempt).sort((a, b) => a - b);
      assertEquals(sleepAttempts, [1, 2], `[${fx.name}] sleeps em attempts [1, 2] apenas`);
      const sleepOnLast = sleeps.find((e) => e.attempt === MAX_ATTEMPTS);
      assert(
        !sleepOnLast,
        `[${fx.name}] NENHUM sleep com attempt=${MAX_ATTEMPTS}, achei seq=${sleepOnLast?.seq}`,
      );

      // (3) Backoff determinístico mantido mesmo com insert quebrado (rand=0)
      assertEquals(sleeps.map((e) => e.ms), [250, 500], `[${fx.name}] backoff [250, 500]`);

      // (4) Fetches/inserts continuam acontecendo 3× (loop não interrompido)
      assertEquals(fetches.length, MAX_ATTEMPTS, `[${fx.name}] fetches=3`);
      assertEquals(inserts.length, MAX_ATTEMPTS, `[${fx.name}] insertDelivery invocado 3×`);
      assert(inserts.every((e) => e.kind === "insert" && e.rejected), `[${fx.name}] todos os inserts rejeitaram`);

      // (5) Nenhum evento APÓS o último insert (=> nenhum sleep depois da 3ª)
      const lastInsertIdx = h.events.findLastIndex((e) => e.kind === "insert" && e.attempt === MAX_ATTEMPTS);
      const eventsAfterLastInsert = h.events.slice(lastInsertIdx + 1);
      assertEquals(
        eventsAfterLastInsert.filter((e) => e.kind === "sleep").length,
        0,
        `[${fx.name}] zero sleeps após insert da última tentativa`,
      );

      // (6) Timeline ordenada: para n∈{1,2}, fetch_n → insert_n → sleep_n → fetch_{n+1}
      for (const n of [1, 2]) {
        const f = h.events.find((e) => e.kind === "fetch" && e.attempt === n)!;
        const i = h.events.find((e) => e.kind === "insert" && e.attempt === n)!;
        const s = h.events.find((e) => e.kind === "sleep" && e.attempt === n)!;
        const fNext = h.events.find((e) => e.kind === "fetch" && e.attempt === n + 1)!;
        assert(f.seq < i.seq, `[${fx.name}] fetch#${n} < insert#${n}`);
        assert(i.seq < s.seq, `[${fx.name}] insert#${n} < sleep#${n}`);
        assert(s.seq < fNext.seq, `[${fx.name}] sleep#${n} < fetch#${n+1}`);
      }

      // (7) DLQ chamada 1× confirmando que o flow chegou ao fim sem sleep extra
      assertEquals(h.deadLetters.length, 1, `[${fx.name}] DLQ 1×`);
      assertEquals(h.deadLetters[0].attempts, MAX_ATTEMPTS, `[${fx.name}] DLQ.attempts=3`);
    }
  },
);

Deno.test(
  "insertDelivery falhando + sucesso na 3ª: zero sleeps após sucesso, sleeps=2 mesmo assim",
  async () => {
    // Cenário oposto: loop chega à 3ª e ganha. Ainda assim, 2 sleeps (entre 1→2 e 2→3),
    // e NENHUM sleep após a 3ª (sucesso encerra).
    const responses = [500, 500, 200];
    const h = makeFailingInsertTimelineHarness((n) => new Response("x", { status: responses[n - 1] }));
    await dispatchOne(SUB, PAYLOAD, h.deps);

    const sleeps = h.events.filter((e) => e.kind === "sleep");
    assertEquals(sleeps.length, 2, "sleeps=2 mesmo com sucesso na última");
    assertEquals(sleeps.map((e) => e.attempt).sort((a, b) => a - b), [1, 2]);

    // Último evento da timeline deve ser o insert da 3ª tentativa (não um sleep)
    const lastEvent = h.events[h.events.length - 1];
    assertEquals(lastEvent.kind, "insert", "último evento é insert (rejected) da 3ª, NÃO um sleep");
    assertEquals(lastEvent.attempt, 3);

    // Nenhum sleep com attempt=3
    assert(!sleeps.find((e) => e.attempt === 3), "nenhum sleep após a 3ª tentativa");

    // Sucesso → DLQ NÃO chamada
    assertEquals(h.deadLetters.length, 0);
  },
);

// ─────────────── insertDelivery falha em #1 e #2, fetch sucesso em #3 ───────────────

Deno.test(
  "insertDelivery rejeita em #1/#2 + fetch 500/500/200: dispatcher para na 3ª, succeeded=true, sem DLQ",
  async () => {
    let attempt = 0;
    const sleeps: number[] = [];
    const insertCalls: Array<{ attempt: number; succeeded: boolean; status: number }> = [];
    const insertedRows: DeliveryRow[] = [];
    const deadLetters: DeadLetterEntry[] = [];

    const deps: DispatchDeps = {
      fetchFn: ((_u: string) => {
        attempt += 1;
        // 1ª e 2ª: HTTP 500 (falha) — 3ª: 200 (sucesso)
        const status = attempt < 3 ? 500 : 200;
        return Promise.resolve(new Response(attempt < 3 ? "err" : "ok", { status }));
      }) as typeof fetch,
      insertDelivery: (row) => {
        insertCalls.push({ attempt: row.attempt, succeeded: row.succeeded, status: row.status });
        // Rejeita nas 2 primeiras; aceita na 3ª
        if (row.attempt < 3) {
          return Promise.reject(new Error(`DB_WRITE_FAILED: attempt ${row.attempt}`));
        }
        insertedRows.push(row);
        return Promise.resolve();
      },
      sleep: (ms) => { sleeps.push(ms); return Promise.resolve(); },
      updateSubscription: () => Promise.resolve(),
      onDeadLetter: (entry) => { deadLetters.push(entry); return Promise.resolve(); },
      now: () => 0,
      rand: () => 0,
    };

    const r = await dispatchOne(SUB, PAYLOAD, deps);

    // Resultado final: dispatcher PAROU na 3ª e retornou sucesso
    assertEquals(r.succeeded, true, "succeeded=true após sucesso na 3ª tentativa");
    assertEquals(r.attempts, 3, "attempts=3 (esgotou as anteriores)");
    assertEquals(r.status, 200);
    assertEquals(r.error, null);

    // Fetches: exatamente 3
    assertEquals(attempt, 3, "fetch chamado 3×");

    // insertDelivery foi chamado 3× (mesmo as que rejeitaram)
    assertEquals(insertCalls.length, 3);
    assertEquals(insertCalls.map((c) => c.attempt), [1, 2, 3]);
    assertEquals(insertCalls.map((c) => c.succeeded), [false, false, true]);
    assertEquals(insertCalls.map((c) => c.status), [500, 500, 200]);

    // Apenas a 3ª linha sobreviveu
    assertEquals(insertedRows.length, 1, "somente a 3ª linha persiste");
    assertEquals(insertedRows[0].attempt, 3);
    assertEquals(insertedRows[0].succeeded, true);
    assertEquals(insertedRows[0].status, 200);

    // Sleeps: exatamente 2 (entre #1→#2 e #2→#3); nenhum após a 3ª
    assertEquals(sleeps.length, 2, "sleeps = MAX_ATTEMPTS - 1 mesmo com inserts falhando");

    // Sucesso terminal → DLQ NÃO acionada (mesmo com 2 inserts rejeitados)
    assertEquals(deadLetters.length, 0, "DLQ não é chamada quando há sucesso terminal");

    // Sanity: MAX_ATTEMPTS não foi excedido
    assert(r.attempts <= MAX_ATTEMPTS);
  },
);
