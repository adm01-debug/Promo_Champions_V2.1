// Foco: validar que a contagem de chamadas de logging corresponde ao número
// de falhas de insertDelivery e de fetch.
//
// Mapeamento (ver retry.ts):
//   - "delivery_attempt" com level="warn"            → 1× por fetch que falha (HTTP não-2xx OU exceção)
//   - "delivery_attempt" com level="info"            → 1× por fetch que SUCEDE (2xx)
//   - "delivery_log_insert_failed" (level="error")   → 1× por rejeição de insertDelivery
//   - "backoff_scheduled" (level="info")             → 1× por retry agendado (= tentativas-1 quando não sucede no meio)
//   - "subscription_dispatch_start" (level="info")   → exatamente 1× por dispatch
//   - "subscription_dispatch_complete"               → exatamente 1× por dispatch
//   - "dead_letter_recorded" (level="warn")          → 1× se exauriu sem sucesso e DLQ ok
//
// Determinístico: rand=()=>0, sleep no-op, now=()=>0.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  type DispatchDeps,
  dispatchOne,
  type LogLevel,
  MAX_ATTEMPTS,
  type Subscription,
} from "./retry.ts";

const SUB: Subscription = { id: "sub-log", url: "https://x.test/hook", events: ["x"], secret: null };
const PAYLOAD = { event: "x", data: { foo: 1 } };

interface LogEntry { level: LogLevel; data: Record<string, unknown> }

interface LogHarness {
  deps: DispatchDeps;
  logs: LogEntry[];
  fetches: () => number;
  insertRejections: number;
}

function namedError(name: string, message: string): Error {
  const e = new Error(message);
  e.name = name;
  return e;
}

function makeLogHarness(opts: {
  fetchImpl: (n: number) => Response | Promise<Response>;
  insertImpl: (attempt: number) => Promise<void>;
}): LogHarness {
  let attempt = 0;
  let insertRejections = 0;
  const logs: LogEntry[] = [];

  const deps: DispatchDeps = {
    fetchFn: ((_u: string) => {
      attempt += 1;
      return Promise.resolve(opts.fetchImpl(attempt));
    }) as typeof fetch,
    insertDelivery: async (row) => {
      try {
        await opts.insertImpl(row.attempt);
      } catch (e) {
        insertRejections += 1;
        throw e;
      }
    },
    sleep: () => Promise.resolve(),
    updateSubscription: () => Promise.resolve(),
    onDeadLetter: () => Promise.resolve(),
    now: () => 0,
    rand: () => 0,
    log: (level, data) => { logs.push({ level, data }); },
  };

  return {
    deps,
    logs,
    fetches: () => attempt,
    get insertRejections() { return insertRejections; },
  };
}

function countByMsg(logs: LogEntry[], msg: string, level?: LogLevel): number {
  return logs.filter((l) => l.data.msg === msg && (level === undefined || l.level === level)).length;
}

// ─────────────────────── Caso 1: tudo falha (3 fetches falham, 3 inserts falham) ───────────────────────

Deno.test(
  "logs: 3 fetches falham (HTTP 500) + 3 inserts falham → warn=3 (delivery_attempt) + error=3 (insert_failed)",
  async () => {
    const h = makeLogHarness({
      fetchImpl: () => new Response("e", { status: 500 }),
      insertImpl: () => Promise.reject(new Error("DB_DOWN")),
    });
    await dispatchOne(SUB, PAYLOAD, h.deps);

    const fetchFailures = MAX_ATTEMPTS;       // 3 fetches, todas falharam (não-2xx)
    const insertFailures = h.insertRejections; // 3 rejeições

    assertEquals(h.fetches(), MAX_ATTEMPTS);
    assertEquals(insertFailures, MAX_ATTEMPTS);

    // CORE: contagens de log batem com falhas
    assertEquals(
      countByMsg(h.logs, "delivery_attempt", "warn"),
      fetchFailures,
      "1 log warn 'delivery_attempt' por fetch que falhou",
    );
    assertEquals(
      countByMsg(h.logs, "delivery_attempt", "info"),
      0,
      "nenhum 'delivery_attempt' info quando todas as tentativas falham",
    );
    assertEquals(
      countByMsg(h.logs, "delivery_log_insert_failed", "error"),
      insertFailures,
      "1 log error 'delivery_log_insert_failed' por rejeição de insertDelivery",
    );

    // Logs estruturais (independente de falhas)
    assertEquals(countByMsg(h.logs, "subscription_dispatch_start"), 1);
    assertEquals(countByMsg(h.logs, "subscription_dispatch_complete"), 1);
    assertEquals(countByMsg(h.logs, "backoff_scheduled"), MAX_ATTEMPTS - 1, "2 backoffs agendados");
    assertEquals(countByMsg(h.logs, "dead_letter_recorded", "warn"), 1, "DLQ registrada 1×");
  },
);

// ─────────────────────── Caso 2: fetches falham mas inserts sobrevivem ───────────────────────

Deno.test(
  "logs: 3 fetches falham + inserts OK → 3 warn 'delivery_attempt' + 0 'delivery_log_insert_failed'",
  async () => {
    const h = makeLogHarness({
      fetchImpl: () => new Response("e", { status: 502 }),
      insertImpl: () => Promise.resolve(),
    });
    await dispatchOne(SUB, PAYLOAD, h.deps);

    assertEquals(h.insertRejections, 0);
    assertEquals(
      countByMsg(h.logs, "delivery_attempt", "warn"),
      MAX_ATTEMPTS,
      "warn='delivery_attempt' = #fetches que falharam",
    );
    assertEquals(
      countByMsg(h.logs, "delivery_log_insert_failed"),
      0,
      "ZERO 'delivery_log_insert_failed' quando inserts não rejeitam",
    );
  },
);

// ─────────────────────── Caso 3: fetches OK mas inserts falham ───────────────────────

Deno.test(
  "logs: fetch sucede na 1ª (2xx) + insert falha → info=1 'delivery_attempt' + error=1 'insert_failed'",
  async () => {
    const h = makeLogHarness({
      fetchImpl: () => new Response("ok", { status: 200 }),
      insertImpl: () => Promise.reject(new Error("DB_DOWN")),
    });
    await dispatchOne(SUB, PAYLOAD, h.deps);

    // Sucesso na 1ª → loop encerra; apenas 1 fetch, 1 insert (rejeitado)
    assertEquals(h.fetches(), 1, "loop para no sucesso → 1 fetch");
    assertEquals(h.insertRejections, 1, "1 insert tentado → 1 rejeição");

    assertEquals(
      countByMsg(h.logs, "delivery_attempt", "info"),
      1,
      "1 log info 'delivery_attempt' por fetch que sucedeu",
    );
    assertEquals(
      countByMsg(h.logs, "delivery_attempt", "warn"),
      0,
      "nenhum warn quando fetch sucede",
    );
    assertEquals(
      countByMsg(h.logs, "delivery_log_insert_failed", "error"),
      1,
      "1 error 'delivery_log_insert_failed' = #inserts rejeitados",
    );
    // Sucesso → sem DLQ, sem backoff
    assertEquals(countByMsg(h.logs, "dead_letter_recorded"), 0);
    assertEquals(countByMsg(h.logs, "backoff_scheduled"), 0);
  },
);

// ─────────────────────── Caso 4: contagens variam por tentativa (fetch+insert misturados) ───────────────────────

Deno.test(
  "logs: 2 fetches falham + 1 sucede; insert falha apenas na 2ª → contagens batem exatamente",
  async () => {
    // fetch: 500 → 500 → 200    (2 falhas, 1 sucesso)
    // insert: ok  → reject → ok (1 rejeição)
    const fetchSeq = [500, 500, 200];
    const h = makeLogHarness({
      fetchImpl: (n) => new Response("x", { status: fetchSeq[n - 1] }),
      insertImpl: (attempt) => attempt === 2 ? Promise.reject(new Error("DB")) : Promise.resolve(),
    });
    await dispatchOne(SUB, PAYLOAD, h.deps);

    const expectedFetchFailures = 2;
    const expectedFetchSuccesses = 1;
    const expectedInsertFailures = 1;

    assertEquals(h.fetches(), 3);
    assertEquals(h.insertRejections, expectedInsertFailures);

    assertEquals(
      countByMsg(h.logs, "delivery_attempt", "warn"),
      expectedFetchFailures,
      "warn 'delivery_attempt' === #fetches falhos",
    );
    assertEquals(
      countByMsg(h.logs, "delivery_attempt", "info"),
      expectedFetchSuccesses,
      "info 'delivery_attempt' === #fetches OK",
    );
    assertEquals(
      countByMsg(h.logs, "delivery_log_insert_failed", "error"),
      expectedInsertFailures,
      "error 'delivery_log_insert_failed' === #inserts rejeitados",
    );

    // Sanidade: total de delivery_attempt === total de tentativas executadas
    assertEquals(
      countByMsg(h.logs, "delivery_attempt"),
      expectedFetchFailures + expectedFetchSuccesses,
      "total 'delivery_attempt' === #tentativas executadas",
    );

    // Sucesso → sem DLQ
    assertEquals(countByMsg(h.logs, "dead_letter_recorded"), 0);
  },
);

// ─────────────────────── Caso 5: fetch lança exceção (Abort) — ainda conta como fetch failure ───────────────────────

Deno.test(
  "logs: 3 fetches lançam AbortError + 2 inserts falham (1ª e 3ª) → contagens batem",
  async () => {
    const h = makeLogHarness({
      fetchImpl: () => { throw namedError("AbortError", "deadline"); },
      insertImpl: (attempt) => attempt === 2 ? Promise.resolve() : Promise.reject(new Error("DB")),
    });
    await dispatchOne(SUB, PAYLOAD, h.deps);

    const expectedFetchFailures = MAX_ATTEMPTS; // exceção também é falha de fetch
    const expectedInsertFailures = 2;

    assertEquals(h.fetches(), MAX_ATTEMPTS);
    assertEquals(h.insertRejections, expectedInsertFailures);

    assertEquals(
      countByMsg(h.logs, "delivery_attempt", "warn"),
      expectedFetchFailures,
      "exceções de fetch também emitem 1 warn 'delivery_attempt'",
    );
    assertEquals(
      countByMsg(h.logs, "delivery_log_insert_failed", "error"),
      expectedInsertFailures,
      "1 error 'delivery_log_insert_failed' por insert rejeitado (independente do fetch)",
    );

    // Asserção de invariância forte: contagens de log === contadores observados
    const observedFetchFailures = h.logs.filter(
      (l) => l.data.msg === "delivery_attempt" && l.level === "warn",
    ).length;
    const observedInsertFailures = h.logs.filter(
      (l) => l.data.msg === "delivery_log_insert_failed" && l.level === "error",
    ).length;
    assertEquals(observedFetchFailures, expectedFetchFailures);
    assertEquals(observedInsertFailures, h.insertRejections);

    // Cada log de insert_failed carrega o attempt correto
    const insertFailedAttempts = h.logs
      .filter((l) => l.data.msg === "delivery_log_insert_failed")
      .map((l) => l.data.attempt)
      .sort();
    assertEquals(insertFailedAttempts, [1, 3], "logs de insert_failed cobrem attempts 1 e 3");

    // Falha terminal → DLQ registrada 1×
    assertEquals(countByMsg(h.logs, "dead_letter_recorded", "warn"), 1);
  },
);

// ─────────────────────── Caso 6: nada falha — nenhum log de erro ───────────────────────

Deno.test(
  "logs: fetch OK + insert OK → 0 warn 'delivery_attempt' + 0 'delivery_log_insert_failed'",
  async () => {
    const h = makeLogHarness({
      fetchImpl: () => new Response("ok", { status: 200 }),
      insertImpl: () => Promise.resolve(),
    });
    await dispatchOne(SUB, PAYLOAD, h.deps);

    assert(h.fetches() === 1);
    assertEquals(h.insertRejections, 0);

    assertEquals(countByMsg(h.logs, "delivery_attempt", "warn"), 0, "0 fetches falhos → 0 warn");
    assertEquals(countByMsg(h.logs, "delivery_log_insert_failed"), 0, "0 inserts falhos → 0 error");
    assertEquals(countByMsg(h.logs, "delivery_attempt", "info"), 1, "1 fetch ok → 1 info");
  },
);
