import { z } from "https://esm.sh/zod@3.23.8";

/**
 * Input schema for `winloss-webhook-dispatcher`.
 *
 * Validates the dispatch payload BEFORE fan-out so we never:
 *  - send empty / non-string events to subscribers,
 *  - look up subscriptions with a malformed UUID,
 *  - propagate a non-UUID `__request_id` as the correlation id.
 *
 * The payload is intentionally permissive (`passthrough`) because subscribers
 * receive the full JSON body — only the dispatcher-reserved fields are typed.
 *
 * Reserved fields (all optional, all double-underscored):
 *  - `event`                       → string, 1..200 chars (REQUIRED)
 *  - `__target_subscription_id`    → UUID; restricts fan-out to one subscriber
 *  - `__replay_of`                 → UUID; marks this dispatch as a DLQ replay
 *  - `__request_id`                → UUID; inbound correlation id (overrides header)
 */
const UUID = z.string().uuid();

export const DispatcherPayloadSchema = z
  .object({
    event: z
      .string({ required_error: "event required" })
      .trim()
      .min(1, "event required")
      .max(200, "event too long")
      // event names should look like "winloss.deal.lost" / "ping" / "deal_won"
      .regex(/^[a-z0-9][a-z0-9._-]{0,199}$/i, "event must match [a-z0-9._-]"),
    __target_subscription_id: UUID.optional(),
    __replay_of: UUID.optional(),
    __request_id: UUID.optional(),
  })
  .passthrough();

export type DispatcherPayload = z.infer<typeof DispatcherPayloadSchema>;
