import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { CRMEventContract, LeadUpdateContract, AIAnalysisContract } from "../_shared/contracts.ts";
import { validateWebhookPayload } from "../_shared/webhook-validator.ts";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

// ─────────────────── CRM Event Contract ───────────────────

Deno.test("Contract: CRMEvent - valid payload", () => {
  const payload = {
    event_id: VALID_UUID,
    timestamp: new Date().toISOString(),
    source: "bitrix24",
    payload: { deal_id: 123 }
  };
  const result = validateWebhookPayload(CRMEventContract, payload);
  assertEquals(result.success, true);
  assertEquals(result.statusCode, 200);
});

Deno.test("Contract: CRMEvent - invalid UUID", () => {
  const payload = {
    event_id: "not-a-uuid",
    timestamp: new Date().toISOString(),
    source: "bitrix24",
    payload: {}
  };
  const result = validateWebhookPayload(CRMEventContract, payload);
  assertEquals(result.success, false);
  assertEquals(result.statusCode, 422);
  assert(result.details?.some((detail) => detail.field === "event_id"));
});

Deno.test("Contract: CRMEvent - invalid source enum", () => {
  const payload = {
    event_id: VALID_UUID,
    timestamp: new Date().toISOString(),
    source: "invalid_source",
    payload: {}
  };
  const result = validateWebhookPayload(CRMEventContract, payload);
  assertEquals(result.success, false);
  assertEquals(result.statusCode, 422);
  assert(result.details?.some((detail) => detail.field === "source"));
});

// ─────────────────── Lead Update Contract ───────────────────

Deno.test("Contract: LeadUpdate - valid", () => {
  const result = validateWebhookPayload(LeadUpdateContract, {
    lead_id: "L123",
    score: 85,
    status: "hot"
  });
  assertEquals(result.success, true);
});

Deno.test("Contract: LeadUpdate - invalid score range", () => {
  const result = validateWebhookPayload(LeadUpdateContract, {
    lead_id: "L123",
    score: 150 // Out of 0-100 range
  });
  assertEquals(result.success, false);
  assertEquals(result.statusCode, 422);
});

// ─────────────────── AI Analysis Contract ───────────────────

Deno.test("Contract: AIAnalysis - valid", () => {
  const result = validateWebhookPayload(AIAnalysisContract, {
    entity_id: "E1",
    entity_type: "deal",
    analysis_type: "sentiment"
  });
  assertEquals(result.success, true);
});

Deno.test("Contract: AIAnalysis - invalid entity_type", () => {
  const result = validateWebhookPayload(AIAnalysisContract, {
    entity_id: "E1",
    entity_type: "unknown_entity",
    analysis_type: "test"
  });
  assertEquals(result.success, false);
  assertEquals(result.statusCode, 422);
});
