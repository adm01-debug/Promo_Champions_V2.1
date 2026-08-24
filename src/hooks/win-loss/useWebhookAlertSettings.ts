import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WebhookAlertSettings {
  id: string;
  consecutive_failures: number;
  retry_rate_threshold: number;
  window_minutes: number;
  min_deliveries: number;
  suppress_minutes: number;
  max_attempts: number;
  updated_at: string;
}

export type WebhookAlertSettingsInput = Omit<WebhookAlertSettings, "id" | "updated_at">;

const QUERY_KEY = ["winloss-alert-settings"] as const;

/** Loads (and lets admins update) the singleton row with the alert thresholds. */
export function useWebhookAlertSettings() {
  const qc = useQueryClient();

  const query = useQuery<WebhookAlertSettings | null>({
    queryKey: QUERY_KEY,
    staleTime: 30_000,
    queryFn: async () => {
      // Cast: the auto-generated types module doesn't yet include this table.
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (c: string, v: boolean) => {
              maybeSingle: () => Promise<{ data: WebhookAlertSettings | null; error: Error | null }>;
            };
          };
        };
      })
        .from("winloss_alert_settings")
        .select("id, consecutive_failures, retry_rate_threshold, window_minutes, min_deliveries, suppress_minutes, max_attempts, updated_at")
        .eq("singleton", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (input: WebhookAlertSettingsInput) => {
      const id = query.data?.id;
      if (!id) throw new Error("Configurações não encontradas. Recarregue a página.");
      const { error } = await (supabase as unknown as {
        from: (t: string) => {
          update: (v: WebhookAlertSettingsInput) => {
            eq: (c: string, v: string) => Promise<{ error: Error | null }>;
          };
        };
      })
        .from("winloss_alert_settings")
        .update(input)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return { query, mutation };
}
