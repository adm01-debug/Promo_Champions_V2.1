import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

import {
  backoffMs,
  decideRetry,
  isPermanentError,
  MAX_RETRIES,
  type RetryableDraft,
} from "./retry-policy.ts";

const NOW = new Date("2026-07-26T12:00:00.000Z");

function draft(overrides: Partial<RetryableDraft> = {}): RetryableDraft {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    error: "timeout contacting provider",
    retry_count: 0,
    sent_at: null,
    next_retry_at: null,
    ...overrides,
  };
}

Deno.test("erros permanentes são reconhecidos", () => {
  for (
    const e of [
      "opted_out",
      "missing_recipient_email",
      "address suppressed",
      "invalid-email",
      "Mailbox does not exist",
      "hard_bounce",
      "SMTP 5.1.1 user unknown",
      "email_infra_missing",
      "sender_not_configured",
    ]
  ) {
    assert(isPermanentError(e), `esperava permanente: ${e}`);
  }
});

Deno.test("erros transitórios não são permanentes", () => {
  for (const e of ["timeout", "429 rate limited", "502 bad gateway", "connection reset"]) {
    assert(!isPermanentError(e), `esperava transitório: ${e}`);
  }
  assert(!isPermanentError(null));
  assert(!isPermanentError(""));
});

Deno.test("já enviado é ignorado", () => {
  const d = decideRetry(draft({ sent_at: NOW.toISOString() }), NOW);
  assertEquals(d, { action: "skip", reason: "already_sent" });
});

Deno.test("sem erro é ignorado", () => {
  assertEquals(decideRetry(draft({ error: null }), NOW), { action: "skip", reason: "no_error" });
});

Deno.test("erro permanente encerra sem reenvio", () => {
  assertEquals(decideRetry(draft({ error: "opted_out" }), NOW), {
    action: "give_up",
    reason: "permanent_error",
  });
});

Deno.test("teto de tentativas encerra o rascunho", () => {
  assertEquals(decideRetry(draft({ retry_count: MAX_RETRIES }), NOW), {
    action: "give_up",
    reason: "max_retries",
  });
  assertEquals(decideRetry(draft({ retry_count: MAX_RETRIES + 7 }), NOW), {
    action: "give_up",
    reason: "max_retries",
  });
});

Deno.test("agendamento futuro adia o reenvio", () => {
  const future = new Date(NOW.getTime() + 60_000).toISOString();
  assertEquals(decideRetry(draft({ next_retry_at: future }), NOW), {
    action: "skip",
    reason: "not_due",
  });
});

Deno.test("agendamento vencido libera o reenvio", () => {
  const past = new Date(NOW.getTime() - 60_000).toISOString();
  const d = decideRetry(draft({ next_retry_at: past, retry_count: 1 }), NOW);
  assertEquals(d.action, "retry");
  if (d.action === "retry") assertEquals(d.attempt, 2);
});

Deno.test("data inválida em next_retry_at não trava o rascunho", () => {
  const d = decideRetry(draft({ next_retry_at: "não-é-data" }), NOW);
  assertEquals(d.action, "retry");
});

Deno.test("retry_count negativo ou NaN é normalizado para zero", () => {
  const a = decideRetry(draft({ retry_count: -5 }), NOW);
  const b = decideRetry(draft({ retry_count: Number.NaN }), NOW);
  assertEquals(a.action, "retry");
  assertEquals(b.action, "retry");
  if (a.action === "retry") assertEquals(a.attempt, 1);
  if (b.action === "retry") assertEquals(b.attempt, 1);
});

Deno.test("backoff cresce e respeita o teto", () => {
  const id = "abc";
  const values = [1, 2, 3, 4, 5, 6, 10].map((n) => backoffMs(n, id));
  for (let i = 1; i < 4; i++) assert(values[i] > values[i - 1], "backoff deve crescer");
  const maxAllowed = 240 * 1.2 * 60_000;
  for (const v of values) assert(v <= maxAllowed, `backoff acima do teto: ${v}`);
  assertEquals(backoffMs(0, id), backoffMs(1, id));
});

Deno.test("jitter é determinístico e disperso", () => {
  assertEquals(backoffMs(2, "id-a"), backoffMs(2, "id-a"));
  const distinct = new Set(
    Array.from({ length: 200 }, (_, i) => backoffMs(2, `draft-${i}`)),
  );
  assert(distinct.size > 50, `jitter pouco disperso: ${distinct.size}`);
});

Deno.test("simulação: 500 rascunhos convergem sem loop infinito", () => {
  let permanentes = 0;
  let esgotados = 0;
  let entregues = 0;

  for (let i = 0; i < 500; i++) {
    const permanent = i % 7 === 0;
    let d = draft({
      id: `sim-${i}`,
      error: permanent ? "hard_bounce" : "502 bad gateway",
      retry_count: 0,
    });
    let now = new Date(NOW);
    let guard = 0;
    let resolved = false;

    while (guard++ < 50) {
      const decision = decideRetry(d, now);
      if (decision.action === "give_up") {
        if (decision.reason === "permanent_error") permanentes++;
        else esgotados++;
        resolved = true;
        break;
      }
      if (decision.action === "skip") {
        now = new Date(now.getTime() + 60 * 60_000);
        continue;
      }
      // Metade dos transitórios passa a entregar na 3ª tentativa.
      if (decision.attempt >= 3 && i % 2 === 0) {
        entregues++;
        resolved = true;
        break;
      }
      d = { ...d, retry_count: decision.attempt, next_retry_at: decision.nextRetryAt };
      now = new Date(new Date(decision.nextRetryAt).getTime());
    }

    assert(resolved, `rascunho ${i} não convergiu`);
    assert(guard < 50, `rascunho ${i} excedeu o limite de iterações`);
  }

  assertEquals(permanentes + esgotados + entregues, 500);
  assert(permanentes > 0 && esgotados > 0 && entregues > 0);
});
