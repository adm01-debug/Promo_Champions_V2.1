import { assertEquals, assertNotEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createMockRequest } from "../_shared/test-utils.ts";
// Note: In real Deno environment, we'd need to mock Deno.env and imports
// For this simulation, we'll focus on contract validation and logic coverage

Deno.test("lead-scoring contract validation - invalid payload", async () => {
  const req = createMockRequest({ dealIds: "not-an-array" });
  // We can't easily import the serve handler directly if it's top-level serve()
  // But we can test the validator used by it
  const { validateWebhookPayload, WebhookContracts } = await import("../_shared/webhook-validator.ts");
  
  const result = validateWebhookPayload(WebhookContracts.leadScoring, { dealIds: "not-an-array" }, "1.0.0");
  assertEquals(result.success, false);
  assertEquals(result.statusCode, 422);
});

Deno.test("lead-scoring contract validation - missing fields", async () => {
  const { validateWebhookPayload, WebhookContracts } = await import("../_shared/webhook-validator.ts");
  
  const result = validateWebhookPayload(WebhookContracts.leadScoring, {}, "1.0.0");
  assertEquals(result.success, false);
  assertNotEquals(result.error, undefined);
});

Deno.test("lead-scoring contract validation - valid payload", async () => {
  const { validateWebhookPayload, WebhookContracts } = await import("../_shared/webhook-validator.ts");
  
  const payload = { dealIds: ["uuid-1", "uuid-2"] };
  const result = validateWebhookPayload(WebhookContracts.leadScoring, payload, "1.0.0");
  assertEquals(result.success, true);
  assertEquals(result.data?.dealIds.length, 2);
});
