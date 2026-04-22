// Foco: quando insertDelivery falha em TODAS as tentativas e o webhook nunca tem sucesso,
// o dead-letter entry deve refletir o webhook ORIGINAL — payload identico (preservando chaves
// internas __*) e coerente com o body/headers que o dispatcher enviou ao fetchFn em cada tentativa.
//
// Como `DeadLetterEntry` expõe apenas `payload` (não `body` serializado nem `headers` HTTP),
// validamos a equivalência via cross-check:
//   1) Capturamos body+headers reais passados ao fetchFn em CADA uma das 3 tentativas.
//   2) Conferimos que body == JSON({sanitize(payload), dispatched_at: <iso>}) e que
//      os headers contêm Content-Type, X-Winloss-Event e X-Winloss-Signature corretos.
//   3) Conferimos que o `payload` recebido pela DLQ é === ao payload original (identidade
//      referencial), inclui as chaves internas __* (não-sanitizado) e é coerente com o
//      body sanitizado enviado em todas as 3 tentativas.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  type DeadLetterEntry,
  type DispatchDeps,
  dispatchOne,
  MAX_ATTEMPTS,
  type Subscription,
} from "./retry.ts";

const SUB: Subscription = {
  id: "sub-dlq-bh",
  url: "https://hook.test/winloss",
  events: ["deal.lost"],
  secret: "shh-signature-token",
};

const PAYLOAD: Record<string, unknown> = {
  event: "deal.lost",
  data: { deal_id: "d-42", amount: 1234.5, nested: [1, 2, { z: true }] },
  __dispatch_id: "trace-xyz",
  __replay: false,
};

interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  bodyRaw: string;
  bodyJson: Record<string, unknown>;
}

Deno.test(
  "DLQ recebe payload original coerente com body/headers do fetch em todas as 3 tentativas",
  async () => {
    const requests: CapturedRequest[] = [];
    const deadLetters: DeadLetterEntry[] = [];
    let attempt = 0;

    const deps: DispatchDeps = {
      fetchFn: ((url: string, init?: RequestInit) => {
        attempt += 1;
        const rawHeaders = (init?.headers ?? {}) as Record<string, string>;
        const bodyRaw = String(init?.body ?? "");
        const bodyJson = JSON.parse(bodyRaw) as Record<string, unknown>;
        requests.push({
          url,
          method: String(init?.method ?? "GET"),
          headers: { ...rawHeaders },
          bodyRaw,
          bodyJson,
        });
        // Falha HTTP persistente para esgotar tentativas e disparar a DLQ
        return Promise.resolve(new Response("upstream down", { status: 503 }));
      }) as typeof fetch,
      // insertDelivery FALHA em todas as tentativas → nada persiste em winloss_webhook_deliveries
      insertDelivery: () => Promise.reject(new Error("DB_WRITE_FAILED")),
      sleep: () => Promise.resolve(),
      updateSubscription: () => Promise.resolve(),
      onDeadLetter: (entry) => { deadLetters.push(entry); return Promise.resolve(); },
      now: () => 0,
      rand: () => 0,
    };

    const r = await dispatchOne(SUB, PAYLOAD, deps);

    // ── Resultado terminal ────────────────────────────────────────────────
    assertEquals(r.succeeded, false);
    assertEquals(r.attempts, MAX_ATTEMPTS);
    assertEquals(r.status, 503);
    assertEquals(attempt, MAX_ATTEMPTS, "fetch chamado 3×");
    assertEquals(requests.length, MAX_ATTEMPTS);

    // ── DLQ disparada exatamente 1× ───────────────────────────────────────
    assertEquals(deadLetters.length, 1, "dead-letter chamado 1×");
    const dlq = deadLetters[0];

    // Payload original preservado (identidade referencial + chaves __*)
    assertEquals(dlq.payload, PAYLOAD, "payload da DLQ deep-eq ao original");
    assert(dlq.payload === PAYLOAD, "DLQ recebe a MESMA referência do payload original");
    assertEquals(dlq.payload.__dispatch_id, "trace-xyz", "chave interna preservada");
    assertEquals(dlq.payload.__replay, false, "chave interna preservada");
    assertEquals(dlq.event, "deal.lost");
    assertEquals(dlq.subscription_id, SUB.id);
    assertEquals(dlq.last_status, 503);
    assertEquals(dlq.attempts, MAX_ATTEMPTS);

    // ── Cross-check: body/headers de CADA uma das 3 tentativas ────────────
    // 1) Body sanitizado esperado (sem __*) + dispatched_at adicionado pelo dispatcher
    const expectedSanitized = { event: PAYLOAD.event, data: PAYLOAD.data };

    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      const req = requests[i];
      const ctx = `tentativa #${i + 1}`;

      // URL + método
      assertEquals(req.url, SUB.url, `${ctx}: URL bate com a subscription`);
      assertEquals(req.method, "POST", `${ctx}: método POST`);

      // Headers obrigatórios
      assertEquals(req.headers["Content-Type"], "application/json", `${ctx}: Content-Type`);
      assertEquals(req.headers["X-Winloss-Event"], String(PAYLOAD.event), `${ctx}: X-Winloss-Event = event do payload`);
      assertEquals(req.headers["X-Winloss-Signature"], SUB.secret, `${ctx}: X-Winloss-Signature = secret`);

      // Body: sanitizado (sem __*) + carrega dispatched_at ISO-8601
      const { dispatched_at, ...bodyWithoutTimestamp } = req.bodyJson as { dispatched_at: string };
      assertEquals(bodyWithoutTimestamp, expectedSanitized, `${ctx}: body sanitizado coincide com payload sem __*`);
      assert(typeof dispatched_at === "string" && dispatched_at.length > 0, `${ctx}: dispatched_at presente`);
      assert(!Number.isNaN(Date.parse(dispatched_at)), `${ctx}: dispatched_at é ISO válido`);

      // Body NÃO leva chaves internas __* (sanitização garantida em cada tentativa)
      assert(!("__dispatch_id" in req.bodyJson), `${ctx}: body do fetch não vaza __dispatch_id`);
      assert(!("__replay" in req.bodyJson), `${ctx}: body do fetch não vaza __replay`);
    }

    // ── Coerência DLQ ↔ webhook original ──────────────────────────────────
    // Reconstruir o body sanitizado a partir do payload da DLQ deve bater
    // com o body enviado em cada tentativa (módulo dispatched_at, que é runtime).
    const reconstructedFromDlq: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(dlq.payload)) {
      if (!k.startsWith("__")) reconstructedFromDlq[k] = v;
    }
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      const { dispatched_at: _ts, ...sentBody } = requests[i].bodyJson as { dispatched_at: string };
      assertEquals(
        sentBody,
        reconstructedFromDlq,
        `body enviado na tentativa #${i + 1} é reconstrutível a partir do payload da DLQ`,
      );
    }

    // O event do header == event extraído pela DLQ == event do payload original
    assertEquals(dlq.event, requests[0].headers["X-Winloss-Event"]);
    assertEquals(dlq.event, String(PAYLOAD.event));
  },
);
