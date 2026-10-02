import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  canAdvanceMessageStatus,
  parseInboundEmailEvents,
  previousStatusesFor,
  shouldMatchAndPauseEnrollment,
} from "./webhook-integrity.ts";

Deno.test("status multicanal só avança e read é elegível uma única vez", () => {
  assertEquals(previousStatusesFor("sent"), ["queued"]);
  assertEquals(previousStatusesFor("delivered"), ["queued", "sent"]);
  assertEquals(previousStatusesFor("read"), ["queued", "sent", "delivered"]);
  assertEquals(previousStatusesFor("failed"), ["queued", "sent"]);

  assert(canAdvanceMessageStatus("sent", "read"));
  assert(!canAdvanceMessageStatus("read", "delivered"));
  assert(!canAdvanceMessageStatus("read", "read"));
  assert(!canAdvanceMessageStatus("failed", "delivered"));
  assert(!canAdvanceMessageStatus("delivered", "failed"));
});

Deno.test("lote SendGrid preserva todos os eventos e não converte entrega em reply", () => {
  const events = parseInboundEmailEvents(
    [
      {
        event: "delivered",
        email: "contato@example.com",
        sg_message_id: "msg-1",
        timestamp: 1_725_000_000,
      },
      {
        event: "bounce",
        email: "contato@example.com",
        sg_message_id: "msg-2",
        timestamp: 1_725_000_001,
      },
      {
        event: "unsubscribe",
        email: "contato@example.com",
        sg_message_id: "msg-3",
        timestamp: 1_725_000_002,
      },
    ],
    "sendgrid",
  );

  assertEquals(events.map((event) => event.messageId), [
    "msg-1",
    "msg-2",
    "msg-3",
  ]);
  assertEquals(events.map((event) => event.eventType), [
    "other",
    "bounce",
    "unsubscribe",
  ]);
  assertEquals(shouldMatchAndPauseEnrollment(events[0].eventType), false);
  assertEquals(shouldMatchAndPauseEnrollment(events[1].eventType), true);
  assertEquals(shouldMatchAndPauseEnrollment(events[2].eventType), true);
});

Deno.test("lote SendGrid vazio ou malformado falha antes de persistência parcial", () => {
  assertEquals(parseInboundEmailEvents([], "sendgrid"), []);
  assertEquals(
    parseInboundEmailEvents(
      [{ event: "delivered" }, null as unknown as Record<string, unknown>],
      "sendgrid",
    ),
    [],
  );

  const fallback = "2026-08-26T12:00:00.000Z";
  assertEquals(
    parseInboundEmailEvents(
      [{ event: "inbound", timestamp: null }],
      "sendgrid",
      () => fallback,
    )[0].receivedAt,
    fallback,
  );
});

Deno.test("handlers limitam corpo antes de autenticar e percorrem cada evento SendGrid", async () => {
  const inboundSource = await Deno.readTextFile(
    new URL("../inbound-email-webhook/index.ts", import.meta.url),
  );
  const multichannelSource = await Deno.readTextFile(
    new URL("../multichannel-status-webhook/index.ts", import.meta.url),
  );

  const inboundLimitAt = inboundSource.indexOf(
    "const rawBody = await readUtf8BodyWithinLimit",
  );
  const inboundAuthAt = inboundSource.indexOf(
    "const authentication = await authenticateInboundEmailWebhook",
  );
  assert(inboundLimitAt >= 0 && inboundLimitAt < inboundAuthAt);
  assert(inboundSource.includes("for (const event of events)"));
  assert(!inboundSource.includes("payload[0]"));

  const multichannelLimitAt = multichannelSource.indexOf(
    "const rawBody = await readUtf8BodyWithinLimit",
  );
  const multichannelAuthAt = multichannelSource.indexOf(
    "const authentication = await authenticateMultichannelStatusWebhook",
  );
  assert(multichannelLimitAt >= 0 && multichannelLimitAt < multichannelAuthAt);
  assert(multichannelSource.includes("previousStatusesFor(normalized)"));
  assert(multichannelSource.includes('"stale_or_replayed"'));
});

Deno.test("previousStatusesFor devolve cópia — mutação não corrompe a tabela canônica", () => {
  const before = previousStatusesFor("read");
  before.push("forged");
  assertEquals(previousStatusesFor("read"), ["queued", "sent", "delivered"]);
});

Deno.test("dedupe de status: transições inválidas e estado ausente são rejeitadas", () => {
  // sem status persistido não há transição válida
  assert(!canAdvanceMessageStatus(null, "sent"));
  assert(!canAdvanceMessageStatus(undefined, "sent"));
  assert(!canAdvanceMessageStatus("", "sent"));

  // 'queued' é o único predecessor de 'sent'; regredir nunca é permitido
  assert(canAdvanceMessageStatus("queued", "sent"));
  assert(!canAdvanceMessageStatus("sent", "sent"));
  assert(!canAdvanceMessageStatus("delivered", "sent"));
  // 'queued' está na lista de predecessores de 'read' — salto direto é válido
  assert(canAdvanceMessageStatus("queued", "read"));

  // failed é terminal para a cadeia de sucesso, mas 'failed' após 'sent' é válido
  assert(canAdvanceMessageStatus("sent", "failed"));
  assert(canAdvanceMessageStatus("queued", "failed"));
});

Deno.test("Resend: extrai email_id, remetente em formato 'Nome <email>' e normaliza tipo", () => {
  const events = parseInboundEmailEvents(
    {
      type: "email.received",
      data: {
        email_id: "resend-abc",
        from: "Cliente X <cliente@empresa.com>",
        subject: "Re: proposta",
        created_at: "2026-09-01T10:00:00Z",
      },
    },
    "resend",
  );

  assertEquals(events.length, 1);
  assertEquals(events[0].provider, "resend");
  assertEquals(events[0].messageId, "resend-abc");
  assertEquals(events[0].fromEmail, "cliente@empresa.com");
  assertEquals(events[0].subject, "Re: proposta");
  assertEquals(events[0].receivedAt, "2026-09-01T10:00:00Z");
  assertEquals(events[0].eventType, "reply");
});

Deno.test("Resend: payload fora do formato record é descartado inteiro", () => {
  assertEquals(parseInboundEmailEvents([], "resend"), []);
  assertEquals(
    parseInboundEmailEvents(
      [{ data: { email_id: "x" } }] as unknown as Record<string, unknown>,
      "resend",
    ),
    [],
  );
});

Deno.test("Resend: fallback para data.id e para now() quando created_at ausente", () => {
  const fallback = "2026-09-15T00:00:00.000Z";
  const [event] = parseInboundEmailEvents(
    { type: "email.bounced", data: { id: "fallback-id", from: "a@b.com" } },
    "resend",
    () => fallback,
  );
  assertEquals(event.messageId, "fallback-id");
  assertEquals(event.receivedAt, fallback);
  assertEquals(event.eventType, "bounce");
});

Deno.test("provedor genérico: usa message_id/event_type e received_at do payload", () => {
  const [event] = parseInboundEmailEvents(
    {
      message_id: "gen-1",
      from: "lead@x.com",
      subject: "Oi",
      received_at: "2026-08-01T00:00:00Z",
      event_type: "spamreport",
    },
    "generic",
  );
  assertEquals(event.provider, "generic");
  assertEquals(event.messageId, "gen-1");
  // 'spamreport' normaliza para complaint (provedores sem 'complaint' explícito)
  assertEquals(event.eventType, "complaint");
});

Deno.test("SendGrid: timestamp inválido cai no relógio da função, nunca em epoch/NaN", () => {
  const fallback = "2026-09-20T00:00:00.000Z";
  for (const bad of [0, -5, "abc", null]) {
    const [event] = parseInboundEmailEvents(
      [{ event: "delivered", sg_message_id: "m", timestamp: bad }],
      "sendgrid",
      () => fallback,
    );
    assertEquals(event.receivedAt, fallback);
  }
  const [ok] = parseInboundEmailEvents(
    [{ event: "processed", sg_message_id: "m", timestamp: 1_725_000_000 }],
    "sendgrid",
    () => fallback,
  );
  assertEquals(ok.receivedAt, new Date(1_725_000_000 * 1000).toISOString());
});
