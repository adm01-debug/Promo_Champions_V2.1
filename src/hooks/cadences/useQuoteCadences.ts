import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuoteCadenceRow {
  id: string;
  quote_id: string;
  cadence_id: string;
  status: string;
  current_step: number;
  next_action_date: string | null;
  started_at: string;
  completed_at: string | null;
  cadence: { name: string; cadence_type: string } | null;
  quote: {
    id: string;
    client_name: string;
    total_value: number;
    status: string;
    sent_at: string | null;
    seller_name: string | null;
    quote_number: string | null;
  } | null;
}

export function useQuoteCadences(quoteId?: string) {
  return useQuery({
    queryKey: ["quote-cadences", quoteId ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("prospect_cadences")
        .select(`
          id, quote_id, cadence_id, status, current_step, next_action_date, started_at, completed_at,
          cadence:cadences(name, cadence_type),
          quote:quotes(id, client_name, total_value, status, sent_at, seller_name, quote_number)
        `)
        .not("quote_id", "is", null)
        .order("started_at", { ascending: false });

      if (quoteId) query = query.eq("quote_id", quoteId);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as QuoteCadenceRow[];
    },
  });
}

export function useQuoteCadenceStats() {
  return useQuery({
    queryKey: ["quote-cadence-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);

      const [{ count: active }, { count: completedTasksToday }, { data: convertedRows }, { count: overdue }] = await Promise.all([
        supabase
          .from("prospect_cadences")
          .select("id", { count: "exact", head: true })
          .not("quote_id", "is", null)
          .eq("status", "active"),
        supabase
          .from("cadence_tasks")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("completed_at", `${today}T00:00:00`)
          .lte("completed_at", `${today}T23:59:59`),
        supabase
          .from("prospect_cadences")
          .select("id, quote:quotes(status)")
          .not("quote_id", "is", null)
          .in("status", ["completed", "cancelled"]),
        supabase
          .from("prospect_cadences")
          .select("id", { count: "exact", head: true })
          .not("quote_id", "is", null)
          .eq("status", "active")
          .lt("next_action_date", today),
      ]);

      const finished = convertedRows ?? [];
      const won = finished.filter((r) => {
        const q = r.quote as { status?: string } | null;
        return q?.status === "approved";
      }).length;
      const conversionRate = finished.length > 0 ? Math.round((won / finished.length) * 100) : 0;

      return {
        activeFollowUps: active ?? 0,
        tasksCompletedToday: completedTasksToday ?? 0,
        conversionRate,
        overdueCount: overdue ?? 0,
      };
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useEnrollQuoteInCadence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { quote_id: string; cadence_id: string }) => {
      const { data, error } = await supabase.rpc("enroll_quote_in_cadence", {
        _quote_id: input.quote_id,
        _cadence_id: input.cadence_id,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-cadences"] });
      queryClient.invalidateQueries({ queryKey: ["quote-cadence-stats"] });
      queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
      toast.success("Follow-up de orçamento iniciado!");
    },
    onError: (err: Error & { code?: string }) => {
      if (err.code === "23505") {
        toast.error("Este orçamento já está em uma cadência ativa");
      } else {
        toast.error("Erro ao iniciar follow-up");
        if (import.meta.env.DEV) console.error(err);
      }
    },
  });
}
