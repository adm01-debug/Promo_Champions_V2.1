import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PlaybookItem {
  id: string;
  playbook_id: string;
  content: string;
  item_order: number;
  is_required: boolean;
  item_type: string;
  created_at: string;
}

export interface Playbook {
  id: string;
  stage: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  items?: PlaybookItem[];
}

export interface PlaybookProgress {
  id: string;
  playbook_item_id: string;
  sale_id: string;
  completed_at: string;
  completed_by: string | null;
}

export const usePlaybooks = () => {
  return useQuery({
    queryKey: ["playbooks"],
    queryFn: async () => {
      const { data: playbooks, error: playbooksError } = await supabase
        .from("playbooks")
        .select("*")
        .order("stage");

      if (playbooksError) throw playbooksError;

      const { data: items, error: itemsError } = await supabase
        .from("playbook_items")
        .select("*")
        .order("item_order");

      if (itemsError) throw itemsError;

      // Group items by playbook
      const playbooksWithItems = (playbooks as Playbook[]).map((playbook) => ({
        ...playbook,
        items: (items as PlaybookItem[]).filter((item) => item.playbook_id === playbook.id),
      }));

      return playbooksWithItems;
    },
  });
};

export const usePlaybooksByStage = (stage: string) => {
  return useQuery({
    queryKey: ["playbooks", stage],
    queryFn: async () => {
      const { data: playbooks, error: playbooksError } = await supabase
        .from("playbooks")
        .select("*")
        .eq("stage", stage);

      if (playbooksError) throw playbooksError;

      if (!playbooks || playbooks.length === 0) return [];

      const playbookIds = playbooks.map((p) => p.id);

      const { data: items, error: itemsError } = await supabase
        .from("playbook_items")
        .select("*")
        .in("playbook_id", playbookIds)
        .order("item_order");

      if (itemsError) throw itemsError;

      return (playbooks as Playbook[]).map((playbook) => ({
        ...playbook,
        items: (items as PlaybookItem[]).filter((item) => item.playbook_id === playbook.id),
      }));
    },
    enabled: !!stage,
  });
};

export const useDealPlaybookProgress = (saleId: string) => {
  return useQuery({
    queryKey: ["playbook-progress", saleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playbook_progress")
        .select("*")
        .eq("sale_id", saleId);

      if (error) throw error;
      return data as PlaybookProgress[];
    },
    enabled: !!saleId,
  });
};

export const useTogglePlaybookItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      saleId,
      isCompleted,
    }: {
      itemId: string;
      saleId: string;
      isCompleted: boolean;
    }) => {
      if (isCompleted) {
        // Remove progress
        const { error } = await supabase
          .from("playbook_progress")
          .delete()
          .eq("playbook_item_id", itemId)
          .eq("sale_id", saleId);

        if (error) throw error;
      } else {
        // Add progress
        const { error } = await supabase.from("playbook_progress").insert({
          playbook_item_id: itemId,
          sale_id: saleId,
        });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["playbook-progress", variables.saleId] });
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error("Error toggling playbook item:", error);
      }
      toast.error("Erro ao atualizar checklist");
    },
  });
};

export const useCreatePlaybook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playbook: { stage: string; title: string; description?: string }) => {
      const { data, error } = await supabase
        .from("playbooks")
        .insert(playbook)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast.success("Playbook criado com sucesso");
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error("Error creating playbook:", error);
      }
      toast.error("Erro ao criar playbook");
    },
  });
};

export const useCreatePlaybookItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: {
      playbook_id: string;
      content: string;
      item_order: number;
      is_required?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("playbook_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast.success("Item adicionado ao playbook");
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error("Error creating playbook item:", error);
      }
      toast.error("Erro ao adicionar item");
    },
  });
};

export const useDeletePlaybookItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("playbook_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast.success("Item removido do playbook");
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error("Error deleting playbook item:", error);
      }
      toast.error("Erro ao remover item");
    },
  });
};
