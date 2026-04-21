import { z } from "https://esm.sh/zod@3.23.8";

/**
 * Body schema for `winloss-webhook-replay`.
 *
 * Accepts EXACTLY ONE of:
 *   - `dead_letter_ids: string[]` (1..50 UUIDs)  — replay from DLQ
 *   - `delivery_ids: string[]`    (1..50 UUIDs)  — replay from deliveries history
 *
 * Singular forms (`dead_letter_id`, `delivery_id`) are accepted as sugar and
 * normalized to single-element arrays before union validation.
 */
export const idArray = z.array(z.string().uuid()).min(1).max(50);

const RawBodySchema = z.object({
  dead_letter_ids: z.array(z.string()).optional(),
  dead_letter_id: z.string().optional(),
  delivery_ids: z.array(z.string()).optional(),
  delivery_id: z.string().optional(),
});

export const BodySchema = z.preprocess((raw) => {
  const parsed = RawBodySchema.safeParse(raw ?? {});
  if (!parsed.success) return raw;
  const v = parsed.data;
  const dlq = v.dead_letter_ids ?? (v.dead_letter_id ? [v.dead_letter_id] : undefined);
  const del = v.delivery_ids ?? (v.delivery_id ? [v.delivery_id] : undefined);
  return { dead_letter_ids: dlq, delivery_ids: del };
}, z.union([
  z.object({ dead_letter_ids: idArray, delivery_ids: z.undefined() }),
  z.object({ dead_letter_ids: z.undefined(), delivery_ids: idArray }),
]));

export type ReplayBody = z.infer<typeof BodySchema>;
