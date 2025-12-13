import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NotificationPreference {
  id: string;
  email: string;
  is_active: boolean;
  frequency: "realtime" | "daily" | "weekly";
  notify_stagnant_deals: boolean;
  notify_inactive_clients: boolean;
  notify_at_risk_goals: boolean;
  stagnant_threshold_days: number;
  inactive_threshold_days: number;
  preferred_time: string;
  created_at: string;
  updated_at: string;
}

export type NotificationPreferenceInsert = Omit<NotificationPreference, "id" | "created_at" | "updated_at">;

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async (): Promise<NotificationPreference[]> => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as NotificationPreference[];
    },
  });
};

export const useCreateNotificationPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preference: NotificationPreferenceInsert) => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .insert(preference)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Preferência de notificação criada com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar preferência: " + error.message);
    },
  });
};

export const useUpdateNotificationPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NotificationPreference> & { id: string }) => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Preferência atualizada com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar preferência: " + error.message);
    },
  });
};

export const useDeleteNotificationPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notification_preferences")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Preferência removida com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover preferência: " + error.message);
    },
  });
};
