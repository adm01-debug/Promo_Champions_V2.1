import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ChannelKind = "whatsapp" | "sms";
export type ProviderKind = "twilio" | "meta_cloud" | "zapi" | "messagebird";

export interface ChannelCredential {
  id: string;
  owner_id: string;
  channel: ChannelKind;
  provider: ProviderKind;
  label: string | null;
  credentials: Record<string, string>;
  from_number: string | null;
  enabled: boolean;
  verified_at: string | null;
  created_at: string;
}

export const useChannelCredentials = () => {
  return useQuery({
    queryKey: ["channel-credentials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_credentials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ChannelCredential[];
    },
  });
};

export const useCreateChannelCredential = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      channel: ChannelKind;
      provider: ProviderKind;
      label?: string;
      from_number?: string;
      credentials: Record<string, string>;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("channel_credentials")
        .insert({
          owner_id: auth.user.id,
          channel: input.channel,
          provider: input.provider,
          label: input.label ?? null,
          from_number: input.from_number ?? null,
          credentials: input.credentials,
          enabled: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["channel-credentials"] });
      toast.success("Canal conectado");
    },
    onError: (e: Error) => toast.error(`Erro ao conectar: ${e.message}`),
  });
};

export const useToggleChannelCredential = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("channel_credentials")
        .update({ enabled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["channel-credentials"] }),
  });
};

export const useDeleteChannelCredential = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("channel_credentials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["channel-credentials"] });
      toast.success("Canal removido");
    },
  });
};

export const useTestChannelSend = () => {
  return useMutation({
    mutationFn: async (input: { channel: ChannelKind; to: string; body: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("send-multichannel-message", {
        body: {
          ownerId: auth.user.id,
          channel: input.channel,
          to: input.to,
          body: input.body,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: { ok?: boolean; error?: string } | null) => {
      if (data?.ok) toast.success("Mensagem de teste enviada");
      else toast.error(`Falha: ${data?.error ?? "desconhecido"}`);
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};
