import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { updatePayload, insertPayload } from "@/lib/supabase/typed-payloads";

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  last_dispatch_at: string | null;
  last_status: number | null;
  created_at: string;
}

export function useWebhookSubscriptions() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["winloss-webhooks"],
    queryFn: async (): Promise<WebhookSubscription[]> => {
      const { data, error } = await supabase
        .from("winloss_webhook_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const create = useMutation({
    mutationFn: async ({ url, events }: { url: string; events: string[] }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("winloss_webhook_subscriptions")
        .insert(insertPayload("winloss_webhook_subscriptions", { url, events, created_by: auth.user.id }));
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["winloss-webhooks"] }); toast.success("Webhook criado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao criar"),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await (supabase as unknown as {
        from: (t: string) => {
          update: (p: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: Error | null }> };
        };
      })
        .from("winloss_webhook_subscriptions")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["winloss-webhooks"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as unknown as {
        from: (t: string) => {
          delete: () => { eq: (c: string, v: string) => Promise<{ error: Error | null }> };
        };
      })
        .from("winloss_webhook_subscriptions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["winloss-webhooks"] }); toast.success("Webhook removido"); },
  });

  return { list, create: create.mutate, toggle: toggle.mutate, remove: remove.mutate, isCreating: create.isPending };
}
