import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { WebhookContracts, validateWebhookPayload } from "./webhook-validator.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

/**
 * Fuzzing utility to generate malformed data based on a schema
 */
function generateMalformedData(schema: z.ZodObject<any>): any[] {
  const base = {}; // Start empty
  const malformed: any[] = [
    null,
    undefined,
    {},
    "not-an-object",
    12345,
    true,
    { extra_unknown_field: "should be stripped or ignored depending on zod config" }
  ];

  // For each key in schema, try missing it, wrong type, or empty
  const shape = schema.shape;
  for (const key in shape) {
    const fieldSchema = shape[key];
    
    // Missing field
    const missing = { ...base };
    delete (missing as any)[key];
    malformed.push(missing);

    // Wrong types
    malformed.push({ ...base, [key]: 123 });
    malformed.push({ ...base, [key]: "invalid string if expected uuid/date" });
    malformed.push({ ...base, [key]: [] });
    malformed.push({ ...base, [key]: null });
  }

  return malformed;
}

Deno.test("Fuzzing: leadScoring contract", () => {
  const malformedScenarios = generateMalformedData(WebhookContracts.leadScoring as any);
  
  for (const payload of malformedScenarios) {
    const result = validateWebhookPayload(WebhookContracts.leadScoring, payload);
    // Even if it passes (e.g. unknown fields), we track consistency
    if (payload === null || typeof payload !== 'object' || !('dealIds' in payload)) {
      assertEquals(result.success, false, `Fuzz failed: Payload ${JSON.stringify(payload)} should have failed validation`);
      assertEquals(result.statusCode, payload === null || typeof payload !== 'object' ? 400 : 422);
    }
  }
});

Deno.test("Fuzzing: workflowExecution contract", () => {
  const malformedScenarios = generateMalformedData(WebhookContracts.workflowExecution as any);
  
  for (const payload of malformedScenarios) {
    const result = validateWebhookPayload(WebhookContracts.workflowExecution, payload);
    if (!payload || typeof payload !== 'object' || !('workflow_id' in payload)) {
      assertEquals(result.success, false, `Fuzz failed: Payload ${JSON.stringify(payload)} should have failed validation`);
    }
  }
});

Deno.test("Fuzzing: aiCopilot contract", () => {
  // Nested object fuzzing
  const malformed = [
    { context: "not-an-object" },
    { context: {} }, // missing required page
    { context: { page: "" } }, // empty page
  ];

  for (const payload of malformed) {
    const result = validateWebhookPayload(WebhookContracts.aiCopilot, payload);
    assertEquals(result.success, false, `Fuzz failed: AI Copilot payload ${JSON.stringify(payload)} should have failed`);
  }
});
