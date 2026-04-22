import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TimelineSource = "delivery" | "dead_letter" | "alert";

export interface TimelineItem {
  ts: string;
  source: TimelineSource;
  kind: string;
  subscription_id: string;
  request_id: string | null;
  status: number | null;
  succeeded: boolean | null;
  attempt: number | null;
  duration_ms: number | null;
  event: string | null;
  message: string | null;
  ref_id: string;
  details: Record<string, unknown>;
}

export interface TimelineResponse {
  requestId: string;
  filters: {
    requestId: string | null;
    subscriptionId: string | null;
    since: string;
    limit: number;
  };
  count: number;
  items: TimelineItem[];
}

export interface TimelineFilters {
  requestId?: string | null;
  subscriptionId?: string | null;
  /** ISO timestamp lower bound. Defaults to now-7d server-side. */
  since?: string;
  limit?: number;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Loads a chronologically merged timeline of webhook deliveries, dead letters
 * and alerts filtered by requestId and/or subscriptionId. At least one filter
 * is required; the hook stays disabled until that is satisfied.
 */
export function useWebhookTimeline(filters: TimelineFilters) {
  const requestIdValid = !!filters.requestId && UUID_RE.test(filters.requestId);
  const subIdValid = !!filters.subscriptionId && UUID_RE.test(filters.subscriptionId);
  const enabled = requestIdValid || subIdValid;

  return useQuery<TimelineResponse>({
    queryKey: [
      "winloss-webhook-timeline",
      requestIdValid ? filters.requestId : null,
      subIdValid ? filters.subscriptionId : null,
      filters.since ?? null,
      filters.limit ?? null,
    ],
    enabled,
    staleTime: 15_000,
    queryFn: async () => {
      const body: Record<string, unknown> = {};
      if (requestIdValid) body.requestId = filters.requestId;
      if (subIdValid) body.subscriptionId = filters.subscriptionId;
      if (filters.since) body.since = filters.since;
      if (filters.limit) body.limit = filters.limit;

      const { data, error } = await supabase.functions.invoke<TimelineResponse>(
        "winloss-webhook-timeline",
        { body },
      );
      if (error) throw error;
      if (!data) throw new Error("Empty timeline response");
      return data;
    },
  });
}
