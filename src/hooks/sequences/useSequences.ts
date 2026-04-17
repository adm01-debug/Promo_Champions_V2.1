import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Sequence {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  channel_mix: string[];
  enabled: boolean;
  exit_on_reply: boolean;
  exit_on_meeting: boolean;
  send_time_optimization: boolean;
  auto_pause_on_reply: boolean;
  auto_pause_on_bounce: boolean;
  created_at: string;
  updated_at: string;
}

export function useSequences() {
  return useQuery({
    queryKey: ["sequences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sequences")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Sequence[];
    },
  });
}

export function useSequence(id: string | undefined) {
  return useQuery({
    queryKey: ["sequence", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("sequences")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Sequence | null;
    },
    enabled: !!id,
  });
}

export function useCreateSequence() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Pick<Sequence, "name" | "description"> & Partial<Pick<Sequence, "channel_mix" | "enabled">>) => {
      if (!user?.id) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("sequences")
        .insert({
          owner_id: user.id,
          name: input.name,
          description: input.description ?? null,
          channel_mix: input.channel_mix ?? [],
          enabled: input.enabled ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Sequence;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sequences"] });
      toast.success("Sequência criada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateSequence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Sequence> & { id: string }) => {
      const { data, error } = await supabase
        .from("sequences")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Sequence;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["sequences"] });
      qc.invalidateQueries({ queryKey: ["sequence", data.id] });
      toast.success("Sequência atualizada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSequence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sequences").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sequences"] });
      toast.success("Sequência removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
