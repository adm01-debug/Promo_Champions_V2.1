import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { WinLossFilterState } from "@/components/win-loss/winLossFiltersHelpers";

const ENTITY = "win_loss";

export interface SavedView {
  id: string;
  name: string;
  filters: WinLossFilterState;
  is_default: boolean;
  created_at: string;
}

export const useWinLossSavedViews = () => {
  return useQuery({
    queryKey: ["wl-saved-views"],
    queryFn: async (): Promise<SavedView[]> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await supabase
        .from("saved_filters")
        .select("id,name,filters,is_default,created_at")
        .eq("user_id", u.user.id)
        .eq("entity_type", ENTITY)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(d => ({
        id: d.id,
        name: d.name,
        filters: d.filters as unknown as WinLossFilterState,
        is_default: d.is_default ?? false,
        created_at: d.created_at,
      }));
    },
    staleTime: 60_000,
  });
};

export const useSaveWinLossView = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, filters, makeDefault }: { name: string; filters: WinLossFilterState; makeDefault?: boolean }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      if (makeDefault) {
        await supabase
          .from("saved_filters")
          .update({ is_default: false })
          .eq("user_id", u.user.id)
          .eq("entity_type", ENTITY);
      }
      const { error } = await supabase.from("saved_filters").insert({
        user_id: u.user.id,
        entity_type: ENTITY,
        name,
        filters: filters as unknown as Record<string, unknown>,
        is_default: !!makeDefault,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Visão salva");
      qc.invalidateQueries({ queryKey: ["wl-saved-views"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar visão"),
  });
};

export const useDeleteWinLossView = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_filters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Visão removida");
      qc.invalidateQueries({ queryKey: ["wl-saved-views"] });
    },
  });
};
