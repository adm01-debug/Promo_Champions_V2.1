import { assertEquals, assert } from "jsr:@std/assert@1";
import { buildEnvelope, isDelivered, signatureFor } from "./contract.ts";

Deno.test("assinatura HMAC confere com vetor conhecido", async () => {
  const sig = await signatureFor("key", "The quick brown fox jumps over the lazy dog");
  assertEquals(
    sig,
    "sha256=f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8",
  );
});

Deno.test("envelope preserva payload e usa id da fila como correlation_key", () => {
  const envelope = buildEnvelope({
    id: "0d1f8d3c-0000-4000-8000-000000000001",
    event: "pedido.criado",
    payload: { os_id: "item-1", produto: "Caneca", quantidade: 10 },
    attempts: 0,
  });
  assertEquals(envelope.event, "pedido.criado");
  assertEquals(envelope.correlation_key, "0d1f8d3c-0000-4000-8000-000000000001");
  assertEquals(envelope.payload.produto, "Caneca");
});

Deno.test("apenas 2xx conta como entregue", () => {
  assert(isDelivered(200));
  assert(isDelivered(204));
  assert(!isDelivered(401));
  assert(!isDelivered(503));
});
