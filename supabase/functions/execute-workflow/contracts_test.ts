import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateWebhookPayload, WebhookContracts } from "../_shared/webhook-validator.ts";

Deno.test("execute-workflow contract validation - v1", async () => {
  const payload = {
    workflow_id: "721a6a68-6d24-480c-9a46-d5f9922e967a",
    trigger_payload: { key: "value" }
  };
  const result = validateWebhookPayload(WebhookContracts.workflowExecution, payload, "1.0.0");
  assertEquals(result.success, true);
});

Deno.test("execute-workflow contract validation - missing workflow_id", async () => {
  const payload = {
    trigger_payload: { key: "value" }
  };
  const result = validateWebhookPayload(WebhookContracts.workflowExecution, payload, "1.0.0");
  assertEquals(result.success, false);
  assertEquals(result.statusCode, 422);
});

Deno.test("ai-copilot contract validation", async () => {
  const payload = {
    context: { page: "dashboard", extra: "user is on pipeline" },
    action: "page_suggestion"
  };
  const result = validateWebhookPayload(WebhookContracts.aiCopilot, payload, "1.0.0");
  assertEquals(result.success, true);
});
