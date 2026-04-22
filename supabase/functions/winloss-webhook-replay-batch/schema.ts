import { z } from "https://esm.sh/zod@3.23.8";

/**
 * Body schema for `winloss-webhook-replay-batch`.
 *
 * Wraps `winloss-webhook-replay` with chunking + aggregated per-batch results.
 *
 * - `dead_letter_ids` XOR `delivery_ids` (1..MAX_BATCH_TOTAL UUIDs)
 * - `chunk_size` (optional, default 25, 1..MAX_CHUNK_SIZE)
 * - `stop_on_error` (optional, default false): if true, abort remaining chunks
 *   after the first chunk that fails to invoke (network/transport error).
 *   Per-item failures (HTTP 4xx/5xx from receiver) never abort.
 */

export const MAX_BATCH_TOTAL = 500;
export const MAX_CHUNK_SIZE = 50;
export const DEFAULT_CHUNK_SIZE = 25;

export const idArray = z.array(z.string().uuid()).min(1).max(MAX_BATCH_TOTAL);

const RawBodySchema = z.object({
  dead_letter_ids: z.array(z.string()).optional(),
  delivery_ids: z.array(z.string()).optional(),
  chunk_size: z.number().int().min(1).max(MAX_CHUNK_SIZE).optional(),
  stop_on_error: z.boolean().optional(),
});

export const BatchBodySchema = z.preprocess((raw) => {
  const parsed = RawBodySchema.safeParse(raw ?? {});
  if (!parsed.success) return raw;
  return parsed.data;
}, z.union([
  z.object({
    dead_letter_ids: idArray,
    delivery_ids: z.undefined(),
    chunk_size: z.number().int().min(1).max(MAX_CHUNK_SIZE).optional(),
    stop_on_error: z.boolean().optional(),
  }),
  z.object({
    dead_letter_ids: z.undefined(),
    delivery_ids: idArray,
    chunk_size: z.number().int().min(1).max(MAX_CHUNK_SIZE).optional(),
    stop_on_error: z.boolean().optional(),
  }),
]));

export type BatchBody = z.infer<typeof BatchBodySchema>;
