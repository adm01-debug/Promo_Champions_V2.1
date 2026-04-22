import { z } from "zod";

/**
 * Shared response contract for the `winloss-webhook-replay` edge function.
 *
 * Mirrors the JSON shape returned by `supabase/functions/winloss-webhook-replay/index.ts`
 * so the frontend hooks (`useWebhookDeadLetters`, `useAsyncReplayQueue`,
 * `ReplayStatusByIdPanel`) and the edge function never drift apart.
 *
 * If the edge function ever changes its response shape, these schemas are the
 * single source of truth that must be updated together — and the contract tests
 * in `__tests__/replay-contract.test.ts` will fail loudly until they are.
 */

export const StatusLabelSchema = z.enum(["succeeded", "failed", "skipped"]);

export const ReplayResultSchema = z.object({
  id: z.string().uuid(),
  succeeded: z.boolean(),
  status: z.number().int(),
  status_label: StatusLabelSchema,
  error: z.string().nullable(),
  attempts: z.number().int().optional(),
  skipped: z.boolean().optional(),
});

export const ReplaySummarySchema = z.object({
  total: z.number().int().nonnegative(),
  succeeded: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
});

export const ReplayResponseSchema = z.object({
  requestId: z.string().min(1),
  source: z.enum(["dlq", "delivery"]),
  summary: ReplaySummarySchema,
  results: z.array(ReplayResultSchema),
});

export const ReplayErrorResponseSchema = z.object({
  error: z.string(),
  requestId: z.string().min(1),
  message: z.string().optional(),
  details: z.unknown().optional(),
});

export type ReplayResult = z.infer<typeof ReplayResultSchema>;
export type ReplaySummary = z.infer<typeof ReplaySummarySchema>;
export type ReplayResponse = z.infer<typeof ReplayResponseSchema>;
