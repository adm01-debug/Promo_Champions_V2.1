import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateWebhookPayload, WebhookContracts } from "../_shared/webhook-validator.ts";

Deno.test("execute-workflow contract validation - v1", async () => {
  const payload = {
    workflowId: "wf-123",
    input: { key: "value" }
  };
  const result = validateWebhookPayload(WebhookContracts.executeWorkflow, payload, "1.0.0");
  assertEquals(result.success, true);
});

Deno.test("execute-workflow contract validation - missing workflowId", async () => {
  const payload = {
    input: { key: "value" }
  };
  const result = validateWebhookPayload(WebhookContracts.executeWorkflow, payload, "1.0.0");
  assertEquals(result.success, false);
  assertEquals(result.statusCode, 422);
});

Deno.test("ai-copilot contract validation", async () => {
  const payload = {
    prompt: "Help me with this deal",
    context: { dealId: "deal-123" }
  };
  const result = validateWebhookPayload(WebhookContracts.aiCopilot, payload, "1.0.0");
  assertEquals(result.success, true);
});
