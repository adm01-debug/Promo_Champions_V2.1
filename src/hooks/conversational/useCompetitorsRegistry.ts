import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CompetitorRegistry {
  id: string;
  owner_id: string | null;
  name: string;
  aliases: string[];
  default_battle_card_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCompetitorsRegistry() {
  return useQuery({
    queryKey: ["competitors-registry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitors_registry")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data as CompetitorRegistry[]) ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertCompetitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<CompetitorRegistry> & { name: string }) => {
      const payload = {
        id: input.id,
        name: input.name,
        aliases: input.aliases ?? [],
        default_battle_card_id: input.default_battle_card_id ?? null,
        is_active: input.is_active ?? true,
      };
      const { data, error } = await supabase
        .from("competitors_registry")
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as CompetitorRegistry;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["competitors-registry"] });
      toast.success("Competidor salvo");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });
}

export function useDeleteCompetitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("competitors_registry").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["competitors-registry"] });
      toast.success("Competidor removido");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover"),
  });
}
