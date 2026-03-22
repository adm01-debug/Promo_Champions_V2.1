import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export const usePlaybookAdherence = () => {
  return useQuery({
    queryKey: ["playbook-adherence"],
    queryFn: async () => {
      const { data: progress, error: progressError } = await supabase
        .from("playbook_progress")
        .select("*");

      if (progressError) throw progressError;

      const { data: items, error: itemsError } = await supabase
        .from("playbook_items")
        .select("*");

      if (itemsError) throw itemsError;

      const totalItems = items?.length || 0;
      const completedItems = progress?.length || 0;

      // Group by playbook_item_id to find most/least completed
      const completionMap = new Map<string, number>();
      progress?.forEach((p) => {
        completionMap.set(p.playbook_item_id, (completionMap.get(p.playbook_item_id) || 0) + 1);
      });

      const itemCompletionRates = items?.map((item) => ({
        itemId: item.id,
        content: item.content,
        completions: completionMap.get(item.id) || 0,
      })) || [];

      const mostCompleted = [...itemCompletionRates].sort((a, b) => b.completions - a.completions).slice(0, 5);
      const leastCompleted = [...itemCompletionRates].sort((a, b) => a.completions - b.completions).slice(0, 5);

      return {
        totalItems,
        completedItems,
        overallRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        mostCompleted,
        leastCompleted,
      };
    },
  });
};
