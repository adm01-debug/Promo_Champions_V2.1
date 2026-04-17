import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BestSendWindow {
  contact_id: string;
  contact_type: string;
  hour_of_day: number;
  day_of_week: number;
  opens: number;
  clicks: number;
  replies: number;
  score: number;
  rank: number;
}

export function useContactSendProfile(
  contactId: string | undefined,
  contactType: "lead" | "client" | undefined,
) {
  return useQuery({
    queryKey: ["contact-best-send-window", contactId, contactType],
    queryFn: async () => {
      if (!contactId || !contactType) return [];
      const { data, error } = await supabase
        .from("contact_best_send_window")
        .select("*")
        .eq("contact_id", contactId)
        .eq("contact_type", contactType)
        .order("rank", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BestSendWindow[];
    },
    enabled: !!contactId && !!contactType,
  });
}

export function useToggleSendTimeOptimization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from("sequences")
        .update({ send_time_optimization: enabled })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["sequences"] });
      qc.invalidateQueries({ queryKey: ["sequence", data.id] });
      toast.success(data.send_time_optimization ? "STO ativado" : "STO desativado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
