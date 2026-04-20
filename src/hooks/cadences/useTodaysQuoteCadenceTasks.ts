import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TodaysQuoteCadenceTask {
  id: string;
  prospect_cadence_id: string;
  scheduled_date: string;
  status: string;
  prospect_cadence: {
    quote_id: string | null;
    salesperson_id: string;
    quote: { client_name: string; quote_number: string | null } | null;
  } | null;
}

/**
 * Returns pending cadence tasks scheduled for today that belong to quote cadences
 * (prospect_cadences.quote_id IS NOT NULL) for the current authenticated salesperson.
 */
export function useTodaysQuoteCadenceTasks() {
  return useQuery({
    queryKey: ["todays-quote-cadence-tasks"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return { count: 0, tasks: [] as TodaysQuoteCadenceTask[] };

      // Resolve salesperson id for current user
      const { data: sp } = await supabase
        .from("salespeople")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      const salespersonId = sp?.id;
      if (!salespersonId) return { count: 0, tasks: [] as TodaysQuoteCadenceTask[] };

      const today = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("cadence_tasks")
        .select(`
          id, prospect_cadence_id, scheduled_date, status,
          prospect_cadence:prospect_cadences!inner(
            quote_id, salesperson_id,
            quote:quotes(client_name, quote_number)
          )
        `)
        .eq("scheduled_date", today)
        .eq("status", "pending")
        .eq("prospect_cadence.salesperson_id", salespersonId)
        .not("prospect_cadence.quote_id", "is", null);

      if (error) throw error;

      const tasks = (data ?? []) as unknown as TodaysQuoteCadenceTask[];
      return { count: tasks.length, tasks };
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
