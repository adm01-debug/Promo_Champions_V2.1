import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import { updatePayload, insertPayload } from "@/lib/supabase/typed-payloads";

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  headers: Record<string, string> | null;
  is_active: boolean;
  failure_count: number;
  last_triggered_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: unknown;
  response_status: number | null;
  response_body: string | null;
  error_message: string | null;
  attempts: number;
  success: boolean;
  duration_ms: number | null;
  created_at: string;
}

export const WEBHOOK_EVENTS = [
  { value: "deal.created", label: "Deal Criado" },
  { value: "deal.updated", label: "Deal Atualizado" },
  { value: "deal.won", label: "Deal Ganho 🏆" },
  { value: "deal.lost", label: "Deal Perdido" },
  { value: "deal.stage_changed", label: "Deal Mudou de Estágio" },
  { value: "client.created", label: "Cliente Criado" },
  { value: "task.completed", label: "Tarefa Concluída" },
  { value: "approval.requested", label: "Aprovação Solicitada" },
  { value: "approval.decided", label: "Aprovação Decidida" },
];

export function useWebhooks() {
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Webhook[];
    },
  });
}

export function useWebhookDeliveries(webhookId?: string) {
  return useQuery({
    queryKey: ["webhook-deliveries", webhookId],
    queryFn: async () => {
      let q = supabase
        .from("webhook_deliveries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (webhookId) q = q.eq("webhook_id", webhookId);
      const { data, error } = await q;
      if (error) throw error;
      return data as WebhookDelivery[];
    },
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: Partial<Webhook>) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("webhooks")
        .insert(insertPayload("webhooks", {
          name: params.name ?? "Webhook",
          url: params.url ?? "",
          events: params.events ?? [],
          secret: params.secret,
          headers: params.headers as Json | undefined,
          is_active: params.is_active,
          created_by: user.id,
        }))
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook criado!");
    },
    onError: () => toast.error("Erro ao criar webhook"),
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Webhook> & { id: string }) => {
      const { error } = await supabase.from("webhooks").update(updates as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook atualizado");
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("webhooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook removido");
    },
  });
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: async (webhook_id: string) => {
      const { data, error } = await supabase.functions.invoke("dispatch-webhook", {
        body: {
          webhook_id,
          event_type: "test.ping",
          payload: { message: "Webhook de teste do Promo Champions", at: new Date().toISOString() },
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: { dispatched?: number; results?: Array<{ success: boolean }> }) => {
      const ok = data?.results?.[0]?.success;
      if (ok) toast.success("Webhook entregue com sucesso! ✅");
      else toast.error("Webhook falhou na entrega");
    },
    onError: () => toast.error("Erro ao testar webhook"),
  });
}
