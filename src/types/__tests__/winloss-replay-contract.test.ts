import { describe, it, expect } from "vitest";
import {
  ReplayResponseSchema,
  ReplayResultSchema,
  ReplaySummarySchema,
  ReplayErrorResponseSchema,
} from "@/types/winloss-replay-contract";

const UUID_A = "11111111-1111-4111-8111-111111111111";
const UUID_B = "22222222-2222-4222-8222-222222222222";

describe("winloss-webhook-replay response contract", () => {
  describe("ReplaySummarySchema", () => {
    it("accepts a zeroed summary", () => {
      expect(
        ReplaySummarySchema.safeParse({ total: 0, succeeded: 0, failed: 0, skipped: 0 }).success,
      ).toBe(true);
    });

    it("rejects negative counters", () => {
      expect(
        ReplaySummarySchema.safeParse({ total: -1, succeeded: 0, failed: 0, skipped: 0 }).success,
      ).toBe(false);
    });

    it("rejects missing fields", () => {
      expect(ReplaySummarySchema.safeParse({ total: 1, succeeded: 1 }).success).toBe(false);
    });
  });

  describe("ReplayResultSchema", () => {
    it("accepts a successful HTTP 200 result with attempts", () => {
      const r = ReplayResultSchema.safeParse({
        id: UUID_A,
        succeeded: true,
        status: 200,
        status_label: "succeeded",
        error: null,
        attempts: 1,
      });
      expect(r.success).toBe(true);
    });

    it("accepts a failure with non-null error string", () => {
      const r = ReplayResultSchema.safeParse({
        id: UUID_A,
        succeeded: false,
        status: 500,
        status_label: "failed",
        error: "Error: connection refused",
      });
      expect(r.success).toBe(true);
    });

    it("accepts a skipped delivery (already_succeeded)", () => {
      const r = ReplayResultSchema.safeParse({
        id: UUID_A,
        succeeded: false,
        status: 0,
        status_label: "skipped",
        error: "already_succeeded",
        skipped: true,
      });
      expect(r.success).toBe(true);
    });

    it("rejects unknown status_label values", () => {
      const r = ReplayResultSchema.safeParse({
        id: UUID_A,
        succeeded: false,
        status: 0,
        status_label: "retrying",
        error: null,
      });
      expect(r.success).toBe(false);
    });

    it("rejects non-uuid id", () => {
      const r = ReplayResultSchema.safeParse({
        id: "not-a-uuid",
        succeeded: true,
        status: 200,
        status_label: "succeeded",
        error: null,
      });
      expect(r.success).toBe(false);
    });

    it("requires error to be present (nullable, not optional)", () => {
      const r = ReplayResultSchema.safeParse({
        id: UUID_A,
        succeeded: true,
        status: 200,
        status_label: "succeeded",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("ReplayResponseSchema (full contract)", () => {
    it("accepts a realistic dlq replay response", () => {
      const r = ReplayResponseSchema.safeParse({
        requestId: "req_01HXYZ",
        source: "dlq",
        summary: { total: 2, succeeded: 1, failed: 1, skipped: 0 },
        results: [
          {
            id: UUID_A,
            succeeded: true,
            status: 200,
            status_label: "succeeded",
            error: null,
            attempts: 1,
          },
          {
            id: UUID_B,
            succeeded: false,
            status: 502,
            status_label: "failed",
            error: "Bad Gateway",
            attempts: 3,
          },
        ],
      });
      expect(r.success).toBe(true);
    });

    it("accepts a delivery replay with all skipped", () => {
      const r = ReplayResponseSchema.safeParse({
        requestId: "req_skip",
        source: "delivery",
        summary: { total: 1, succeeded: 0, failed: 0, skipped: 1 },
        results: [
          {
            id: UUID_A,
            succeeded: false,
            status: 0,
            status_label: "skipped",
            error: "already_succeeded",
            skipped: true,
          },
        ],
      });
      expect(r.success).toBe(true);
    });

    it("accepts an empty results array (no rows matched ids)", () => {
      const r = ReplayResponseSchema.safeParse({
        requestId: "req_empty",
        source: "dlq",
        summary: { total: 0, succeeded: 0, failed: 0, skipped: 0 },
        results: [],
      });
      expect(r.success).toBe(true);
    });

    it("rejects unknown source", () => {
      const r = ReplayResponseSchema.safeParse({
        requestId: "req",
        source: "queue",
        summary: { total: 0, succeeded: 0, failed: 0, skipped: 0 },
        results: [],
      });
      expect(r.success).toBe(false);
    });

    it("rejects missing requestId (frontend depends on it for toasts/audit)", () => {
      const r = ReplayResponseSchema.safeParse({
        source: "dlq",
        summary: { total: 0, succeeded: 0, failed: 0, skipped: 0 },
        results: [],
      });
      expect(r.success).toBe(false);
    });
  });

  describe("ReplayErrorResponseSchema", () => {
    it("accepts a 400 invalid_input shape", () => {
      const r = ReplayErrorResponseSchema.safeParse({
        error: "invalid_input",
        message: "Provide exactly one of dead_letter_ids or delivery_ids.",
        details: { fieldErrors: {}, formErrors: ["…"] },
        requestId: "req_400",
      });
      expect(r.success).toBe(true);
    });

    it("accepts a 401/403/500 minimal shape", () => {
      expect(
        ReplayErrorResponseSchema.safeParse({ error: "Unauthorized", requestId: "req_401" }).success,
      ).toBe(true);
      expect(
        ReplayErrorResponseSchema.safeParse({ error: "Forbidden", requestId: "req_403" }).success,
      ).toBe(true);
      expect(
        ReplayErrorResponseSchema.safeParse({ error: "boom", requestId: "req_500" }).success,
      ).toBe(true);
    });
  });
});
