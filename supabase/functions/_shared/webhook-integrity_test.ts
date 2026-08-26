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
