import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        const { error } = await supabase
          .from("playbook_progress")
          .delete()
          .eq("playbook_item_id", itemId)
          .eq("sale_id", saleId);
        if (error) throw error;
      } else {
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
      if (import.meta.env.DEV) console.error("Error toggling playbook item:", error);
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
      if (import.meta.env.DEV) console.error("Error creating playbook:", error);
      toast.error("Erro ao criar playbook");
    },
  });
};

export const useDuplicatePlaybook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playbookId: string) => {
      // Fetch original
      const { data: original, error: fetchError } = await supabase
        .from("playbooks")
        .select("*")
        .eq("id", playbookId)
        .single();
      if (fetchError) throw fetchError;

      // Create copy
      const { data: newPlaybook, error: createError } = await supabase
        .from("playbooks")
        .insert({
          stage: original.stage,
          title: `${original.title} (Cópia)`,
          description: original.description,
        })
        .select()
        .single();
      if (createError) throw createError;

      // Copy items
      const { data: items, error: itemsError } = await supabase
        .from("playbook_items")
        .select("*")
        .eq("playbook_id", playbookId)
        .order("item_order");
      if (itemsError) throw itemsError;

      if (items && items.length > 0) {
        const newItems = items.map((item) => ({
          playbook_id: newPlaybook.id,
          content: item.content,
          item_order: item.item_order,
          is_required: item.is_required,
          item_type: item.item_type,
        }));
        const { error: insertError } = await supabase.from("playbook_items").insert(newItems);
        if (insertError) throw insertError;
      }

      return newPlaybook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast.success("Playbook duplicado com sucesso");
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error("Error duplicating playbook:", error);
      toast.error("Erro ao duplicar playbook");
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
      if (import.meta.env.DEV) console.error("Error creating playbook item:", error);
      toast.error("Erro ao adicionar item");
    },
  });
};

export const useUpdatePlaybookItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content, is_required }: { id: string; content: string; is_required?: boolean }) => {
      const updates: Record<string, unknown> = { content };
      if (is_required !== undefined) updates.is_required = is_required;

      const { error } = await supabase
        .from("playbook_items")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast.success("Item atualizado");
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error("Error updating playbook item:", error);
      toast.error("Erro ao atualizar item");
    },
  });
};

export const useReorderPlaybookItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; item_order: number }[]) => {
      const promises = items.map((item) =>
        supabase
          .from("playbook_items")
          .update({ item_order: item.item_order })
          .eq("id", item.id)
      );
      const results = await Promise.all(promises);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error("Error reordering items:", error);
      toast.error("Erro ao reordenar itens");
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
      if (import.meta.env.DEV) console.error("Error deleting playbook item:", error);
      toast.error("Erro ao remover item");
    },
  });
};
